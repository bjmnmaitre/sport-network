import { Module } from '@nestjs/common';
import { RepositoryModule } from '../infrastructure/repository/repository.module';
import { ActivityService } from './ActivityService';
import { ActivityPlanService } from './ActivityPlanService';
import { ProgressionService } from './ProgressionService';
import { AuthService } from './AuthService';

@Module({
  imports: [RepositoryModule],
  providers: [
    ActivityService,
    ActivityPlanService,
    ProgressionService,
    AuthService,
  ],
  exports: [
    ActivityService,
    ActivityPlanService,
    ProgressionService,
    AuthService,
  ],
})
export class ApplicationModule {}