import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToOne, JoinColumn } from 'typeorm';
import { ProfileEntity } from './ProfileEntity';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['status'])
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar' })
  passwordHash!: string;

  @Column({ type: 'enum', enum: ['active', 'suspended', 'deletion_requested', 'anonymized'], default: 'active' })
  status!: 'active' | 'suspended' | 'deletion_requested' | 'anonymized';

  @Column({ type: 'boolean', default: false })
  emailVerified!: boolean;

  @Column({ type: 'varchar', nullable: true })
  preferredLanguage?: string;

  @Column({ type: 'varchar', nullable: true })
  timezone?: string;

  // Deletion tracking
  @Column({ type: 'timestamp', nullable: true })
  deletionRequestedAt?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  anonymizedAt?: Date;

  // Relation to profile (1:1)
  @OneToOne(() => ProfileEntity, profile => profile.user, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profileId' })
  profile!: ProfileEntity;

  @Column({ type: 'uuid', nullable: true })
  profileId!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}