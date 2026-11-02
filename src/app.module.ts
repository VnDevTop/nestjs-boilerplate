import { Module } from '@nestjs/common';
import { ConditionalModule, ConfigModule } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { appConfig, databaseConfig, observeConfig, swaggerConfig, validateEnv } from './config/index.js';
import { HealthModule } from './modules/health/health.module.js';
import { CacheModule } from './cache/cache.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, observeConfig, databaseConfig, swaggerConfig],
      validate: validateEnv,
    }),
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com,
    // then run `npx @nestjs/observe link` to write your key pair into .env.
    ConditionalModule.registerWhen(
      ObserveModule.forRootAsync(observeConfig.asProvider()),
      (env) =>
        !!env.OBSERVE_APP_KEY &&
        !!env.OBSERVE_APP_SECRET &&
        !!env.OBSERVE_SERVICE_ID,
    ),
    TypeOrmModule.forRootAsync(databaseConfig.asProvider()),
    // Distributed cache backed by Redis via KeyV (no in-memory fallback)
    CacheModule,
    // Health check endpoints: GET /health and GET /health/ready
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
