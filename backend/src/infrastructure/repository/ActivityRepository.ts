import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, IsNull, FindOptionsWhere } from 'typeorm';
import { ActivityEntity } from '../database/entities/ActivityEntity';
import { BaseRepository } from './base.repository';
import { SportType } from '../../domain/sport';

@Injectable()
export class ActivityRepository extends BaseRepository<ActivityEntity> {
  constructor(
    @InjectRepository(ActivityEntity)
    private activityRepository: Repository<ActivityEntity>,
  ) {
    super(activityRepository);
  }

  /**
   * Find all activities for a user
   */
  async findByUserId(userId: string): Promise<ActivityEntity[]> {
    return this.find({ userId } as FindOptionsWhere<ActivityEntity>);
  }

  /**
   * Find activities by user and sport
   */
  async findByUserAndSport(
    userId: string,
    sportType: SportType,
  ): Promise<ActivityEntity[]> {
    return this.find({
      userId,
      sportType,
    } as FindOptionsWhere<ActivityEntity>);
  }

  /**
   * Find activities in date range
   */
  async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ActivityEntity[]> {
    return this.activityRepository.find({
      where: {
        userId,
        actualEndTime: Between(startDate, endDate),
      } as FindOptionsWhere<ActivityEntity>,
      order: { actualEndTime: 'DESC' },
    });
  }

  /**
   * Find activities by visibility (for discovery)
   */
  async findPublicActivities(sportType?: SportType): Promise<ActivityEntity[]> {
    const where: any = { visibility: 'public' };
    if (sportType) {
      where.sportType = sportType;
    }
    return this.activityRepository.find({
      where,
      order: { actualEndTime: 'DESC' },
      take: 100, // Limit for discovery
    });
  }

  /**
   * Find activities for user with date range and sport
   */
  async findUserProgressionData(
    userId: string,
    sportType: SportType,
    startDate: Date,
    endDate: Date,
  ): Promise<ActivityEntity[]> {
    return this.activityRepository.find({
      where: {
        userId,
        sportType,
        actualEndTime: Between(startDate, endDate),
        deletedAt: IsNull(),
      } as FindOptionsWhere<ActivityEntity>,
      order: { actualEndTime: 'DESC' },
    });
  }

  /**
   * Find activities that have not been soft-deleted
   */
  async findCompleted(userId: string): Promise<ActivityEntity[]> {
    return this.find({
      userId,
      deletedAt: IsNull(),
    } as FindOptionsWhere<ActivityEntity>);
  }

  /**
   * Check if activity exists and belongs to user
   */
  async isOwner(activityId: string, userId: string): Promise<boolean> {
    return this.exists({
      id: activityId,
      userId,
    } as FindOptionsWhere<ActivityEntity>);
  }
}