import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SportType } from '../../../domain/sport';

@Entity('activity_plans')
export class ActivityPlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column({ type: 'enum', enum: SportType })
  sportType!: SportType;

  @Column({ type: 'timestamp' })
  plannedStartTime!: Date;

  @Column({ type: 'timestamp', nullable: true })
  plannedEndTime?: Date;

  // Location as JSONB - flexible structure
  @Column({ type: 'jsonb', nullable: true })
  plannedLocation?: any; // Would be Location interface

  // Planned metrics as JSONB
  @Column({ type: 'jsonb', nullable: true })
  plannedMetrics?: any; // Would be ActivityMetrics interface

  // Sport-specific plan data as JSONB
  @Column({ type: 'jsonb', nullable: true })
  sportSpecificPlan?: any; // Would be SportSpecificPlanData

  @Column({ type: 'enum', enum: ['scheduled', 'completed', 'cancelled', 'missed'], default: 'scheduled' })
  status!: 'scheduled' | 'completed' | 'cancelled' | 'missed';

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  // Lien optionnel vers l'activite realisee (cf. CLAUDE.md : la liaison n'est pas automatique)
  @Column({ type: 'uuid', nullable: true })
  activityId?: string;

  @Column({ type: 'varchar', nullable: true })
  seriesId?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'boolean', default: false })
  isShared!: boolean;

  @Column({ type: 'varchar', array: true, nullable: true })
  sharedWithUserIds?: string[];
}