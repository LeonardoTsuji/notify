import { z } from "zod";
import { NotificationType, ProviderType } from "../types";

export const notificationSchema = z
  .object({
    type: z.nativeEnum(NotificationType),
    provider: z.nativeEnum(ProviderType).optional(),
    to: z.string().min(1, "Recipient is required"),
    subject: z.string().optional(),
    message: z.string().min(1, "Message is required"),
    metadata: z.record(z.any()).optional(),
    priority: z.enum(["low", "normal", "high"]).default("normal"),
    scheduledAt: z
      .string()
      .datetime()
      .optional()
      .transform((date) => (date ? new Date(date) : undefined)),
    contentSid: z.string().optional(),
    contentVariables: z.record(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.type === NotificationType.WHATSAPP &&
      data.provider === ProviderType.TWILIO_WHATSAPP
    ) {
      if (!data.contentSid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["contentSid"],
          message: "contentSid is required for WhatsApp via Twilio",
        });
      }

      if (!data.contentVariables) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["contentVariables"],
          message: "contentVariables is required for WhatsApp via Twilio",
        });
      }
    }
  });

export const bulkNotificationSchema = z.object({
  notifications: z.array(notificationSchema).min(1).max(100),
});

export type NotificationInput = z.infer<typeof notificationSchema>;
export type BulkNotificationInput = z.infer<typeof bulkNotificationSchema>;
