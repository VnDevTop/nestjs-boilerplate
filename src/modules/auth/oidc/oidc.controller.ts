import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { Public } from '../../../common/decorators/public.decorator.js';
import { OidcService } from './oidc.service.js';

/**
 * OIDC controller exposing authorization and callback endpoints
 * for each enabled provider.
 *
 * All routes are public (no authentication required) since they
 * are part of the login flow.
 *
 * @class OidcController
 */
@ApiTags('auth')
@Controller('auth/oidc')
export class OidcController {
  constructor(private readonly oidcService: OidcService) {}

  /**
   * Lists all enabled OIDC providers.
   */
  @Public()
  @Get('providers')
  @ApiOperation({ summary: 'List enabled OIDC providers' })
  @ApiResponse({ status: 200, description: 'List of enabled providers' })
  getProviders() {
    return this.oidcService.getEnabledProviders().map((p) => ({
      name: p.name,
      enabled: p.isEnabled,
    }));
  }

  /**
   * Initiates the OIDC flow by redirecting to the provider.
   */
  @Public()
  @Get(':provider')
  @ApiOperation({ summary: 'Initiate OIDC flow for a provider' })
  @ApiResponse({ status: 302, description: 'Redirect to provider' })
  initiateOidc(
    @Param('provider') provider: string,
    @Query('redirect_uri') redirectUri: string | undefined,
    @Res() res: Response,
  ) {
    const state = Math.random().toString(36).substring(2, 15);
    const url = this.oidcService.getAuthorizationUrl(provider, state, redirectUri);
    res.redirect(url);
  }

  /**
   * Handles the OIDC callback from the provider.
   */
  @Public()
  @Get(':provider/callback')
  @ApiOperation({ summary: 'OIDC callback handler' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 401, description: 'Authentication failed' })
  async handleCallback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('redirect_uri') redirectUri: string | undefined,
  ) {
    return this.oidcService.handleCallback(provider, code, state, redirectUri);
  }
}