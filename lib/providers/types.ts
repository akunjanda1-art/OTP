/**
 * Provider abstraction (PRD §12).
 * All concrete providers must implement OtpProviderInterface so the core
 * OTP service stays decoupled from any vendor (Twilio, Fonnte, Wablas, ...).
 */
export type ProviderResponse = {
  success: boolean;
  providerMessageId?: string | null;
  status?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  raw: Record<string, unknown>;
};

export type ProviderStatusResponse = {
  status: "queued" | "sent" | "delivered" | "failed" | "unknown";
  raw: Record<string, unknown>;
};

export type ProviderChannel = "sms" | "whatsapp" | "email" | "voice";

export interface OtpProviderInterface {
  readonly name: string;
  readonly channels: ProviderChannel[];
  send(
    channel: ProviderChannel,
    phone: string,
    message: string,
    meta?: Record<string, unknown>,
  ): Promise<ProviderResponse>;
  getMessageStatus?(providerMessageId: string): Promise<ProviderStatusResponse>;
}
