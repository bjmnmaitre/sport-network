import { IsString, IsOptional, IsArray, IsEnum, MaxLength, IsNumber } from 'class-validator';

// ===== UPDATE PROFILE DTO =====
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  primarySports?: string[];

  @IsOptional()
  @IsEnum(['beginner', 'regular', 'experienced', 'competitor'])
  declaredLevel?: string;

  @IsOptional()
  @IsEnum(['private', 'friends_only', 'public'])
  visibility?: string;
}

// ===== PROFILE RESPONSE DTO =====
export class ProfileResponseDto {
  id!: string;
  userId!: string;
  displayName!: string;
  bio?: string;
  profileImageUrl?: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  primarySports!: string[];
  declaredLevel!: string;
  visibility!: string;
  isVerified!: boolean;
  joinedAt!: Date;

  static fromEntity(entity: any): ProfileResponseDto {
    const dto = new ProfileResponseDto();
    dto.id = entity.id;
    dto.userId = entity.userId;
    dto.displayName = entity.displayName;
    dto.bio = entity.bio;
    dto.profileImageUrl = entity.profileImageUrl;
    dto.city = entity.city;
    dto.region = entity.region;
    dto.country = entity.country;
    dto.latitude = entity.latitude;
    dto.longitude = entity.longitude;
    dto.primarySports = entity.primarySports;
    dto.declaredLevel = entity.declaredLevel;
    dto.visibility = entity.visibility;
    dto.isVerified = entity.isVerified;
    dto.joinedAt = entity.joinedAt;
    return dto;
  }
}