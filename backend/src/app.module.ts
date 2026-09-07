import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiModule } from './api/api.module';
import { ApplicationModule } from './application/application.module';
import { ActivityEntity } from './infrastructure/database/entities/ActivityEntity';
import { ActivityPlanEntity } from './infrastructure/database/entities/ActivityPlanEntity';
import { UserEntity } from './infrastructure/database/entities/UserEntity';
import { ProfileEntity } from './infrastructure/database/entities/ProfileEntity';

@Module({
  imports: [
    // Database configuration
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'sport_network',
      entities: [ActivityEntity, ActivityPlanEntity, UserEntity, ProfileEntity],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production',
    }),

    // Application modules
    ApplicationModule,
    ApiModule,
  ],
})
export class AppModule {}