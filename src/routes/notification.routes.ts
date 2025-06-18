import { NotificationService } from "../services/notification.service";
import {
  notificationSchema,
  bulkNotificationSchema,
} from "../schemas/notification.schema";
import { ProviderFactory } from "../factories/provider.factory";
import { FastifyTypedInstance, ProviderType } from "../types";
import z from "zod";

export async function notificationRoutes(fastify: FastifyTypedInstance) {
  const notificationService = new NotificationService(true); // Use failover strategy
  await notificationService.initialize();

  fastify.get(
    "/health",
    {
      schema: {
        tags: ["health"],
        description: "Check API health status",
        response: {
          200: z.object({
            status: z.string(),
            timestamp: z.string(),
          }),
        },
      },
    },
    async () => {
      return { status: "ok", timestamp: new Date().toISOString() };
    }
  );

  fastify.get(
    "/providers",
    {
      schema: {
        tags: ["providers"],
        description: "List all available notification providers",
        response: {
          200: z.object({
            available: z.array(z.nativeEnum(ProviderType)),
          }),
        },
      },
    },
    async () => {
      return {
        available: ProviderFactory.getAvailableProviders(),
      };
    }
  );

  fastify.post(
    "/notifications",
    {
      schema: {
        tags: ["notifications"],
        description: "Send a single notification",
        body: notificationSchema,
        response: {
          202: z.object({
            success: z.boolean(),
            data: z.any(),
          }),
          400: z.object({
            success: z.boolean(),
            error: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await notificationService.sendNotification(request.body);
        return reply.code(202).send({
          success: true,
          data: result,
        });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  fastify.post(
    "/notifications/bulk",
    {
      schema: {
        tags: ["notifications"],
        description: "Send multiple notifications in bulk",
        body: bulkNotificationSchema,
        response: {
          202: z.object({
            success: z.boolean(),
            data: z.any(),
          }),
          400: z.object({
            success: z.boolean(),
            error: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { notifications } = request.body;
        const result = await notificationService.sendBulkNotifications(
          notifications
        );
        return reply.code(202).send({
          success: true,
          data: result,
        });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  fastify.addHook("onClose", async () => {
    await notificationService.close();
  });
}
