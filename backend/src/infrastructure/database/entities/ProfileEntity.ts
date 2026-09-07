import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToOne } from 'typeorm';
import { UserEntity } from './UserEntity';

@Entity('profiles')
@Index(['userId'], { unique: true })
@Index(['displayName'])
export class ProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true })
  userId!: string;

  @Column({ type: 'varchar' })
  displayName!: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'varchar', nullable: true })
  profileImageUrl?: string;

  // Location
  @Column({ type: 'varchar', nullable: true })
  city?: string;

  @Column({ type: 'varchar', nullable: true })
  region?: string;

  @Column({ type: 'varchar', nullable: true })
  country?: string;

  @Column({ type: 'float', nullable: true })
  latitude?: number;

  @Column({ type: 'float', nullable: true })
  longitude?: number;

  // Sports
  @Column({ type: 'text', array: true, default: () => `'{}'` })
  primarySports!: string[];

  // Levels
  @Column({ type: 'enum', enum: ['beginner', 'regular', 'experienced', 'competitor'], default: 'beginner' })
  declaredLevel!: 'beginner' | 'regular' | 'experienced' | 'competitor';

  // Visibility
  @Column({ type: 'enum', enum: ['private', 'friends_only', 'public'], default: 'public' })
  visibility!: 'private' | 'friends_only' | 'public';

  @Column({ type: 'boolean', default: false })
  isVerified!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  joinedAt!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  // Relation to user
  @OneToOne(() => UserEntity, user => user.profile)
  user!: UserEntity;
}