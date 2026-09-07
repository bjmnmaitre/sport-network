import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { UserEntity } from '../database/entities/UserEntity';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {
    super(userRepository);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.findOne({ email } as FindOptionsWhere<UserEntity>);
  }

  /**
   * Find active user by email
   */
  async findActiveByEmail(email: string): Promise<UserEntity | null> {
    return this.findOne({
      email,
      status: 'active',
    } as FindOptionsWhere<UserEntity>);
  }

  /**
   * Find user by id with profile
   */
  async findWithProfile(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
    });
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    return this.exists({ email } as FindOptionsWhere<UserEntity>);
  }

  /**
   * Find users for deletion (past grace period)
   */
  async findPendingDeletion(): Promise<UserEntity[]> {
    const graceDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
    return this.userRepository.find({
      where: {
        status: 'deletion_requested',
      } as FindOptionsWhere<UserEntity>,
    }).then(users =>
      users.filter(u => u.deletionRequestedAt && u.deletionRequestedAt < graceDate)
    );
  }

  /**
   * Anonymize user
   */
  async anonymize(userId: string): Promise<UserEntity | null> {
    const user = await this.findById(userId);
    if (!user) return null;

    user.email = `deleted+${user.id}@sport-network.local`;
    user.passwordHash = '';
    user.status = 'anonymized';
    user.anonymizedAt = new Date();

    return this.save(user);
  }
}