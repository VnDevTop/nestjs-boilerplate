import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { PasswordService } from './password.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { jwtConfig } from '../../config/jwt.config.js';

/**
 * Authentication module.
 *
 * Provides JWT-based authentication, OIDC provider integration,
 * two-factor authentication, and machine-to-machine flows.
 *
 * @module AuthModule
 */
@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, PasswordService, JwtStrategy, JwtAuthGuard, JwtModule, PassportModule],
})
export class AuthModule {}