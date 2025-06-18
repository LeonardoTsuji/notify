import amqp, { Channel } from "amqplib";
import { NotificationPayload } from "../types";
import { config } from "../config";

export class RabbitMQService {
  private connection?: amqp.ChannelModel;
  private channel?: Channel;
  private queueName: string;

  constructor() {
    this.queueName = config.QUEUE_NAME;
  }

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(config.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queueName, {
        durable: true,
        arguments: {
          "x-max-priority": 3,
        },
      });

      console.log("Connected to RabbitMQ");
    } catch (error) {
      console.error("Failed to connect to RabbitMQ:", error);
      throw error;
    }
  }

  async publishNotification(payload: NotificationPayload): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    const message = JSON.stringify(payload);
    const options = {
      persistent: true,
      priority: this.getPriority(payload.priority),
    };

    this.channel.sendToQueue(this.queueName, Buffer.from(message), options);
  }

  async consumeNotifications(
    callback: (payload: NotificationPayload) => Promise<void>
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    await this.channel.consume(this.queueName, async (msg) => {
      if (msg) {
        try {
          const payload: NotificationPayload = JSON.parse(
            msg.content.toString()
          );
          await callback(payload);
          this.channel!.ack(msg);
        } catch (error) {
          console.error("Error processing notification:", error);
          this.channel!.nack(msg, false, false);
        }
      }
    });
  }

  private getPriority(priority?: string): number {
    switch (priority) {
      case "high":
        return 10;
      case "normal":
        return 5;
      case "low":
        return 1;
      default:
        return 5;
    }
  }

  async close(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}
