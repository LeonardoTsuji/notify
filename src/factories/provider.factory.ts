import { NotificationProvider, ProviderType } from "../types";
import { ResendProvider } from "../providers/email/resend.provider";
import { SendGridProvider } from "../providers/email/sendgrid.provider";
import { TwilioSMSProvider } from "../providers/sms/twillio.provider";
import { MailerSendProvider } from "../providers/email/mailersend.provider";
import { TwilioWhatsAppProvider } from "../providers/whatsapp/twillio.provider";

export class ProviderFactory {
  private static providers = new Map<ProviderType, NotificationProvider>();

  static getProvider(providerType: ProviderType): NotificationProvider {
    if (!this.providers.has(providerType)) {
      this.providers.set(providerType, this.createProvider(providerType));
    }

    const provider = this.providers.get(providerType);
    if (!provider) {
      throw new Error(`Provider ${providerType} not found`);
    }

    if (!provider.validateConfig()) {
      throw new Error(`Provider ${providerType} configuration is invalid`);
    }

    return provider;
  }

  private static createProvider(
    providerType: ProviderType
  ): NotificationProvider {
    switch (providerType) {
      case ProviderType.RESEND:
        return new ResendProvider();
      case ProviderType.SENDGRID:
        return new SendGridProvider();
      case ProviderType.MAILERSEND:
        return new MailerSendProvider();
      case ProviderType.TWILIO_SMS:
        return new TwilioSMSProvider();
      case ProviderType.TWILIO_WHATSAPP:
        return new TwilioWhatsAppProvider();
      default:
        throw new Error(`Unsupported provider type: ${providerType}`);
    }
  }

  static getAvailableProviders(): ProviderType[] {
    const providers: ProviderType[] = [];

    for (const providerType of Object.values(ProviderType)) {
      try {
        const provider = this.createProvider(providerType);
        if (provider.validateConfig()) {
          providers.push(providerType);
        }
      } catch {
        throw new Error(`Unsupported provider type: ${providerType}`);
      }
    }

    return providers;
  }
}
