import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UsersService } from '../../users/users.service.js';
import { jwtConfig } from '../../../config/jwt.config.js';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface.js';
import { RequestUser } from '../../../common/interfaces/request-user.interface.js';

/**
 * JWT authentication strategy using Passport.
 *
 * Extracts the JWT from the Authorization header (Bearer token),
 * verifies its signature, and validates the user exists.
 *
 * @class JwtStrategy
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig().secret,
    });
  }

  /**
   * Validates the JWT payload and returns the authenticated user.
   *
   * Called by Passport after successful token verification.
   *
   * @param payload - Decoded JWT payload.
   * @returns The authenticated request user.
   * @throws UnauthorizedException if the user is not found.
   */
  async validate(payload: JwtPayload): Promise<RequestUser> {
    if (payload.type === 'refresh') {
      throw new UnauthorizedException('Refresh tokens cannot be used for authentication');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      sub: user.id,
      email: user.email,
      roles: user.roles as any,
      emailVerified: user.emailVerified,
      name: user.name ?? undefined,
    };
  }
}