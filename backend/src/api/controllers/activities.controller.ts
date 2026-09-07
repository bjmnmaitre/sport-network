import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  UseGuards,
  BadRequestException,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { ActivityService } from '../../application/ActivityService';
import { SportType, toSportType } from '../../domain/sport';
import { ProgressionService } from '../../application/ProgressionService';
import {
  CreateActivityDto,
  UpdateActivityDto,
  ActivityResponseDto,
  ProgressionResponseDto,
} from '../dtos/activity.dto';

@Controller('api/v1/activities')
export class ActivitiesController {
  constructor(
    private activityService: ActivityService,
    private progressionService: ProgressionService,
  ) {}

  /**
   * POST /api/v1/activities
   * Create new activity
   */
  @Post()
  @HttpCode(201)
  async createActivity(
    @Body(ValidationPipe) dto: CreateActivityDto,
    @Req() req: Request,
  ): Promise<{ data: ActivityResponseDto }> {
    const userId = this.getUserId(req);

    const activity = await this.activityService.createActivity(
      userId,
      toSportType(dto.sportType),
      {
        metrics: dto.metrics,
        completedAt: new Date(dto.completedAt),
        visibility: (dto.visibility || 'private') as any,
        notes: dto.notes,
        planId: dto.planId,
      },
    );

    return {
      data: ActivityResponseDto.fromEntity(activity),
    };
  }

  /**
   * GET /api/v1/activities/:id
   * Get activity by id
   */
  @Get(':id')
  async getActivity(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<{ data: ActivityResponseDto }> {
    const userId = this.getUserId(req);

    const activity = await this.activityService.getActivity(id, userId);

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    return {
      data: ActivityResponseDto.fromEntity(activity),
    };
  }

  /**
   * GET /api/v1/activities
   * Get user's activities
   */
  @Get()
  async getUserActivities(@Req() req: Request): Promise<{ data: ActivityResponseDto[] }> {
    const userId = this.getUserId(req);

    const activities = await this.activityService.getUserActivities(userId);

    return {
      data: ActivityResponseDto.fromEntities(activities),
    };
  }

  /**
   * PATCH /api/v1/activities/:id
   * Update activity (visibility, notes)
   */
  @Patch(':id')
  async updateActivity(
    @Param('id') id: string,
    @Body(ValidationPipe) dto: UpdateActivityDto,
    @Req() req: Request,
  ): Promise<{ data: ActivityResponseDto }> {
    const userId = this.getUserId(req);

    if (dto.visibility) {
      const activity = await this.activityService.updateVisibility(
        id,
        userId,
        dto.visibility as any,
      );
      return { data: ActivityResponseDto.fromEntity(activity) };
    }

    if (dto.notes) {
      const activity = await this.activityService.updateNotes(
        id,
        userId,
        dto.notes,
      );
      return { data: ActivityResponseDto.fromEntity(activity) };
    }

    throw new BadRequestException('No valid fields to update');
  }

  /**
   * DELETE /api/v1/activities/:id
   * Delete activity (soft delete)
   */
  @Delete(':id')
  @HttpCode(204)
  async deleteActivity(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<void> {
    const userId = this.getUserId(req);
    await this.activityService.deleteActivity(id, userId);
  }

  /**
   * GET /api/v1/activities/:id/progress
   * Get progression for activity's sport
   */
  @Get(':id/progress')
  async getActivityProgress(
    @Param('id') id: string,
    @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'week',
    @Req() req: Request,
  ): Promise<{ data: ProgressionResponseDto }> {
    const userId = this.getUserId(req);
    const activity = await this.activityService.getActivity(id, userId);

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    const progression = await this.activityService.getProgression(
      userId,
      activity.sportType,
      period,
    );

    return { data: progression as any };
  }

  /**
   * GET /api/v1/activities/:id/personal-best
   * Get personal best for activity's sport
   */
  @Get(':id/personal-best')
  async getPersonalBest(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<{ data: any }> {
    const userId = this.getUserId(req);
    const activity = await this.activityService.getActivity(id, userId);

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    const best = await this.activityService.getPersonalBest(
      userId,
      activity.sportType,
    );

    return { data: best || { message: 'No activities recorded yet' } };
  }

  /**
   * GET /api/v1/activities/user/progress
   * Get all progression metrics for user
   */
  @Get('user/:userId/progress')
  async getUserProgress(
    @Param('userId') userId: string,
    @Query('sport') sport: string,
    @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'week',
  ): Promise<{ data: ProgressionResponseDto }> {
    const progression = await this.activityService.getProgression(
      userId,
      this.parseSportType(sport),
      period,
    );

    return { data: progression as any };
  }

  /**
   * GET /api/v1/activities/discover
   * Discover public activities
   */
  @Get('discover/public')
  async discoverActivities(
    @Query('sport') sport?: string,
  ): Promise<{ data: ActivityResponseDto[] }> {
    const activities = await this.activityService.discoverActivities(
      sport ? this.parseSportType(sport) : undefined,
    );

    return {
      data: ActivityResponseDto.fromEntities(activities),
    };
  }

  // ===== HELPERS =====
  private parseSportType(value: string): SportType {
    try {
      return toSportType(value);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  private getUserId(req: Request): string {
    const userId = (req as any).userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in request');
    }
    return userId;
  }
}