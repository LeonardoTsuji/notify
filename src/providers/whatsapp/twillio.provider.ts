import { Twilio } from "twilio";
import {
  NotificationProvider,
  NotificationPayload,
  NotificationResult,
  ProviderType,
} from "../../types";
import { config } from "../../config";

export class TwilioWhatsAppProvider implements NotificationProvider {
  private client: Twilio;
  private fromNumber: string;
  private accountSid: string;
  private authToken: string;

  constructor() {
    this.accountSid = config.TWILIO_ACCOUNT_SID || "";
    this.authToken = config.TWILIO_AUTH_TOKEN || "";
    this.client = new Twilio(this.accountSid, this.authToken);
    this.fromNumber = config.TWILIO_WHATSAPP_NUMBER || "";
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const message = await this.client.messages.create({
        from: this.fromNumber,
        contentSid: payload.contentSid,
        contentVariables: payload.contentVariables
          ? JSON.stringify(payload.contentVariables)
          : undefined,
        to: `whatsapp:${payload.to}`,
      });

      return {
        success: true,
        messageId: message.sid,
        provider: ProviderType.TWILIO_WHATSAPP,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        provider: ProviderType.TWILIO_WHATSAPP,
        timestamp: new Date(),
      };
    }
  }

  validateConfig(): boolean {
    return !!(this.accountSid && this.authToken && this.fromNumber);
  }
}
