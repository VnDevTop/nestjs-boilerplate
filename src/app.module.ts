import { Module } from '@nestjs/common';
import { ConditionalModule, ConfigModule } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from "@nestjs/bull";
import { MailerModule } from '@nestjs-modules/mailer';
import {
  appConfig,
  cacheConfig,
  databaseConfig,
  mailConfig,
  observeConfig,
  queueConfig,
  swaggerConfig,
  validateEnv
} from './config/index.js';
import { HealthModule } from './modules/health/health.module.js';

export const {ObserveModule, ObserveInstrument} = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, observeConfig, databaseConfig, swaggerConfig, cacheConfig, queueConfig, mailConfig],
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
    CacheModule.registerAsync(cacheConfig.asProvider()),
    // Distributed job processing backed by Redis via BullMQ (no in-memory fallback)
    BullModule.forRootAsync(queueConfig.asProvider()),
    // Outbound email service via SMTP (Nodemailer)
    // Only register when mail credentials are provided
    ConditionalModule.registerWhen(
      MailerModule.forRootAsync(mailConfig.asProvider()),
      (env) =>
        !!env.MAIL_USERNAME &&
        !!env.MAIL_PASSWORD,
    ),
    // Health check endpoints: GET /health and GET /health/ready
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
