import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
  NotFoundException,
  BadRequestException,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { ProfileRepository } from '../../infrastructure/repository/ProfileRepository';
import { AuthGuard } from '../guards/auth.guard';
import { UpdateProfileDto, ProfileResponseDto } from '../dtos/profile.dto';

@Controller('api/v1/profile')
export class ProfileController {
  constructor(private profileRepository: ProfileRepository) {}

  /**
   * GET /api/v1/profile/me
   * Get current user's profile
   */
  @Get('me')
  @UseGuards(AuthGuard)
  async getMyProfile(@Req() req: Request): Promise<{ data: ProfileResponseDto }> {
    const userId = this.getUserId(req);

    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return {
      data: ProfileResponseDto.fromEntity(profile),
    };
  }

  /**
   * GET /api/v1/profile/:userId
   * Get user profile (public or with permission)
   */
  @Get(':userId')
  async getUserProfile(
    @Param('userId') userId: string,
    @Req() req?: Request,
  ): Promise<{ data: ProfileResponseDto }> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Check visibility
    const requestingUserId = (req as any)?.userId;
    if (profile.visibility === 'private' && profile.userId !== requestingUserId) {
      throw new BadRequestException('Profile is private');
    }

    return {
      data: ProfileResponseDto.fromEntity(profile),
    };
  }

  /**
   * PATCH /api/v1/profile/me
   * Update own profile
   */
  @Patch('me')
  @UseGuards(AuthGuard)
  async updateMyProfile(
    @Body(ValidationPipe) dto: UpdateProfileDto,
    @Req() req: Request,
  ): Promise<{ data: ProfileResponseDto }> {
    const userId = this.getUserId(req);

    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Update fields
    Object.assign(profile, dto);

    const updated = await this.profileRepository.save(profile);

    return {
      data: ProfileResponseDto.fromEntity(updated),
    };
  }

  /**
   * GET /api/v1/profile/discover/nearby
   * Find profiles nearby
   */
  @Get('discover/nearby')
  async discoverNearby(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('radius') radius: string = '5',
  ): Promise<{ data: ProfileResponseDto[] }> {
    if (!latitude || !longitude) {
      throw new BadRequestException('Latitude and longitude required');
    }

    const profiles = await this.profileRepository.findNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(radius),
    );

    return {
      data: profiles.map(p => ProfileResponseDto.fromEntity(p)),
    };
  }

  /**
   * GET /api/v1/profile/discover/sport/:sport
   * Find profiles by sport
   */
  @Get('discover/sport/:sport')
  async discoverBySport(
    @Param('sport') sport: string,
  ): Promise<{ data: ProfileResponseDto[] }> {
    const profiles = await this.profileRepository.findBySport(sport);

    return {
      data: profiles.map(p => ProfileResponseDto.fromEntity(p)),
    };
  }

  /**
   * GET /api/v1/profile/discover/city/:city
   * Find profiles by city
   */
  @Get('discover/city/:city')
  async discoverByCity(
    @Param('city') city: string,
  ): Promise<{ data: ProfileResponseDto[] }> {
    const profiles = await this.profileRepository.findByCity(city);

    return {
      data: profiles.map(p => ProfileResponseDto.fromEntity(p)),
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