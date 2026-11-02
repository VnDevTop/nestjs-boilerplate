import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { setupSwagger } from './core/swagger/index.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
    logger: ['error', 'warn', 'log'],
  });

  // Global ValidationPipe configuration using class-validator and class-transformer
  app.useGlobalPipes(
    new (require('@nestjs/common').ValidationPipe)({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      // Enable additional validation settings as needed
    }),
  );

  // Configure Swagger with dual endpoints (public + admin)
  // Path, version, and enable/disable are read from environment variables
  // via @nestjs/config ConfigService inside setupSwagger().
  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
