import "server-only";
import { db } from "./db";
import type { OtpChannel, WalletTxType, Prisma } from "@prisma/client";

/**
 * Wallet service (PRD §11.2).
 * Semua mutasi saldo wajib melalui service ini supaya atomic & tercatat di
 * tabel wallet_transactions.
 */

export type ChannelKey = "sms" | "whatsapp" | "email" | "voice" | "general";

export class WalletError extends Error {
  code: "INSUFFICIENT_BALANCE";
  constructor(code: "INSUFFICIENT_BALANCE", message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

function fieldFor(
  channel: ChannelKey | OtpChannel | null | undefined,
): "smsCredit" | "whatsappCredit" | "generalCredit" {
  if (channel === "sms") return "smsCredit";
  if (channel === "whatsapp") return "whatsappCredit";
  // email & voice & general → general credit
  return "generalCredit";
}

export function channelToWalletKey(c: OtpChannel | string): ChannelKey {
  if (c === "sms") return "sms";
  if (c === "whatsapp") return "whatsapp";
  if (c === "email") return "email";
  if (c === "voice") return "voice";
  return "general";
}

export async function ensureWallet(clientId: string) {
  const existing = await db.wallet.findUnique({ where: { clientId } });
  if (existing) return existing;
  return db.wallet.create({ data: { clientId } });
}

// Alias for older callers
export const getOrCreateWallet = ensureWallet;

export async function hasSufficientBalance(
  clientId: string,
  channel: OtpChannel | ChannelKey,
  amount: number,
): Promise<boolean> {
  const wallet = await db.wallet.findUnique({ where: { clientId } });
  if (!wallet) return false;
  const field = fieldFor(channel as ChannelKey);
  return wallet[field] >= amount;
}

export type MoveBalanceInput = {
  clientId: string;
  amount: number;
  type: WalletTxType; // credit | debit | refund | adjustment
  channel?: OtpChannel | ChannelKey | null;
  referenceType?: string;
  referenceId?: string;
  description?: string;
};

/**
 * Atomic balance movement. Throws WalletError("INSUFFICIENT_BALANCE") if debit
 * would go below zero.
 */
export async function moveBalance(input: MoveBalanceInput) {
  if (input.amount <= 0) throw new Error("amount must be positive");
  const field = fieldFor((input.channel ?? "general") as ChannelKey);
  const channelEnum: OtpChannel | null =
    input.channel === "sms" ||
    input.channel === "whatsapp" ||
    input.channel === "email" ||
    input.channel === "voice"
      ? (input.channel as OtpChannel)
      : null;

  return db.$transaction(async (tx) => {
    const wallet =
      (await tx.wallet.findUnique({ where: { clientId: input.clientId } })) ??
      (await tx.wallet.create({ data: { clientId: input.clientId } }));

    const balanceBefore = wallet[field];
    let balanceAfter = balanceBefore;

    if (input.type === "debit") {
      if (balanceBefore < input.amount) {
        throw new WalletError("INSUFFICIENT_BALANCE");
      }
      balanceAfter = balanceBefore - input.amount;
    } else {
      // credit, refund, adjustment → add
      balanceAfter = balanceBefore + input.amount;
    }

    await tx.wallet.update({
      where: { clientId: input.clientId },
      data: { [field]: balanceAfter } as Prisma.WalletUpdateInput,
    });

    await tx.walletTransaction.create({
      data: {
        clientId: input.clientId,
        type: input.type,
        channel: channelEnum,
        amount: input.amount,
        balanceBefore,
        balanceAfter,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        description: input.description,
      },
    });

    return { balanceBefore, balanceAfter };
  });
}

// Convenience helpers
export async function creditWallet(
  params: Omit<MoveBalanceInput, "type"> & { type?: WalletTxType },
) {
  return moveBalance({ ...params, type: params.type ?? "credit" });
}

export async function debitWallet(params: Omit<MoveBalanceInput, "type">) {
  return moveBalance({ ...params, type: "debit" });
}

export async function refundWallet(params: Omit<MoveBalanceInput, "type">) {
  return moveBalance({ ...params, type: "refund" });
}

export function getChannelPrice(channel: OtpChannel | string): number {
  if (channel === "sms") return Number(process.env.DEFAULT_SMS_PRICE ?? 1);
  if (channel === "whatsapp")
    return Number(process.env.DEFAULT_WHATSAPP_PRICE ?? 1);
  if (channel === "email") return Number(process.env.DEFAULT_EMAIL_PRICE ?? 1);
  if (channel === "voice") return Number(process.env.DEFAULT_VOICE_PRICE ?? 2);
  return 1;
}
