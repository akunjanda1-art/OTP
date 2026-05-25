/**
 * OTP Provider Interface — PRD §12.1
 * Semua provider (SMS / WhatsApp / Email / Voice) wajib implement kontrak ini.
 */

export type ProviderChannel = "sms" | "whatsapp" | "email" | "voice";

export interface ProviderResponse {
  success: boolean;
  providerMessageId: string | null;
  status: "queued" | "sent" | "delivered" | "failed" | "unknown";
  errorCode: string | null;
  errorMessage: string | null;
  raw: Record<string, unknown>;
}

export interface ProviderStatusResponse {
  providerMessageId: string;
  status: "queued" | "sent" | "delivered" | "failed" | "unknown";
  deliveredAt: Date | null;
  raw: Record<string, unknown>;
}

export interface OtpProvider {
  name: string;
  supports(channel: ProviderChannel): boolean;
  send(
    channel: ProviderChannel,
    phoneOrAddress: string,
    message: string,
    meta?: Record<string, unknown>,
  ): Promise<ProviderResponse>;
  getStatus(providerMessageId: string): Promise<ProviderStatusResponse>;
}
