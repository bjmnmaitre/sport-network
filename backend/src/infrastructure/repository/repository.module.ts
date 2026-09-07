import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityEntity } from '../database/entities/ActivityEntity';
import { ActivityPlanEntity } from '../database/entities/ActivityPlanEntity';
import { UserEntity } from '../database/entities/UserEntity';
import { ProfileEntity } from '../database/entities/ProfileEntity';
import { ActivityRepository } from './ActivityRepository';
import { ActivityPlanRepository } from './ActivityPlanRepository';
import { UserRepository } from './UserRepository';
import { ProfileRepository } from './ProfileRepository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActivityEntity,
      ActivityPlanEntity,
      UserEntity,
      ProfileEntity,
    ]),
  ],
  providers: [
    ActivityRepository,
    ActivityPlanRepository,
    UserRepository,
    ProfileRepository,
  ],
  exports: [
    ActivityRepository,
    ActivityPlanRepository,
    UserRepository,
    ProfileRepository,
  ],
})
export class RepositoryModule {}