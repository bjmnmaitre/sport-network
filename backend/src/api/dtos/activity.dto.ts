import { IsString, IsDateString, IsOptional, IsEnum, MaxLength, IsObject } from 'class-validator';
import { SPORT_API_VALUES, toApiSportType } from '../../domain/sport';

// ===== CREATE ACTIVITY DTO =====
export class CreateActivityDto {
  @IsEnum(SPORT_API_VALUES)
  sportType!: string;

  @IsObject()
  metrics!: {
    distance?: number;
    duration: number; // seconds
    elevation?: number;
    pace?: string;
    heartRate?: number;
  };

  @IsDateString()
  completedAt!: string;

  @IsOptional()
  @IsEnum(['private', 'friends', 'group', 'public'])
  visibility?: string;

  @IsOptional()
  @MaxLength(500)
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  planId?: string;
}

// ===== UPDATE ACTIVITY DTO =====
export class UpdateActivityDto {
  @IsOptional()
  @IsEnum(['private', 'friends', 'group', 'public'])
  visibility?: string;

  @IsOptional()
  @MaxLength(500)
  @IsString()
  notes?: string;
}

// ===== ACTIVITY RESPONSE DTO =====
export class ActivityResponseDto {
  id!: string;
  userId!: string;
  sportType!: string;
  metrics: any;
  completedAt!: Date;
  visibility!: string;
  notes?: string;
  status!: string;
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(entity: any): ActivityResponseDto {
    const dto = new ActivityResponseDto();
    dto.id = entity.id;
    dto.userId = entity.userId;
    dto.sportType = toApiSportType(entity.sportType);
    dto.metrics = entity.actualMetrics;
    dto.completedAt = entity.actualEndTime;
    dto.visibility = entity.visibility;
    dto.notes = entity.notes;
    dto.status = entity.status;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  static fromEntities(entities: any[]): ActivityResponseDto[] {
    return entities.map(e => ActivityResponseDto.fromEntity(e));
  }
}

// ===== PROGRESSION RESPONSE DTO =====
export class ProgressionResponseDto {
  userId!: string;
  sportId!: string;
  period!: string;
  activities!: number;
  distance?: number;
  duration!: number;
  elevation?: number;
  avgPace?: string;
  avgHeartRate?: number;
  streakDays!: number;
  comparisonPreviousPeriod?: number;
}