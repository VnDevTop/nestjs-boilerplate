import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { UsersService } from '../users/users.service.js';
import { AuthResult } from '../../common/interfaces/auth-result.interface.js';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface.js';
import { TokenPair } from '../../common/interfaces/token-pair.interface.js';
import { RequestUser } from '../../common/interfaces/request-user.interface.js';
import { Role } from '../../common/enums/role.enum.js';
import { User } from '../users/entities/user.entity.js';

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
  async validateUser(email: string, password: string): Promise<RequestUser | null> {
    this.logger.log(`Validating user: ${email}`);

    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user || !user.passwordHash) {
      return null;
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      return null;
    }

    return this.toRequestUser(user);
  }

  /**
   * Registers a new user with email and password.
   *
   * @param email - User email.
   * @param password - Plain-text password.
   * @param name - Optional display name.
   * @returns Authentication result with tokens.
   */
  async register(email: string, password: string, name?: string): Promise<AuthResult> {
    this.logger.log(`Registering user: ${email}`);

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB
      timeCost: 3,
      parallelism: 4,
    });

    const user = await this.usersService.create({
      email,
      sub: email,
      name: name ?? null,
      passwordHash,
      emailVerified: false,
      roles: [Role.USER],
    });

    const requestUser = this.toRequestUser(user);
    const tokens = await this.issueTokens({
      sub: user.id,
      email: user.email,
      roles: user.roles as Role[],
    });

    return { user: requestUser, tokens };
  }

  /**
   * Authenticates a user with email and password.
   *
   * @param email - User email.
   * @param password - Plain-text password.
   * @returns Authentication result with tokens.
   */
  async login(email: string, password: string): Promise<AuthResult> {
    this.logger.log(`Login attempt: ${email}`);

    const requestUser = await this.validateUser(email, password);
    if (!requestUser) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.issueTokens({
      sub: user.id,
      email: user.email,
      roles: user.roles as Role[],
    });

    return { user: requestUser, tokens };
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

  /**
   * Converts a User entity to a RequestUser.
   *
   * @param user - User entity.
   * @returns RequestUser object.
   */
  private toRequestUser(user: User): RequestUser {
    return {
      sub: user.id,
      email: user.email,
      roles: user.roles as Role[],
      emailVerified: user.emailVerified,
      name: user.name ?? undefined,
    };
  }
}