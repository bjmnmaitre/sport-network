/**
 * Sport Network - Activity Model
 *
 * Represents an actually performed activity (workout, session, etc.).
 * This is distinct from ActivityPlan - the link is optional, not automatic.
 */

import { SportType } from './sport';
import { Location } from './sport';
import { ActivityMetrics } from './activity-metrics';
import { SportSpecificData } from './sport-specific-data';
import { ActivityPlan } from './activity-plan';

export interface Activity {
  /** Unique identifier */
  id: string;

  /** User who performed this activity */
  userId: string;

  /** Type of sport/activity */
  sportType: SportType;

  /** Actual start time */
  actualStartTime: Date;

  /** Actual end time */
  actualEndTime: Date;

  /** Actual location where activity was performed */
  actualLocation?: Location;

  /** Actual measured metrics */
  actualMetrics: ActivityMetrics;

  /** Sport-specific measurements/data */
  sportSpecificData?: SportSpecificData;

  /** Optional reference to the ActivityPlan that motivated this activity */
  planId?: string;

  /** Status of the activity record */
  status: 'recorded' | 'manual_entry' | 'imported';

  /** When the activity record was created */
  createdAt: Date;

  /** When the activity record was last updated */
  updatedAt: Date;

  /** Source of the activity data (garmin, strava, manual, etc.) */
  source?: string;

  /** External ID from source system (for syncing) */
  externalId?: string;

  /** Whether this activity was shared publicly or with friends */
  isShared?: boolean;

  /** Visibility level: private, friends, public */
  visibility?: 'private' | 'friends' | 'public';

  /** Notes or reflections on the activity */
  notes?: string;

  /** Photos or media associated with the activity */
  mediaUrls?: string[];
}

/** Visibility level of an activity */
export type Visibility = NonNullable<Activity['visibility']>;

/**
 * Validation helpers for Activity
 */
export namespace ActivityValidation {
  /**
   * Validate that the activity has sensible times
   * @param activity The activity to validate
   * @returns Error message if invalid, null if valid
   */
  export function validateTimes(activity: Activity): string | null {
    if (activity.actualEndTime <= activity.actualStartTime) {
      return 'Actual end time must be after actual start time';
    }
    return null;
  }

  /**
   * Validate that actual metrics are reasonable (non-negative where applicable)
   * @param activity The activity to validate
   * @returns Error message if invalid, null if valid
   */
  export function validateMetrics(activity: Activity): string | null {
    const metrics = activity.actualMetrics;
    if (!metrics) return null;

    if (metrics.distanceMeters !== undefined && metrics.distanceMeters < 0) {
      return 'Actual distance cannot be negative';
    }
    if (metrics.durationSeconds !== undefined && metrics.durationSeconds < 0) {
      return 'Actual duration cannot be negative';
    }
    if (metrics.calories !== undefined && metrics.calories < 0) {
      return 'Actual calories cannot be negative';
    }
    if (metrics.averageHeartRate !== undefined &&
        (metrics.averageHeartRate < 30 || metrics.averageHeartRate > 220)) {
      return 'Average heart rate must be between 30 and 220 bpm';
    }
    if (metrics.maxHeartRate !== undefined &&
        (metrics.maxHeartRate < 30 || metrics.maxHeartRate > 220)) {
      return 'Max heart rate must be between 30 and 220 bpm';
    }
    return null;
  }

  /**
   * Validate that if linked to a plan, times, user, and sport type match
   * @param activity The activity to validate
   * @param plan Optional plan to validate against
   * @returns Error message if invalid, null if valid
   */
  export function validatePlanLink(activity: Activity, plan?: ActivityPlan | null): string | null {
    if (!plan || !activity.planId) return null;

    // User must match
    if (plan.userId !== activity.userId) {
      return 'Activity plan user ID does not match activity user ID';
    }
    // Sport type must match
    if (plan.sportType !== activity.sportType) {
      return 'Activity plan sport type does not match activity sport type';
    }
    // If we have a plan, check that times are reasonably close (within 2 hours)
    const timeDiffMs = Math.abs(activity.actualStartTime.getTime() - plan.plannedStartTime.getTime());
    const twoHoursMs = 2 * 60 * 60 * 1000;
    if (timeDiffMs > twoHoursMs) {
      return 'Activity start time is too far from planned start time (more than 2 hours difference)';
    }
    return null;
  }

  /**
   * Validate that notes length is reasonable
   * @param activity The activity to validate
   * @returns Error message if invalid, null if valid
   */
  export function validateNotesLength(activity: Activity): string | null {
    const maxLength = 500;
    if (activity.notes && activity.notes.length > maxLength) {
      return `Activity notes must not exceed ${maxLength} characters`;
    }
    return null;
  }

  /**
   * Validate that mediaUrls array size is reasonable
   * @param activity The activity to validate
   * @returns Error message if invalid, null if valid
   */
  export function validateMediaUrlsCount(activity: Activity): string | null {
    const maxCount = 10;
    if (activity.mediaUrls && activity.mediaUrls.length > maxCount) {
      return `Activity mediaUrls must not exceed ${maxCount} items`;
    }
    return null;
  }
}