import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ActivityRepository } from '../infrastructure/repository/ActivityRepository';
import { ActivityPlanRepository } from '../infrastructure/repository/ActivityPlanRepository';
import { ProgressionService } from './ProgressionService';
import { Visibility } from '../domain/activity';
import { ActivityEntity } from '../infrastructure/database/entities/ActivityEntity';
import { SportType } from '../domain/sport';

@Injectable()
export class ActivityService {
  constructor(
    private activityRepository: ActivityRepository,
    private planRepository: ActivityPlanRepository,
    private progressionService: ProgressionService,
  ) {}

  /**
   * Create new activity
   */
  async createActivity(
    userId: string,
    sportType: SportType,
    data: {
      metrics: any;
      completedAt: Date;
      visibility?: Visibility;
      notes?: string;
      planId?: string;
    },
  ): Promise<ActivityEntity> {
    // Validate plan link if provided
    if (data.planId) {
      const isOwner = await this.planRepository.isOwner(data.planId, userId);
      if (!isOwner) {
        throw new BadRequestException('Plan does not belong to user');
      }
    }

    const activity = new ActivityEntity();
    activity.userId = userId;
    activity.sportType = sportType;
    activity.actualMetrics = data.metrics;
    activity.actualEndTime = data.completedAt;
    // actualStartTime est NOT NULL et le contrat d'entree ne fournit que la fin
    // et la duree (obligatoire dans CreateActivityDto) : on en deduit le debut.
    activity.actualStartTime = new Date(
      data.completedAt.getTime() - (data.metrics?.duration ?? 0) * 1000,
    );
    activity.visibility = data.visibility || 'private';
    activity.notes = data.notes;
    activity.planId = data.planId;
    activity.status = 'recorded';

    return this.activityRepository.save(activity);
  }

  /**
   * Get activity by id (with visibility check)
   */
  async getActivity(
    activityId: string,
    requestingUserId?: string,
  ): Promise<ActivityEntity | null> {
    const activity = await this.activityRepository.findById(activityId);

    if (!activity) return null;

    // Check visibility
    if (activity.visibility === 'private' && activity.userId !== requestingUserId) {
      throw new BadRequestException('Activity is private');
    }

    return activity;
  }

  /**
   * Get user's activities
   */
  async getUserActivities(userId: string): Promise<ActivityEntity[]> {
    return this.activityRepository.findByUserId(userId);
  }

  /**
   * Update activity visibility
   */
  async updateVisibility(
    activityId: string,
    userId: string,
    visibility: Visibility,
  ): Promise<ActivityEntity> {
    const isOwner = await this.activityRepository.isOwner(activityId, userId);
    if (!isOwner) {
      throw new BadRequestException('Activity does not belong to user');
    }

    const activity = await this.activityRepository.findById(activityId);
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    activity.visibility = visibility;
    return this.activityRepository.save(activity);
  }

  /**
   * Update activity notes
   */
  async updateNotes(
    activityId: string,
    userId: string,
    notes: string,
  ): Promise<ActivityEntity> {
    if (notes.length > 500) {
      throw new BadRequestException('Notes must be 500 characters or less');
    }

    const isOwner = await this.activityRepository.isOwner(activityId, userId);
    if (!isOwner) {
      throw new BadRequestException('Activity does not belong to user');
    }

    const activity = await this.activityRepository.findById(activityId);
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    activity.notes = notes;
    return this.activityRepository.save(activity);
  }

  /**
   * Get user progression for sport and period
   */
  async getProgression(
    userId: string,
    sportType: SportType,
    period: 'day' | 'week' | 'month' | 'year',
  ) {
    return this.progressionService.calculateProgression(userId, sportType, period);
  }

  /**
   * Get personal best for sport
   */
  async getPersonalBest(userId: string, sportType: SportType) {
    return this.progressionService.getPersonalBest(userId, sportType);
  }

  /**
   * Discover public activities
   */
  async discoverActivities(sportType?: SportType): Promise<ActivityEntity[]> {
    return this.activityRepository.findPublicActivities(sportType);
  }

  /**
   * Delete activity (soft delete)
   */
  async deleteActivity(activityId: string, userId: string): Promise<void> {
    const isOwner = await this.activityRepository.isOwner(activityId, userId);
    if (!isOwner) {
      throw new BadRequestException('Activity does not belong to user');
    }

    const activity = await this.activityRepository.findById(activityId);
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    activity.deletedAt = new Date();
    await this.activityRepository.save(activity);
  }
}