import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { setupSwagger } from './core/swagger/index.js';
import { createGlobalValidationPipe } from "./common/index.ts";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
    logger: ['error', 'warn', 'log'],
  });

  // Global ValidationPipe configuration using class-validator and class-transformer
  app.useGlobalPipes(createGlobalValidationPipe());

  // Configure Swagger with dual endpoints (public + admin)
  // Path, version, and enable/disable are read from environment variables
  // via @nestjs/config ConfigService inside setupSwagger().
  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
