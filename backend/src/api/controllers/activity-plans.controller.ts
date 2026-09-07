import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  BadRequestException,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { ActivityPlanService } from '../../application/ActivityPlanService';
import { toSportType } from '../../domain/sport';
import {
  CreateActivityPlanDto,
  UpdateActivityPlanDto,
  StartActivityFromPlanDto,
  ConvertPlanDto,
  ActivityPlanResponseDto,
} from '../dtos/activity-plan.dto';

@Controller('api/v1/activity-plans')
export class ActivityPlansController {
  constructor(private planService: ActivityPlanService) {}

  /**
   * POST /api/v1/activity-plans
   * Create activity plan
   */
  @Post()
  @HttpCode(201)
  async createPlan(
    @Body(ValidationPipe) dto: CreateActivityPlanDto,
    @Req() req: Request,
  ): Promise<{ data: ActivityPlanResponseDto }> {
    const userId = this.getUserId(req);

    const plan = await this.planService.createPlan(
      userId,
      toSportType(dto.sportType),
      {
        plannedStartTime: new Date(dto.plannedStartTime),
        plannedEndTime: dto.plannedEndTime ? new Date(dto.plannedEndTime) : undefined,
        plannedLocation: dto.plannedLocation,
        plannedMetrics: dto.plannedMetrics,
        notes: dto.notes,
      },
    );

    return {
      data: ActivityPlanResponseDto.fromEntity(plan),
    };
  }

  /**
   * GET /api/v1/activity-plans/:id
   * Get plan by id
   */
  @Get(':id')
  async getPlan(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<{ data: ActivityPlanResponseDto }> {
    const userId = this.getUserId(req);
    const plan = await this.planService.getPlan(id, userId);

    return {
      data: ActivityPlanResponseDto.fromEntity(plan),
    };
  }

  /**
   * GET /api/v1/activity-plans
   * Get user's plans
   */
  @Get()
  async getUserPlans(@Req() req: Request): Promise<{ data: ActivityPlanResponseDto[] }> {
    const userId = this.getUserId(req);
    const plans = await this.planService.getUpcomingPlans(userId);

    return {
      data: ActivityPlanResponseDto.fromEntities(plans),
    };
  }

  /**
   * PATCH /api/v1/activity-plans/:id
   * Update plan
   */
  @Patch(':id')
  async updatePlan(
    @Param('id') id: string,
    @Body(ValidationPipe) dto: UpdateActivityPlanDto,
    @Req() req: Request,
  ): Promise<{ data: ActivityPlanResponseDto }> {
    const userId = this.getUserId(req);

    const plan = await this.planService.updatePlan(id, userId, {
      plannedStartTime: dto.plannedStartTime ? new Date(dto.plannedStartTime) : undefined,
      plannedEndTime: dto.plannedEndTime ? new Date(dto.plannedEndTime) : undefined,
      plannedLocation: dto.plannedLocation,
      notes: dto.notes,
    });

    return {
      data: ActivityPlanResponseDto.fromEntity(plan),
    };
  }

  /**
   * POST /api/v1/activity-plans/:id/start
   * Start activity from plan
   */
  @Post(':id/start')
  async startActivityFromPlan(
    @Param('id') id: string,
    @Body(ValidationPipe) dto: StartActivityFromPlanDto,
    @Req() req: Request,
  ): Promise<{ data: ActivityPlanResponseDto }> {
    const userId = this.getUserId(req);

    const plan = await this.planService.startActivityFromPlan(
      id,
      userId,
      dto.metrics,
    );

    return {
      data: ActivityPlanResponseDto.fromEntity(plan),
    };
  }

  /**
   * POST /api/v1/activity-plans/:id/convert
   * Convert plan to activity (link existing activity)
   */
  @Post(':id/convert')
  async convertPlanToActivity(
    @Param('id') id: string,
    @Body(ValidationPipe) dto: ConvertPlanDto,
    @Req() req: Request,
  ): Promise<{ data: ActivityPlanResponseDto }> {
    const userId = this.getUserId(req);

    const plan = await this.planService.convertPlanToActivity(
      id,
      dto.activityId,
      userId,
    );

    return {
      data: ActivityPlanResponseDto.fromEntity(plan),
    };
  }

  /**
   * DELETE /api/v1/activity-plans/:id
   * Cancel plan
   */
  @Delete(':id')
  @HttpCode(204)
  async cancelPlan(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<void> {
    const userId = this.getUserId(req);
    await this.planService.cancelPlan(id, userId);
  }

  /**
   * POST /api/v1/activity-plans/:id/missed
   * Mark plan as missed
   */
  @Post(':id/missed')
  async markMissed(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<{ data: ActivityPlanResponseDto }> {
    const userId = this.getUserId(req);
    const plan = await this.planService.markMissed(id, userId);

    return {
      data: ActivityPlanResponseDto.fromEntity(plan),
    };
  }

  // ===== HELPER =====
  private getUserId(req: Request): string {
    const userId = (req as any).userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in request');
    }
    return userId;
  }
}