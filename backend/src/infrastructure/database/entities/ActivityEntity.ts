import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SportType } from '../../../domain/sport';

@Entity('activities')
export class ActivityEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column({ type: 'enum', enum: SportType })
  sportType!: SportType;

  @Column({ type: 'timestamp' })
  actualStartTime!: Date;

  @Column({ type: 'timestamp' })
  actualEndTime!: Date;

  // Location as JSONB - flexible structure
  @Column({ type: 'jsonb', nullable: true })
  actualLocation?: any; // Would be Location interface

  // Actual metrics as JSONB
  @Column({ type: 'jsonb' })
  actualMetrics!: any; // Would be ActivityMetrics interface

  // Sport-specific data as JSONB
  @Column({ type: 'jsonb', nullable: true })
  sportSpecificData?: any; // Would be SportSpecificData

  @Column({ type: 'varchar', nullable: true })
  planId?: string; // Optional reference to ActivityPlan

  @Column({ type: 'enum', enum: ['recorded', 'manual_entry', 'imported'], default: 'recorded' })
  status!: 'recorded' | 'manual_entry' | 'imported';

  // Suppression logique : distincte de `status`, qui designe la provenance
  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  source?: string;

  @Column({ type: 'varchar', nullable: true })
  externalId?: string;

  @Column({ type: 'boolean', default: false })
  isShared!: boolean;

  @Column({ type: 'enum', enum: ['private', 'friends', 'public'], default: 'private' })
  visibility!: 'private' | 'friends' | 'public';

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'varchar', array: true, nullable: true })
  mediaUrls?: string[];
}