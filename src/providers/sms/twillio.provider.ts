import { Twilio } from "twilio";
import {
  NotificationProvider,
  NotificationPayload,
  NotificationResult,
  ProviderType,
} from "../../types";
import { config } from "../../config";

export class TwilioSMSProvider implements NotificationProvider {
  private client: Twilio;
  private fromNumber: string;
  private accountSid: string;
  private authToken: string;

  constructor() {
    this.accountSid = config.TWILIO_ACCOUNT_SID || "";
    this.authToken = config.TWILIO_AUTH_TOKEN || "";
    this.client = new Twilio(this.accountSid, this.authToken);
    this.fromNumber = config.TWILIO_PHONE_NUMBER || "";
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const message = await this.client.messages.create({
        body: payload.message,
        from: this.fromNumber,
        to: payload.to,
      });

      return {
        success: true,
        messageId: message.sid,
        provider: ProviderType.TWILIO_SMS,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        provider: ProviderType.TWILIO_SMS,
        timestamp: new Date(),
      };
    }
  }

  validateConfig(): boolean {
    return !!(this.accountSid && this.authToken && this.fromNumber);
  }
}
