/**
 * Sport Network - Activity Plan Model
 *
 * Represents a user's intention to perform an activity.
 * This is NOT automatically converted to an Activity - the link is optional.
 */

import { SportType } from './sport';
import { Location } from './sport';
import { ActivityMetrics } from './activity-metrics';
import { SportSpecificPlanData } from './sport-specific-data';

export interface ActivityPlan {
  /** Unique identifier */
  id: string;

  /** User who created this plan */
  userId: string;

  /** Type of sport/activity */
  sportType: SportType;

  /** Planned start time */
  plannedStartTime: Date;

  /** Planned end time (optional, can be derived from duration) */
  plannedEndTime?: Date;

  /** Planned location (route, venue, etc.) */
  plannedLocation?: Location;

  /** Planned metrics/targets (e.g., target distance, target calories) */
  plannedMetrics?: ActivityMetrics;

  /** Sport-specific plan details (e.g., route plan, interval training) */
  sportSpecificPlan?: SportSpecificPlanData;

  /** Current status of the plan */
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';

  /** When the plan was created */
  createdAt: Date;

  /** When the plan was last updated */
  updatedAt: Date;

  /** Optional: reference to a recurring series/template ID */
  seriesId?: string;

  /** Optional: notes or instructions for the activity */
  notes?: string;

  /** Optional: whether this plan is shared with others */
  isShared?: boolean;

  /** Optional: list of user IDs this is shared with (if isShared) */
  sharedWithUserIds?: string[];
}

/**
 * Validation helpers for ActivityPlan
 */
export namespace ActivityPlanValidation {
  /**
   * Validate that the plan has sensible times
   * @param plan The activity plan to validate
   * @returns Error message if invalid, null if valid
   */
  export function validateTimes(plan: ActivityPlan): string | null {
    if (plan.plannedEndTime && plan.plannedEndTime <= plan.plannedStartTime) {
      return 'Planned end time must be after planned start time';
    }
    return null;
  }

  /**
   * Validate that planned metrics are reasonable (non-negative where applicable)
   * @param plan The activity plan to validate
   * @returns Error message if invalid, null if valid
   */
  export function validateMetrics(plan: ActivityPlan): string | null {
    const metrics = plan.plannedMetrics;
    if (!metrics) return null;

    if (metrics.distanceMeters !== undefined && metrics.distanceMeters < 0) {
      return 'Planned distance cannot be negative';
    }
    if (metrics.durationSeconds !== undefined && metrics.durationSeconds < 0) {
      return 'Planned duration cannot be negative';
    }
    if (metrics.calories !== undefined && metrics.calories < 0) {
      return 'Planned calories cannot be negative';
    }
    return null;
  }
}