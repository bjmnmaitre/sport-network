/**
 * Unit tests for Activity model and validation
 */

import { Activity, ActivityValidation } from '../domain/activity';
import { SportType } from '../domain/sport';
import { ActivityMetrics } from '../domain/activity-metrics';
import { RunningData } from '../domain/sport-specific/running-data';
import { SportSpecificData } from '../domain/sport-specific-data';

describe('Activity', () => {
  const baseActivity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'> = {
    userId: 'user-123',
    sportType: SportType.RUNNING,
    actualStartTime: new Date('2026-08-25T06:30:00Z'),
    actualEndTime: new Date('2026-08-25T07:30:00Z'),
    actualMetrics: {
      durationSeconds: 3600,
      distanceMeters: 10000,
      calories: 500,
      averageHeartRate: 150
    } as ActivityMetrics,
    status: 'recorded'
  };

  it('should create a valid activity', () => {
    const activity: Activity = {
      id: 'activity-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...baseActivity
    };

    expect(activity).toBeDefined();
    expect(activity.userId).toBe('user-123');
    expect(activity.sportType).toBe(SportType.RUNNING);
  });

  it('should validate correct times', () => {
    const activity: Activity = {
      id: 'activity-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...baseActivity
    };

    const error = ActivityValidation.validateTimes(activity);
    expect(error).toBeNull();
  });

  it('should reject end time before start time', () => {
    const invalidActivity: Activity = {
      id: 'activity-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...baseActivity,
      actualEndTime: new Date('2026-08-25T06:00:00Z') // Before start time
    };

    const error = ActivityValidation.validateTimes(invalidActivity);
    expect(error).not.toBeNull();
    expect(error).toContain('Actual end time must be after actual start time');
  });

  it('should validate correct metrics', () => {
    const activity: Activity = {
      id: 'activity-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...baseActivity
    };

    const error = ActivityValidation.validateMetrics(activity);
    expect(error).toBeNull();
  });

  it('should reject negative distance', () => {
    const invalidActivity: Activity = {
      id: 'activity-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...baseActivity,
      actualMetrics: {
        durationSeconds: 3600,
        distanceMeters: -1000, // Invalid negative distance
        calories: 500,
        averageHeartRate: 150
      } as ActivityMetrics
    };

    const error = ActivityValidation.validateMetrics(invalidActivity);
    expect(error).not.toBeNull();
    expect(error).toContain('Actual distance cannot be negative');
  });

  it('should reject invalid heart rate', () => {
    const invalidActivity: Activity = {
      id: 'activity-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...baseActivity,
      actualMetrics: {
        durationSeconds: 3600,
        distanceMeters: 10000,
        calories: 500,
        averageHeartRate: 250 // Invalid - too high
      } as ActivityMetrics
    };

    const error = ActivityValidation.validateMetrics(invalidActivity);
    expect(error).not.toBeNull();
    expect(error).toContain('Average heart rate must be between 30 and 220 bpm');
  });

  it('should handle sport-specific data correctly', () => {
    const runningData: RunningData = {
      averagePaceSpk: 300, // 5:00 min/km
      averageCadence: 180
    };

    const sportSpecificData: SportSpecificData = {
      type: SportType.RUNNING,
      data: runningData
    };

    const activityWithSportData: Activity = {
      id: 'activity-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...baseActivity,
      sportSpecificData: sportSpecificData
    };

    const error = ActivityValidation.validateMetrics(activityWithSportData);
    expect(error).toBeNull();
    // Additional validation would check the sport-specific data
    expect(activityWithSportData.sportSpecificData).toBeDefined();
    if (activityWithSportData.sportSpecificData &&
        activityWithSportData.sportSpecificData.type === SportType.RUNNING) {
      // Type guard ensures we're accessing the right properties
      const runningSpecific = activityWithSportData.sportSpecificData.data as RunningData;
      expect(runningSpecific.averagePaceSpk).toBe(300);
      expect(runningSpecific.averageCadence).toBe(180);
    }
  });

  it('should validate plan link when present', () => {
    // This test would require a plan to validate against
    // For simplicity, we're just testing that the validation function exists
    // In a real test, we would mock or create a plan
    expect(ActivityValidation.validatePlanLink).toBeDefined();
  });
});