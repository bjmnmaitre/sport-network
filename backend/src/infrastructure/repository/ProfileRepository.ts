import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ProfileEntity } from '../database/entities/ProfileEntity';
import { BaseRepository } from './base.repository';

@Injectable()
export class ProfileRepository extends BaseRepository<ProfileEntity> {
  constructor(
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
  ) {
    super(profileRepository);
  }

  /**
   * Find profile by userId
   */
  async findByUserId(userId: string): Promise<ProfileEntity | null> {
    return this.findOne({ userId } as FindOptionsWhere<ProfileEntity>);
  }

  /**
   * Find public profiles by sport
   */
  async findBySport(sport: string): Promise<ProfileEntity[]> {
    return this.profileRepository.find({
      where: {
        visibility: 'public',
      } as FindOptionsWhere<ProfileEntity>,
    }).then(profiles =>
      profiles.filter(p => p.primarySports.includes(sport))
    );
  }

  /**
   * Find profiles near location
   */
  async findNearby(latitude: number, longitude: number, radiusKm: number = 5): Promise<ProfileEntity[]> {
    if (!latitude || !longitude) return [];

    const profiles = await this.profileRepository.find({
      where: {
        visibility: 'public',
      } as FindOptionsWhere<ProfileEntity>,
    });

    return profiles.filter(p => {
      if (!p.latitude || !p.longitude) return false;
      const distance = this.calculateDistance(latitude, longitude, p.latitude, p.longitude);
      return distance <= radiusKm;
    });
  }

  /**
   * Find profiles by city
   */
  async findByCity(city: string): Promise<ProfileEntity[]> {
    return this.find({
      city,
      visibility: 'public',
    } as FindOptionsWhere<ProfileEntity>);
  }

  /**
   * Check ownership
   */
  async isOwner(profileId: string, userId: string): Promise<boolean> {
    return this.exists({
      id: profileId,
      userId,
    } as FindOptionsWhere<ProfileEntity>);
  }

  /**
   * Calculate distance between two coordinates (Haversine)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}