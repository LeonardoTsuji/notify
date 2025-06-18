import {
  NotificationPayload,
  NotificationResult,
  NotificationType,
  ProviderType,
} from "../types";
import { ProviderFactory } from "../factories/provider.factory";

export interface NotificationStrategy {
  send(payload: NotificationPayload): Promise<NotificationResult>;
  getDefaultProvider(type: NotificationType): ProviderType;
}

export class DefaultNotificationStrategy implements NotificationStrategy {
  async send(payload: NotificationPayload): Promise<NotificationResult> {
    const providerType =
      payload.provider || this.getDefaultProvider(payload.type);
    const provider = ProviderFactory.getProvider(providerType);
    return provider.send(payload);
  }

  getDefaultProvider(type: NotificationType): ProviderType {
    switch (type) {
      case NotificationType.EMAIL:
        return ProviderType.RESEND;
      case NotificationType.SMS:
        return ProviderType.TWILIO_SMS;
      case NotificationType.WHATSAPP:
        return ProviderType.TWILIO_WHATSAPP;
      default:
        throw new Error(`No default provider for type: ${type}`);
    }
  }
}

export class FailoverNotificationStrategy implements NotificationStrategy {
  private fallbackProviders: Map<NotificationType, ProviderType[]> = new Map([
    [NotificationType.EMAIL, [ProviderType.RESEND, ProviderType.SENDGRID]],
    [NotificationType.SMS, [ProviderType.TWILIO_SMS]],
    [NotificationType.WHATSAPP, [ProviderType.TWILIO_WHATSAPP]],
  ]);

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    const providers = payload.provider
      ? [payload.provider]
      : this.fallbackProviders.get(payload.type) || [
          this.getDefaultProvider(payload.type),
        ];

    let lastError = "";

    for (const providerType of providers) {
      try {
        const provider = ProviderFactory.getProvider(providerType);
        const result = await provider.send({
          ...payload,
          provider: providerType,
        });

        if (result.success) {
          return result;
        }

        lastError = result.error || "Unknown error";
      } catch (error) {
        lastError = error instanceof Error ? error.message : "Unknown error";
        continue;
      }
    }

    return {
      success: false,
      error: `All providers failed. Last error: ${lastError}`,
      provider: providers[providers.length - 1],
      timestamp: new Date(),
    };
  }

  getDefaultProvider(type: NotificationType): ProviderType {
    const providers = this.fallbackProviders.get(type);
    if (!providers || providers.length === 0) {
      throw new Error(`No providers configured for type: ${type}`);
    }
    return providers[0];
  }
}
