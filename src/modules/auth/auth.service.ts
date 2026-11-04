import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service.js';
import { AuthResult } from '../../common/interfaces/auth-result.interface.js';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface.js';
import { TokenPair } from '../../common/interfaces/token-pair.interface.js';
import { RequestUser } from '../../common/interfaces/request-user.interface.js';

/**
 * Authentication service.
 *
 * Handles user registration, login, token issuance, and profile
 * synchronization. Delegates user persistence to `UsersService`.
 *
 * @class AuthService
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validates a user by email and password.
   *
   * @param email - User email.
   * @param password - Plain-text password.
   * @returns The validated user or null.
   */
  async validateUser(email: string, _password: string): Promise<RequestUser | null> {
    this.logger.log(`Validating user: ${email}`);
    // TODO: implement password verification (Phase 8.1 task 3)
    return null;
  }

  /**
   * Registers a new user with email and password.
   *
   * @param email - User email.
   * @param password - Plain-text password.
   * @param name - Optional display name.
   * @returns Authentication result with tokens.
   */
  async register(email: string, _password: string, _name?: string): Promise<AuthResult> {
    this.logger.log(`Registering user: ${email}`);
    // TODO: implement registration (Phase 8.1 task 2)
    throw new UnauthorizedException('Not implemented');
  }

  /**
   * Authenticates a user with email and password.
   *
   * @param email - User email.
   * @param password - Plain-text password.
   * @returns Authentication result with tokens.
   */
  async login(email: string, _password: string): Promise<AuthResult> {
    this.logger.log(`Login attempt: ${email}`);
    // TODO: implement login (Phase 8.1 task 2)
    throw new UnauthorizedException('Not implemented');
  }

  /**
   * Issues a JWT access token and refresh token pair.
   *
   * @param payload - JWT payload.
   * @returns Token pair.
   */
  async issueTokens(payload: JwtPayload): Promise<TokenPair> {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });
    const refreshToken = await this.jwtService.signAsync(
      { ...payload, type: 'refresh' },
      { expiresIn: '7d' },
    );
    return { accessToken, refreshToken };
  }

  /**
   * Verifies a JWT token and returns the decoded payload.
   *
   * @param token - JWT token string.
   * @returns Decoded JWT payload.
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync(token);
  }
}