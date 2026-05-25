import type {
  OtpProvider,
  ProviderChannel,
  ProviderResponse,
  ProviderStatusResponse,
} from "./interface";

/**
 * Dummy provider untuk MVP / sandbox (PRD §17 phase 1).
 * Selalu sukses, mensimulasikan latency, dan mengembalikan provider_message_id palsu.
 * Untuk debug, OTP body dilog ke console saat NODE_ENV != production.
 */
export class DummyProvider implements OtpProvider {
  name = "dummy";

  supports(_channel: ProviderChannel): boolean {
    return true;
  }

  async send(
    channel: ProviderChannel,
    phoneOrAddress: string,
    message: string,
    meta: Record<string, unknown> = {},
  ): Promise<ProviderResponse> {
    // simulate small latency
    await new Promise((r) => setTimeout(r, 50));

    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log(
        `[DummyProvider] ${channel.toUpperCase()} -> ${phoneOrAddress}: ${message}`,
      );
    }

    return {
      success: true,
      providerMessageId: `dummy_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      status: "sent",
      errorCode: null,
      errorMessage: null,
      raw: { channel, phoneOrAddress, message, meta, simulated: true },
    };
  }

  async getStatus(providerMessageId: string): Promise<ProviderStatusResponse> {
    return {
      providerMessageId,
      status: "delivered",
      deliveredAt: new Date(),
      raw: { simulated: true },
    };
  }
}
