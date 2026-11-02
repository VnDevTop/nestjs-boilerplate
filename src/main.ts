import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { setupSwagger } from './core/swagger/index.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  // Configure Swagger with dual endpoints (public + admin)
  // Path, version, and enable/disable are read from environment variables
  // via @nestjs/config ConfigService inside setupSwagger().
  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
