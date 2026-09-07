import { IsString, IsDateString, IsOptional, IsEnum, MaxLength, IsObject } from 'class-validator';
import { SPORT_API_VALUES, toApiSportType } from '../../domain/sport';

// ===== CREATE PLAN DTO =====
export class CreateActivityPlanDto {
  @IsEnum(SPORT_API_VALUES)
  sportType!: string;

  @IsDateString()
  plannedStartTime!: string;

  @IsOptional()
  @IsDateString()
  plannedEndTime?: string;

  @IsOptional()
  @IsObject()
  plannedLocation?: any;

  @IsOptional()
  @IsObject()
  plannedMetrics?: any;

  @IsOptional()
  @MaxLength(500)
  @IsString()
  notes?: string;
}

// ===== UPDATE PLAN DTO =====
export class UpdateActivityPlanDto {
  @IsOptional()
  @IsDateString()
  plannedStartTime?: string;

  @IsOptional()
  @IsDateString()
  plannedEndTime?: string;

  @IsOptional()
  @IsObject()
  plannedLocation?: any;

  @IsOptional()
  @MaxLength(500)
  @IsString()
  notes?: string;
}

// ===== START ACTIVITY FROM PLAN DTO =====
export class StartActivityFromPlanDto {
  @IsObject()
  metrics!: {
    distance?: number;
    duration: number;
    elevation?: number;
    pace?: string;
  };
}

// ===== CONVERT PLAN DTO =====
export class ConvertPlanDto {
  @IsString()
  activityId!: string;
}

// ===== PLAN RESPONSE DTO =====
export class ActivityPlanResponseDto {
  id!: string;
  userId!: string;
  sportType!: string;
  plannedStartTime!: Date;
  plannedEndTime?: Date;
  plannedLocation?: any;
  plannedMetrics?: any;
  status!: string;
  activityId?: string;
  notes?: string;
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(entity: any): ActivityPlanResponseDto {
    const dto = new ActivityPlanResponseDto();
    dto.id = entity.id;
    dto.userId = entity.userId;
    dto.sportType = toApiSportType(entity.sportType);
    dto.plannedStartTime = entity.plannedStartTime;
    dto.plannedEndTime = entity.plannedEndTime;
    dto.plannedLocation = entity.plannedLocation;
    dto.plannedMetrics = entity.plannedMetrics;
    dto.status = entity.status;
    dto.activityId = entity.activityId;
    dto.notes = entity.notes;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  static fromEntities(entities: any[]): ActivityPlanResponseDto[] {
    return entities.map(e => ActivityPlanResponseDto.fromEntity(e));
  }
}