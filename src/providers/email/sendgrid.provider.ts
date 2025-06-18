import sendgrid from "@sendgrid/mail";
import {
  NotificationProvider,
  NotificationPayload,
  NotificationResult,
  ProviderType,
} from "../../types";
import { config } from "../../config";

export class SendGridProvider implements NotificationProvider {
  private apiKey: string;
  private from: string;

  constructor() {
    this.apiKey = config.SENDGRID_API_KEY || "";
    this.from = config.SENDGRID_FROM || "";
    sendgrid.setApiKey(this.apiKey);
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const response = await sendgrid.send({
        personalizations: [
          {
            to: [{ email: payload.to }],
            subject: payload.subject || "Notification",
          },
        ],
        from: { email: this.from },
        content: [
          {
            type: "text/html",
            value: payload.message,
          },
        ],
      });

      return {
        success: true,
        messageId: response[0].headers["x-message-id"],
        provider: ProviderType.SENDGRID,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        provider: ProviderType.SENDGRID,
        timestamp: new Date(),
      };
    }
  }

  validateConfig(): boolean {
    return !!(this.apiKey && this.from);
  }
}
