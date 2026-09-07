/**
 * Unit tests for ActivityPlan model and validation
 */

import { ActivityPlan, ActivityPlanValidation } from '../domain/activity-plan';
import { SportType } from '../domain/sport';
import { ActivityMetrics } from '../domain/activity-metrics';

describe('ActivityPlan', () => {
  const basePlan: Omit<ActivityPlan, 'id' | 'createdAt' | 'updatedAt'> = {
    userId: 'user-123',
    sportType: SportType.RUNNING,
    plannedStartTime: new Date('2026-08-25T06:30:00Z'),
    plannedEndTime: new Date('2026-08-25T07:30:00Z'),
    status: 'scheduled'
  };

  it('should create a valid activity plan', () => {
    const plan: ActivityPlan = {
      id: 'plan-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...basePlan
    };

    expect(plan).toBeDefined();
    expect(plan.userId).toBe('user-123');
    expect(plan.sportType).toBe(SportType.RUNNING);
  });

  it('should validate correct times', () => {
    const plan: ActivityPlan = {
      id: 'plan-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...basePlan
    };

    const error = ActivityPlanValidation.validateTimes(plan);
    expect(error).toBeNull();
  });

  it('should reject end time before start time', () => {
    const invalidPlan: ActivityPlan = {
      id: 'plan-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...basePlan,
      plannedEndTime: new Date('2026-08-25T06:00:00Z') // Before start time
    };

    const error = ActivityPlanValidation.validateTimes(invalidPlan);
    expect(error).not.toBeNull();
    expect(error).toContain('Planned end time must be after planned start time');
  });

  it('should validate correct metrics', () => {
    const planWithMetrics: ActivityPlan = {
      id: 'plan-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...basePlan,
      plannedMetrics: {
        durationSeconds: 3600,
        distanceMeters: 10000,
        calories: 500
      } as ActivityMetrics
    };

    const error = ActivityPlanValidation.validateMetrics(planWithMetrics);
    expect(error).toBeNull();
  });

  it('should reject negative distance', () => {
    const invalidPlan: ActivityPlan = {
      id: 'plan-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...basePlan,
      plannedMetrics: {
        durationSeconds: 3600,
        distanceMeters: -1000, // Invalid negative distance
        calories: 500
      } as ActivityMetrics
    };

    const error = ActivityPlanValidation.validateMetrics(invalidPlan);
    expect(error).not.toBeNull();
    expect(error).toContain('Planned distance cannot be negative');
  });

  it('should reject negative duration', () => {
    const invalidPlan: ActivityPlan = {
      id: 'plan-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...basePlan,
      plannedMetrics: {
        durationSeconds: -3600, // Invalid negative duration
        distanceMeters: 10000,
        calories: 500
      } as ActivityMetrics
    };

    const error = ActivityPlanValidation.validateMetrics(invalidPlan);
    expect(error).not.toBeNull();
    expect(error).toContain('Planned duration cannot be negative');
  });
});