import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ActivityPlanEntity } from '../database/entities/ActivityPlanEntity';
import { BaseRepository } from './base.repository';
import { SportType } from '../../domain/sport';

@Injectable()
export class ActivityPlanRepository extends BaseRepository<ActivityPlanEntity> {
  constructor(
    @InjectRepository(ActivityPlanEntity)
    private planRepository: Repository<ActivityPlanEntity>,
  ) {
    super(planRepository);
  }

  /**
   * Find all plans for a user
   */
  async findByUserId(userId: string): Promise<ActivityPlanEntity[]> {
    return this.find({ userId } as FindOptionsWhere<ActivityPlanEntity>);
  }

  /**
   * Find upcoming plans for a user
   */
  async findUpcoming(userId: string): Promise<ActivityPlanEntity[]> {
    const now = new Date();
    return this.planRepository.find({
      where: {
        userId,
        plannedStartTime: new Date(now.getTime() + 1000), // After now
      } as FindOptionsWhere<ActivityPlanEntity>,
      order: { plannedStartTime: 'ASC' },
    });
  }

  /**
   * Find planned activities for specific sport
   */
  async findBySportType(
    userId: string,
    sportType: SportType,
  ): Promise<ActivityPlanEntity[]> {
    return this.find({
      userId,
      sportType,
      status: 'scheduled',
    } as FindOptionsWhere<ActivityPlanEntity>);
  }

  /**
   * Find plan by id and verify ownership
   */
  async findByIdAndUserId(
    planId: string,
    userId: string,
  ): Promise<ActivityPlanEntity | null> {
    return this.findOne({
      id: planId,
      userId,
    } as FindOptionsWhere<ActivityPlanEntity>);
  }

  /**
   * Find plans within date range
   */
  async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ActivityPlanEntity[]> {
    return this.planRepository.find({
      where: {
        userId,
        plannedStartTime: new Date(), // Greater than
      } as FindOptionsWhere<ActivityPlanEntity>,
      order: { plannedStartTime: 'ASC' },
    });
  }

  /**
   * Find all plans with given status
   */
  async findByStatus(
    userId: string,
    status: 'scheduled' | 'completed' | 'cancelled' | 'missed',
  ): Promise<ActivityPlanEntity[]> {
    return this.find({
      userId,
      status,
    } as FindOptionsWhere<ActivityPlanEntity>);
  }

  /**
   * Check if plan exists and belongs to user
   */
  async isOwner(planId: string, userId: string): Promise<boolean> {
    return this.exists({
      id: planId,
      userId,
    } as FindOptionsWhere<ActivityPlanEntity>);
  }

  /**
   * Link activity to plan (update plan with activityId)
   */
  async linkActivity(planId: string, activityId: string): Promise<ActivityPlanEntity | null> {
    const plan = await this.findById(planId);
    if (!plan) return null;

    plan.activityId = activityId;
    plan.status = 'completed';
    return this.save(plan);
  }
}