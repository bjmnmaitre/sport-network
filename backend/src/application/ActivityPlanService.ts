import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ActivityPlanRepository } from '../infrastructure/repository/ActivityPlanRepository';
import { ActivityRepository } from '../infrastructure/repository/ActivityRepository';
import { ActivityPlanEntity } from '../infrastructure/database/entities/ActivityPlanEntity';
import { ActivityEntity } from '../infrastructure/database/entities/ActivityEntity';
import { SportType } from '../domain/sport';

@Injectable()
export class ActivityPlanService {
  constructor(
    private planRepository: ActivityPlanRepository,
    private activityRepository: ActivityRepository,
  ) {}

  /**
   * Create activity plan
   */
  async createPlan(
    userId: string,
    sportType: SportType,
    data: {
      plannedStartTime: Date;
      plannedEndTime?: Date;
      plannedLocation?: any;
      plannedMetrics?: any;
      sportSpecificPlan?: any;
      notes?: string;
    },
  ): Promise<ActivityPlanEntity> {
    if (data.plannedStartTime <= new Date()) {
      throw new BadRequestException('Planned start time must be in the future');
    }

    const plan = new ActivityPlanEntity();
    plan.userId = userId;
    plan.sportType = sportType;
    plan.plannedStartTime = data.plannedStartTime;
    plan.plannedEndTime = data.plannedEndTime;
    plan.plannedLocation = data.plannedLocation;
    plan.plannedMetrics = data.plannedMetrics;
    plan.sportSpecificPlan = data.sportSpecificPlan;
    plan.notes = data.notes;
    plan.status = 'scheduled';

    return this.planRepository.save(plan);
  }

  /**
   * Get plan by id
   */
  async getPlan(planId: string, userId: string): Promise<ActivityPlanEntity> {
    const plan = await this.planRepository.findByIdAndUserId(planId, userId);
    if (!plan) {
      throw new NotFoundException('Plan not found or does not belong to user');
    }
    return plan;
  }

  /**
   * Get user's upcoming plans
   */
  async getUpcomingPlans(userId: string): Promise<ActivityPlanEntity[]> {
    return this.planRepository.findUpcoming(userId);
  }

  /**
   * Get user's plans by sport
   */
  async getPlansBySport(userId: string, sportType: SportType): Promise<ActivityPlanEntity[]> {
    return this.planRepository.findBySportType(userId, sportType);
  }

  /**
   * Update plan
   */
  async updatePlan(
    planId: string,
    userId: string,
    data: Partial<{
      plannedStartTime: Date;
      plannedEndTime?: Date;
      plannedLocation?: any;
      notes?: string;
    }>,
  ): Promise<ActivityPlanEntity> {
    const plan = await this.getPlan(planId, userId);

    if (plan.status !== 'scheduled') {
      throw new BadRequestException('Can only update scheduled plans');
    }

    if (data.plannedStartTime && data.plannedStartTime <= new Date()) {
      throw new BadRequestException('Planned start time must be in the future');
    }

    Object.assign(plan, data);
    return this.planRepository.save(plan);
  }

  /**
   * Start activity from plan (create activity and link)
   */
  async startActivityFromPlan(
    planId: string,
    userId: string,
    activityData: any,
  ): Promise<ActivityPlanEntity> {
    const plan = await this.getPlan(planId, userId);

    if (plan.status !== 'scheduled') {
      throw new BadRequestException('Plan must be scheduled to start activity');
    }

    // Create activity
    const activity = new ActivityEntity();
    activity.userId = userId;
    activity.sportType = plan.sportType;
    activity.actualMetrics = activityData.metrics;
    activity.actualEndTime = new Date();
    activity.actualStartTime = new Date(
      Date.now() - (activityData.metrics?.duration ?? 0) * 1000,
    );
    activity.visibility = 'private';
    activity.status = 'recorded';
    activity.planId = planId;

    const savedActivity = await this.activityRepository.save(activity);

    // Link plan to activity
    plan.activityId = savedActivity.id;
    plan.status = 'completed';

    return this.planRepository.save(plan);
  }

  /**
   * Convert plan to activity (for when user does activity manually)
   */
  async convertPlanToActivity(
    planId: string,
    activityId: string,
    userId: string,
  ): Promise<ActivityPlanEntity> {
    const plan = await this.getPlan(planId, userId);
    const isActivityOwner = await this.activityRepository.isOwner(activityId, userId);

    if (!isActivityOwner) {
      throw new BadRequestException('Activity does not belong to user');
    }

    if (plan.status !== 'scheduled') {
      throw new BadRequestException('Plan must be scheduled to convert');
    }

    plan.activityId = activityId;
    plan.status = 'completed';

    return this.planRepository.save(plan);
  }

  /**
   * Cancel plan
   */
  async cancelPlan(planId: string, userId: string): Promise<ActivityPlanEntity> {
    const plan = await this.getPlan(planId, userId);

    if (plan.status !== 'scheduled') {
      throw new BadRequestException('Can only cancel scheduled plans');
    }

    plan.status = 'cancelled';
    return this.planRepository.save(plan);
  }

  /**
   * Mark plan as missed (no activity recorded)
   */
  async markMissed(planId: string, userId: string): Promise<ActivityPlanEntity> {
    const plan = await this.getPlan(planId, userId);

    if (plan.status !== 'scheduled') {
      throw new BadRequestException('Can only mark scheduled plans as missed');
    }

    plan.status = 'missed';
    return this.planRepository.save(plan);
  }
}