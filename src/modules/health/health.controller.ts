import {
  Controller,
  Get,
} from '@nestjs/common';

import {
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import {
  HealthCheckService,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthCheckService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async checkHealth() {
    return this.health.check([]);
  }

  @Get('ready')
  @HttpCode(HttpStatus.OK)
  async ready() {
    return this.health.check([]);
  }
}