export enum NotificationType {
  EMAIL = "email",
  SMS = "sms",
  WHATSAPP = "whatsapp",
}

export enum ProviderType {
  // Email
  RESEND = "resend",
  SENDGRID = "sendgrid",
  MAILERSEND = "mailersend",

  // SMS
  TWILIO_SMS = "twilio_sms",

  // WhatsApp
  TWILIO_WHATSAPP = "twilio_whatsapp",
}

export interface NotificationPayload {
  id: string;
  type: NotificationType;
  provider: ProviderType;
  to: string;
  subject?: string;
  message: string;
  metadata?: Record<string, any>;
  priority?: "low" | "normal" | "high";
  scheduledAt?: Date;
  createdAt: Date;
  contentSid?: string;
  contentVariables?: object;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: ProviderType;
  timestamp: Date;
}

export interface NotificationProvider {
  send(payload: NotificationPayload): Promise<NotificationResult>;
  validateConfig(): boolean;
}

import type {
  FastifyBaseLogger,
  FastifyInstance,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export type FastifyTypedInstance = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  FastifyBaseLogger,
  ZodTypeProvider
>;
