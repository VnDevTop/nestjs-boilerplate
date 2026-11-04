import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';

import { UsersService } from './users.service.js';

/**
 * Scheduled cleanup of soft-deleted user records.
 *
 * @class UsersCleanupService
 */
@Injectable()
export class UsersCleanupService {
  private readonly logger = new Logger(UsersCleanupService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Runs daily to purge soft-deleted users older than the retention period.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanup(): Promise<void> {
    const retentionDays = this.configService.get<number>('retention.retentionDays') ?? 30;
    this.logger.log(`Running scheduled cleanup for users older than ${retentionDays} days`);
    await this.usersService.cleanupDeletedUsers(retentionDays);
  }
}