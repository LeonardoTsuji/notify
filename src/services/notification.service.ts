import { randomUUID as uuidv4 } from "crypto";
import { NotificationPayload } from "../types";
import { NotificationInput } from "../schemas/notification.schema";
import { RabbitMQService } from "../queue/rabbitmq.service";
import {
  NotificationStrategy,
  DefaultNotificationStrategy,
  FailoverNotificationStrategy,
} from "../strategies/notification.strategy";

export class NotificationService {
  private rabbitmq: RabbitMQService;
  private strategy: NotificationStrategy;

  constructor(useFailover = false) {
    this.rabbitmq = new RabbitMQService();
    this.strategy = useFailover
      ? new FailoverNotificationStrategy()
      : new DefaultNotificationStrategy();
  }

  async initialize(): Promise<void> {
    await this.rabbitmq.connect();
    await this.startConsumer();
  }

  async sendNotification(
    input: NotificationInput
  ): Promise<{ id: string; queued: boolean }> {
    const payload: NotificationPayload = {
      id: uuidv4(),
      type: input.type,
      provider: input.provider || this.strategy.getDefaultProvider(input.type),
      to: input.to,
      subject: input.subject,
      message: input.message,
      metadata: input.metadata,
      priority: input.priority,
      scheduledAt: input.scheduledAt,
      createdAt: new Date(),
      contentSid: input.contentSid,
      contentVariables: input.contentVariables,
    };

    if (input.scheduledAt && input.scheduledAt > new Date()) {
      // Schedule for later
      await this.rabbitmq.publishNotification(payload);
      return { id: payload.id, queued: true };
    } else {
      // Send immediately
      await this.rabbitmq.publishNotification(payload);
      return { id: payload.id, queued: true };
    }
  }

  async sendBulkNotifications(
    inputs: NotificationInput[]
  ): Promise<{ ids: string[]; queued: number }> {
    const ids: string[] = [];

    for (const input of inputs) {
      const result = await this.sendNotification(input);
      ids.push(result.id);
    }

    return { ids, queued: ids.length };
  }

  private async startConsumer(): Promise<void> {
    await this.rabbitmq.consumeNotifications(async (payload) => {
      // Check if scheduled
      if (payload.scheduledAt && payload.scheduledAt > new Date()) {
        // Re-queue for later
        setTimeout(async () => {
          await this.rabbitmq.publishNotification(payload);
        }, payload.scheduledAt.getTime() - Date.now());
        return;
      }

      const result = await this.strategy.send(payload);
      console.log(`Notification ${payload.id} processed:`, result);
    });
  }

  async close(): Promise<void> {
    await this.rabbitmq.close();
  }
}
