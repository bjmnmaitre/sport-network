import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { ActivitiesController } from './controllers/activities.controller';
import { ActivityPlansController } from './controllers/activity-plans.controller';
import { AuthController } from './controllers/auth.controller';
import { ProfileController } from './controllers/profile.controller';
import { ErrorMiddleware } from './middleware/error.middleware';

@Module({
  imports: [ApplicationModule],
  controllers: [
    ActivitiesController,
    ActivityPlansController,
    AuthController,
    ProfileController,
  ],
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ErrorMiddleware).forRoutes('*');
  }
}