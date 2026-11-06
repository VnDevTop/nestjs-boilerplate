import { ConflictException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { toDataURL } from 'qrcode';
import { TotpService } from './totp.service.js';

import { UsersService } from '../users/users.service.js';
import { PasswordService } from './password.service.js';
import { jwtConfig } from '../../config/jwt.config.js';
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
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly totpService: TotpService,
  ) {}

  /**
   * Issues a JWT access token and refresh token pair.
   *
   * Access tokens are short-lived (15m by default) and used for API
   * authentication. Refresh tokens are long-lived (7d by default) and
   * used to obtain new access tokens without re-authenticating.
   *
   * @param payload - JWT payload.
   * @returns Token pair with access and refresh tokens.
   */
  async issueTokens(payload: JwtPayload): Promise<TokenPair> {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });
    const refreshToken = await this.jwtService.signAsync(
      { ...payload, type: 'refresh' },
      { secret: jwtConfig().refreshSecret, expiresIn: jwtConfig().refreshExpiresIn as any },
    );
    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
      tokenType: 'Bearer',
    };
  }

  /**
   * Issues a short-lived MFA challenge token for users with TOTP enabled.
   *
   * @param user - User entity.
   * @returns Signed MFA challenge token.
   */
  async issueMfaToken(user: User): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        roles: user.roles as any,
        type: 'mfa',
      },
      { expiresIn: '10m' },
    );
  }

  /**
   * Refreshes an access token using a valid refresh token.
   *
   * @param refreshToken - The refresh token string.
   * @returns New token pair.
   */
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtConfig().refreshSecret,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.issueTokens({
        sub: user.id,
        email: user.email,
        roles: user.roles as any,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

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

    const isPasswordValid = await this.passwordService.verify(user.passwordHash, password);
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

    const passwordHash = await this.passwordService.hash(password);

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

    if (user.totpEnabled) {
      const mfaToken = await this.issueMfaToken(user);
      return { user: requestUser, mfaRequired: true, mfaToken };
    }

    const tokens = await this.issueTokens({
      sub: user.id,
      email: user.email,
      roles: user.roles as Role[],
    });

    return { user: requestUser, tokens };
  }

  /**
   * Sets up TOTP for an authenticated user and returns the provisioning URI and QR code.
   *
   * @param userId - User ID (internal identifier).
   * @param email - User email used as the TOTP label.
   * @returns The TOTP secret, otpauth URI and QR code.
   */
  async setupMfa(userId: string, email: string): Promise<{ secret: string; otpauthUrl: string; qrCode: string }> {
    const user = await this.usersService.findByIdWithTotp(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const secret = this.totpService.generateSecret();
    const otpauthUrl = this.totpService.generateUri(secret, email);

    await this.usersService.updateProfile(userId, { totpSecret: secret, totpEnabled: false });

    const qrCode = await toDataURL(otpauthUrl);

    return { secret, otpauthUrl, qrCode };
  }

  /**
   * Verifies a TOTP code and enables two-factor authentication if valid.
   *
   * @param userId - User ID (internal identifier).
   * @param email - User email used as the TOTP label.
   * @param code - The user submitted TOTP code.
   * @returns True when MFA was enabled, false otherwise.
   */
  async verifyMfa(
    userId: string,
    email: string,
    code: string,
    mfaToken?: string,
  ): Promise<{ enabled: boolean; tokens?: TokenPair }> {
    const user = await this.usersService.findByIdWithTotp(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (mfaToken) {
      return this.verifyMfaWithToken(mfaToken, code);
    }

    const secret = user.totpSecret;
    if (!secret) {
      return { enabled: false };
    }

    const valid = await this.totpService.verifyTotp(code, secret);
    if (!valid) {
      return { enabled: false };
    }

    await this.usersService.updateProfile(userId, {
      totpSecret: secret,
      totpEnabled: true,
      backupCodes: this.totpService.generateBackupCodes(),
    });

    return { enabled: true };
  }

  /**
   * Verifies the MFA challenge token issued during login and exchanges it
   * for a fully authenticated token pair.
   *
   * @param mfaToken - Pending MFA challenge token issued at login.
   * @param code - The user submitted TOTP code.
   * @returns MFA status and, when verified, the issued token pair.
   */
  async verifyMfaWithToken(mfaToken: string, code: string): Promise<{ enabled: boolean; tokens?: TokenPair }> {
    const payload = await this.jwtService.verifyAsync(mfaToken, { secret: jwtConfig().secret });
    if (payload.type !== 'mfa') {
      throw new UnauthorizedException('Invalid MFA token');
    }

    const user = await this.usersService.findByIdWithTotp(payload.sub);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const secret = user.totpSecret;
    if (!secret) {
      return { enabled: false };
    }

    const valid = await this.totpService.verifyTotp(code, secret);
    if (!valid) {
      return { enabled: false };
    }

    const tokens = await this.issueTokens({
      sub: user.id,
      email: user.email,
      roles: user.roles as any,
      mfaVerified: true,
    });

    return { enabled: true, tokens };
  }

  /**
   * Disables two-factor authentication after verifying a valid TOTP code.
   *
   * @param userId - User ID (internal identifier).
   * @param email - User email used as the TOTP label.
   * @param code - The user submitted TOTP code.
   * @returns True when MFA was disabled, false otherwise.
   */
  async disableMfa(userId: string, email: string, code: string): Promise<{ enabled: boolean }> {
    const user = await this.usersService.findByIdWithTotp(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const secret = user.totpSecret;
    if (!secret) {
      return { enabled: false };
    }

    const valid = await this.totpService.verifyTotp(code, secret);
    if (!valid) {
      return { enabled: false };
    }

    await this.usersService.updateProfile(userId, {
      totpSecret: null,
      totpEnabled: false,
      backupCodes: null,
    });

    return { enabled: true };
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