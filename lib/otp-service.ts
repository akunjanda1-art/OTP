import "server-only";
import { db } from "./db";
import { generateOtp, generateRequestId, hashOtp, verifyOtpHash } from "./otp";
import { normalizePhone, isValidPhone } from "./phone";
import {
  debitWallet,
  refundWallet,
  channelToWalletKey,
  type ChannelKey,
} from "./wallet";
import { getProvider } from "./providers";
import { rateLimit, RATE_LIMITS } from "./rate-limit";
import type { OtpChannel } from "@prisma/client";

const OTP_EXPIRY_MIN = Number(process.env.OTP_EXPIRY_MINUTES ?? 5);
const OTP_MAX_ATTEMPT = Number(process.env.OTP_MAX_ATTEMPTS ?? 3);
const RESEND_COOLDOWN_SEC = Number(
  process.env.OTP_RESEND_COOLDOWN_SECONDS ?? 60,
);

export type SendOtpInput = {
  clientId: string;
  apiKeyId?: string | null;
  phone: string;
  channel: OtpChannel;
  purpose: string;
  callbackUrl?: string;
  ipAddress?: string;
  userAgent?: string;
};

export type ServiceError = {
  ok: false;
  code:
    | "VALIDATION_ERROR"
    | "INSUFFICIENT_BALANCE"
    | "RATE_LIMITED"
    | "OTP_NOT_FOUND"
    | "OTP_EXPIRED"
    | "INVALID_OTP"
    | "MAX_ATTEMPT_REACHED"
    | "PROVIDER_ERROR"
    | "CHANNEL_NOT_AVAILABLE";
  message: string;
  extra?: Record<string, unknown>;
};

export type ServiceOk<T> = { ok: true; data: T };
export type ServiceResult<T> = ServiceOk<T> | ServiceError;

function buildMessage(otp: string, purpose: string) {
  return `Kode OTP Anda: ${otp}. Berlaku ${OTP_EXPIRY_MIN} menit. Jangan bagikan kode ini ke siapapun. (purpose: ${purpose})`;
}

export async function sendOtp(
  input: SendOtpInput,
): Promise<ServiceResult<{
  requestId: string;
  phone: string;
  channel: OtpChannel;
  status: string;
  expiresIn: number;
}>> {
  const phone = normalizePhone(input.phone);
  if (!isValidPhone(phone)) {
    return { ok: false, code: "VALIDATION_ERROR", message: "Nomor tidak valid" };
  }

  const rlPhone = rateLimit(
    `phone:${phone}:${input.purpose}`,
    RATE_LIMITS.perPhonePer10min,
    10 * 60 * 1000,
  );
  if (!rlPhone.allowed) {
    return {
      ok: false,
      code: "RATE_LIMITED",
      message: "Terlalu banyak permintaan untuk nomor ini",
      extra: { retry_after: rlPhone.retryAfterSec },
    };
  }

  await db.otpRequest.updateMany({
    where: {
      clientId: input.clientId,
      phoneNormalized: phone,
      purpose: input.purpose,
      status: { in: ["pending", "queued", "sent"] },
    },
    data: { status: "expired" },
  });

  const otp = generateOtp();
  const requestId = generateRequestId();
  const salt = `${input.clientId}:${phone}:${input.purpose}:${requestId}`;
  const otpHash = hashOtp(otp, salt);
  const expiredAt = new Date(Date.now() + OTP_EXPIRY_MIN * 60 * 1000);

  const channelKey: ChannelKey = channelToWalletKey(input.channel);

  const created = await db.otpRequest.create({
    data: {
      clientId: input.clientId,
      apiKeyId: input.apiKeyId ?? null,
      requestId,
      phone: input.phone,
      phoneNormalized: phone,
      channel: input.channel,
      purpose: input.purpose,
      otpHash,
      status: "queued",
      deliveryStatus: "queued",
      maxAttempt: OTP_MAX_ATTEMPT,
      expiredAt,
      callbackUrl: input.callbackUrl,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      logs: { create: [{ event: "created" }, { event: "queued" }] },
    },
  });

  // Debit balance
  try {
    await debitWallet({
      clientId: input.clientId,
      channel: channelKey,
      amount: 1,
      referenceType: "otp_request",
      referenceId: created.id,
      description: `OTP ${input.channel} to ${phone}`,
    });
  } catch {
    await db.otpRequest.update({
      where: { id: created.id },
      data: { status: "failed", deliveryStatus: "failed" },
    });
    return { ok: false, code: "INSUFFICIENT_BALANCE", message: "Saldo tidak cukup" };
  }

  const provider = getProvider(input.channel);
  if (!provider) {
    await db.otpRequest.update({
      where: { id: created.id },
      data: { status: "failed", deliveryStatus: "failed" },
    });
    await refundWallet({
      clientId: input.clientId,
      channel: channelKey,
      amount: 1,
      referenceType: "otp_request",
      referenceId: created.id,
      description: `Refund: channel ${input.channel} unavailable`,
    });
    return {
      ok: false,
      code: "CHANNEL_NOT_AVAILABLE",
      message: `Channel ${input.channel} tidak tersedia`,
    };
  }

  const result = await provider.send(input.channel, phone, buildMessage(otp, input.purpose));

  if (!result.success) {
    await refundWallet({
      clientId: input.clientId,
      channel: channelKey,
      amount: 1,
      referenceType: "otp_request",
      referenceId: created.id,
      description: `Refund: provider failed (${result.errorCode ?? "unknown"})`,
    });
    await db.otpRequest.update({
      where: { id: created.id },
      data: {
        status: "failed",
        deliveryStatus: "failed",
        providerName: provider.name,
        providerResponse: result.raw as object,
        logs: { create: { event: "failed", message: result.errorMessage ?? "" } },
      },
    });
    return {
      ok: false,
      code: "PROVIDER_ERROR",
      message: result.errorMessage ?? "Provider gagal mengirim",
    };
  }

  await db.otpRequest.update({
    where: { id: created.id },
    data: {
      status: "sent",
      deliveryStatus: "sent",
      sentAt: new Date(),
      providerName: provider.name,
      providerMessageId: result.providerMessageId,
      providerResponse: result.raw as object,
      logs: { create: { event: "sent" } },
    },
  });

  return {
    ok: true,
    data: {
      requestId,
      phone,
      channel: input.channel,
      status: "sent",
      expiresIn: OTP_EXPIRY_MIN * 60,
    },
  };
}

export type VerifyOtpInput = {
  clientId: string;
  phone: string;
  purpose: string;
  otp: string;
};

export async function verifyOtp(
  input: VerifyOtpInput,
): Promise<
  ServiceResult<{ verified: true; verifiedAt: Date; requestId: string }>
> {
  const phone = normalizePhone(input.phone);
  const row = await db.otpRequest.findFirst({
    where: {
      clientId: input.clientId,
      phoneNormalized: phone,
      purpose: input.purpose,
      status: { in: ["queued", "sent"] },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!row) return { ok: false, code: "OTP_NOT_FOUND", message: "OTP tidak ditemukan" };

  if (row.expiredAt < new Date()) {
    await db.otpRequest.update({
      where: { id: row.id },
      data: { status: "expired", logs: { create: { event: "expired" } } },
    });
    return { ok: false, code: "OTP_EXPIRED", message: "OTP sudah kadaluarsa" };
  }

  if (row.attemptCount >= row.maxAttempt) {
    return {
      ok: false,
      code: "MAX_ATTEMPT_REACHED",
      message: "Percobaan verifikasi habis",
    };
  }

  const salt = `${row.clientId}:${row.phoneNormalized}:${row.purpose}:${row.requestId}`;
  const match = verifyOtpHash(input.otp, salt, row.otpHash);

  if (!match) {
    const next = row.attemptCount + 1;
    await db.otpRequest.update({
      where: { id: row.id },
      data: {
        attemptCount: next,
        logs: { create: { event: "failed", message: "invalid otp" } },
      },
    });
    return {
      ok: false,
      code: "INVALID_OTP",
      message: "OTP salah",
      extra: { remaining_attempts: row.maxAttempt - next },
    };
  }

  const verifiedAt = new Date();
  await db.otpRequest.update({
    where: { id: row.id },
    data: {
      status: "verified",
      verifiedAt,
      logs: { create: { event: "verified" } },
    },
  });

  return { ok: true, data: { verified: true, verifiedAt, requestId: row.requestId } };
}

export async function resendOtp(input: {
  clientId: string;
  phone: string;
  purpose: string;
  channel: OtpChannel;
  apiKeyId?: string | null;
}): Promise<ServiceResult<{ requestId: string; expiresIn: number }>> {
  const phone = normalizePhone(input.phone);
  const last = await db.otpRequest.findFirst({
    where: {
      clientId: input.clientId,
      phoneNormalized: phone,
      purpose: input.purpose,
    },
    orderBy: { createdAt: "desc" },
  });

  if (last) {
    const since = (Date.now() - last.createdAt.getTime()) / 1000;
    if (since < RESEND_COOLDOWN_SEC) {
      return {
        ok: false,
        code: "RATE_LIMITED",
        message: "Cooldown belum habis",
        extra: { retry_after: Math.ceil(RESEND_COOLDOWN_SEC - since) },
      };
    }
  }

  const result = await sendOtp({
    clientId: input.clientId,
    apiKeyId: input.apiKeyId,
    phone: input.phone,
    purpose: input.purpose,
    channel: input.channel,
  });

  if (!result.ok) return result;
  return {
    ok: true,
    data: { requestId: result.data.requestId, expiresIn: result.data.expiresIn },
  };
}

export async function getOtpStatus(clientId: string, requestId: string) {
  return db.otpRequest.findFirst({
    where: { clientId, requestId },
    select: {
      requestId: true,
      phoneNormalized: true,
      channel: true,
      status: true,
      deliveryStatus: true,
      verifiedAt: true,
      createdAt: true,
      expiredAt: true,
    },
  });
}
