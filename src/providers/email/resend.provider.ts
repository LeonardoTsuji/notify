import { Resend } from "resend";
import {
  NotificationProvider,
  NotificationPayload,
  NotificationResult,
  ProviderType,
} from "../../types";
import { config } from "../../config";

export class ResendProvider implements NotificationProvider {
  private client: Resend;
  private apiKey: string;
  private from: string;

  constructor() {
    this.apiKey = config.RESEND_API_KEY || "";
    this.from = config.RESEND_FROM || "";
    this.client = new Resend(this.apiKey);
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const info = await this.client.emails.send({
        from: this.from,
        to: payload.to,
        subject: payload.subject || "Notification",
        text: payload.message,
        html: payload.message,
      });

      return {
        success: true,
        messageId: info.data?.id,
        provider: ProviderType.RESEND,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        provider: ProviderType.RESEND,
        timestamp: new Date(),
      };
    }
  }

  validateConfig(): boolean {
    return !!(this.apiKey && this.from);
  }
}
