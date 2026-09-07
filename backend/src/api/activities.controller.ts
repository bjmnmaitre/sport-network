/**
 * Sport Network - Activities Controller
 *
 * REST-style controller for activity endpoints.
 * In a real implementation, this would be connected to an HTTP framework like Express.
 */

import { Activity } from '../domain/activity';
import { SportType } from '../domain/sport';
import * as activityTrackingService from '../application/activity-tracking.service';

/**
 * Get all activities for a user with optional filtering
 * @param userId The user ID (would come from auth in real implementation)
 * @param queryParams Query parameters for filtering
 * @returns Array of activities
 */
export function getActivities(
  userId: string,
  queryParams: {
    sportType?: SportType;
    startDateFrom?: string; // ISO date string
    startDateTo?: string;   // ISO date string
    limit?: number;
    offset?: number;
  }
): Activity[] {
  const filters: any = {};
  if (queryParams.sportType) filters.sportType = queryParams.sportType;
  if (queryParams.startDateFrom) filters.startDateFrom = new Date(queryParams.startDateFrom);
  if (queryParams.startDateTo) filters.startDateTo = new Date(queryParams.startDateTo);
  if (queryParams.limit) filters.limit = queryParams.limit;
  if (queryParams.offset) filters.offset = queryParams.offset;

  return activityTrackingService.getActivitiesByUser(userId, filters);
}

/**
 * Get a specific activity by ID
 * @param id The activity ID
 * @param userId The user ID (for authorization check)
 * @returns The activity if found and belongs to user
 */
export function getActivityById(
  id: string,
  userId: string
): Activity | null {
  const activity = activityTrackingService.getActivityById(id);
  if (!activity) return null;
  // Authorization check: ensure the activity belongs to the user
  if (activity.userId !== userId) return null;
  return activity;
}

/**
 * Record a new activity
 * @param userId The user ID (would come from auth)
 * @param activityData The activity data (without id and timestamps)
 * @returns The recorded activity
 */
export function recordActivity(
  userId: string,
  activityData: Omit<Activity, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Activity {
  // Ensure the activity belongs to the authenticated user
  const activityWithUserId = { ...activityData, userId };
  return activityTrackingService.recordActivity(activityWithUserId);
}

/**
 * Update an existing activity
 * @param id The activity ID
 * @param userId The user ID (for authorization check)
* @param updates The fields to update
 * @returns The updated activity if found and belongs to user
 */
export function updateActivity(
  id: string,
  userId: string,
  updates: Partial<Omit<Activity, 'id' | 'userId' | 'createdAt'>>
): Activity | null {
  // First check if the activity exists and belongs to the user
  const existing = activityTrackingService.getActivityById(id);
  if (!existing || existing.userId !== userId) return null;

  // Perform the update
  return activityTrackingService.updateActivity(id, updates);
}

/**
 * Delete an activity
 * @param id The activity ID
 * @param userId The user ID (for authorization check)
 * @returns True if deleted, false if not found or not authorized
 */
export function deleteActivity(
  id: string,
  userId: string
): boolean {
  // First check if the activity exists and belongs to the user
  const existing = activityTrackingService.getActivityById(id);
  if (!existing || existing.userId !== userId) return false;

  // Perform the deletion
  return activityTrackingService.deleteActivity(id);
}

/**
 * Get recent activities for a user
 * @param userId The user ID
 * @param daysAgo How many days ago to look back (default 7)
 * @returns Array of recent activities
 */
export function getRecentActivities(
  userId: string,
  daysAgo?: number
): Activity[] {
  const days = daysAgo ?? 7;
  return activityTrackingService.getRecentActivities(userId, days);
}

/**
 * Get activity statistics for a user
 * @param userId The user ID
 * @param sportType Optional sport type to filter by
 * @param daysAgo Number of days to look back (default 30)
 * @returns Statistics object
 */
export function getActivityStatistics(
  userId: string,
  sportType?: SportType,
  daysAgo?: number
) {
  const days = daysAgo ?? 30;
  return activityTrackingService.getActivityStatistics(userId, sportType, days);
}