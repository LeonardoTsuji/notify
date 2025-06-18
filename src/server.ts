import "dotenv/config";
import { fastify } from "fastify";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import cors from "@fastify/cors";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { notificationRoutes } from "./routes/notification.routes";
import { config } from "./config";

const app = fastify({
  logger: {
    level: "info",
  },
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Notify API",
      version: "1.0.0",
      description: "API for sending notifications through multiple providers",
    },
    servers: [],
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

async function start() {
  try {
    // Register plugins

    await app.register(cors);

    // Register routes
    await app.register(notificationRoutes, { prefix: "/api/v1" });

    // Global error handler
    app.setErrorHandler((error, request, reply) => {
      app.log.error(error);
      reply.code(500).send({
        success: false,
        error: "Internal Server Error",
      });
    });

    await app.ready();
    // app.swagger();

    const port = parseInt(config.PORT);
    await app.listen({ port, host: "0.0.0.0" });

    console.log(`🚀 Server running on port ${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await app.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  await app.close();
  process.exit(0);
});

start();
