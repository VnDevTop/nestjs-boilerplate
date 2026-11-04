import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';

import { UsersModule } from '../users/users.module.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { PasswordService } from './password.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { AuthGuard } from './guards/auth.guard.js';
import { GlobalAuthGuard } from './guards/global-auth.guard.js';
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
  providers: [
    AuthService,
    PasswordService,
    JwtStrategy,
    JwtAuthGuard,
    AuthGuard,
    PermissionsGuard,
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: GlobalAuthGuard,
    },
  ],
  exports: [AuthService, PasswordService, JwtStrategy, JwtAuthGuard, AuthGuard, PermissionsGuard, RolesGuard, JwtModule, PassportModule],
})
export class AuthModule {}