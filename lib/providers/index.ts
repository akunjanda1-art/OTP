import { DummyProvider } from "./dummy";
import type { OtpProvider, ProviderChannel } from "./interface";

const dummy = new DummyProvider();

const REGISTRY: Record<string, OtpProvider> = {
  dummy,
};

/**
 * Select provider untuk channel tertentu berdasarkan env config.
 * Default fallback ke dummy provider.
 */
export function getProvider(channel: ProviderChannel): OtpProvider {
  const envKey =
    channel === "sms"
      ? process.env.SMS_PROVIDER
      : channel === "whatsapp"
        ? process.env.WHATSAPP_PROVIDER
        : channel === "email"
          ? process.env.EMAIL_PROVIDER
          : process.env.VOICE_PROVIDER;

  const name = (envKey ?? "dummy").toLowerCase();
  return REGISTRY[name] ?? dummy;
}

export type { OtpProvider, ProviderChannel } from "./interface";
