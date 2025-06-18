import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import {
  NotificationProvider,
  NotificationPayload,
  NotificationResult,
  ProviderType,
} from "../../types";
import { config } from "../../config";

export class MailerSendProvider implements NotificationProvider {
  private apiKey: string;
  private from: string;
  private client: MailerSend;

  constructor() {
    this.apiKey = config.MAILERSEND_API_KEY || "";
    this.from = config.MAILERSEND_FROM || "";
    this.client = new MailerSend({ apiKey: this.apiKey });
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const emailParams = new EmailParams()
        .setFrom(new Sender(this.from, "Notification"))
        .setTo([new Recipient(payload.to, "Notification")])
        .setSubject(payload.subject || "Notification")
        .setHtml(payload.message);

      const response = await this.client.email.send(emailParams);

      return {
        success: true,
        messageId: response.headers["x-message-id"],
        provider: ProviderType.MAILERSEND,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        provider: ProviderType.MAILERSEND,
        timestamp: new Date(),
      };
    }
  }

  validateConfig(): boolean {
    return !!(this.apiKey && this.from);
  }
}
