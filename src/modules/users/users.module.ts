import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity.js';
import { UserRepository } from './repositories/user.repository.js';

/**
 * Users module.
 *
 * @module UsersModule
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class UsersModule {}