/**
 * Sport Network - Activity Tracking Service
 *
 * Service for managing actual activities (performed workouts, sessions, etc.).
 * Handles recording, retrieval, updating, and deletion of activities.
 */

import { Activity, ActivityValidation } from '../domain/activity';
import { SportType } from '../domain/sport';
import { v4 as uuidv4 } from 'uuid';

/**
 * In-memory storage for activities (in real implementation, this would be a database)
 */
let activities: Map<string, Activity> = new Map();

/**
 * Record a new activity
 * @param activityData The data for the new activity (without id and timestamps)
 * @returns The recorded activity
 */
export function recordActivity(activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Activity {
  const now = new Date();
  const activity: Activity = {
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
    ...activityData
  };

  // Validate the activity
  const timeError = ActivityValidation.validateTimes(activity);
  if (timeError) {
    throw new Error(`Invalid activity times: ${timeError}`);
  }

  const metricsError = ActivityValidation.validateMetrics(activity);
  if (metricsError) {
    throw new Error(`Invalid activity metrics: ${metricsError}`);
  }

  // If linked to a plan, validate the plan link
  if (activity.planId) {
    // In a real implementation, we would fetch the plan from storage
    // For now, we'll skip this validation as we don't have plan storage access here
    // The validation would happen in the controller/service layer
  }

  // Store the activity
  activities.set(activity.id, activity);

  return activity;
}

/**
 * Retrieve an activity by ID
 * @param id The ID of the activity to retrieve
 * @returns The activity if found, null otherwise
 */
export function getActivityById(id: string): Activity | null {
  return activities.get(id) || null;
}

/**
 * Retrieve activities for a user with optional filtering
 * @param userId The user ID to filter by
 * @param filters Optional filters (sportType, dateRange, etc.)
 * @returns Array of matching activities
 */
export function getActivitiesByUser(
  userId: string,
  filters: {
    sportType?: SportType;
    startDateFrom?: Date;
    startDateTo?: Date;
    limit?: number;
    offset?: number;
  } = {}
): Activity[] {
  let acts = Array.from(activities.values())
    .filter(activity => activity.userId === userId);

  // Apply filters
  if (filters.sportType) {
    acts = acts.filter(activity => activity.sportType === filters.sportType);
  }

  if (filters.startDateFrom) {
    const startDateFrom = filters.startDateFrom;
    acts = acts.filter(activity => activity.actualStartTime >= startDateFrom);
  }

  if (filters.startDateTo) {
    const startDateTo = filters.startDateTo;
    acts = acts.filter(activity => activity.actualStartTime <= startDateTo);
  }

  // Sort by actual start time (newest first)
  acts.sort((a, b) => b.actualStartTime.getTime() - a.actualStartTime.getTime());

  // Apply pagination
  const start = filters.offset ?? 0;
  const end = filters.limit ? start + filters.limit : acts.length;
  return acts.slice(start, end);
}

/**
 * Update an existing activity
 * @param id The ID of the activity to update
 * @param updates The fields to update (partial update)
 * @returns The updated activity if found, null otherwise
 */
export function updateActivity(
  id: string,
  updates: Partial<Omit<Activity, 'id' | 'createdAt'>>
): Activity | null {
  const existingActivity = activities.get(id);
  if (!existingActivity) {
    return null;
  }

  // Merge updates while preserving id and createdAt
  const updatedActivity: Activity = {
    ...existingActivity,
    ...updates,
    updatedAt: new Date()
  };

  // Validate the updated activity
  const timeError = ActivityValidation.validateTimes(updatedActivity);
  if (timeError) {
    throw new Error(`Invalid activity times: ${timeError}`);
  }

  const metricsError = ActivityValidation.validateMetrics(updatedActivity);
  if (metricsError) {
    throw new Error(`Invalid activity metrics: ${metricsError}`);
  }

  // Store the updated activity
  activities.set(id, updatedActivity);

  return updatedActivity;
}

/**
 * Delete an activity
 * @param id The ID of the activity to delete
 * @returns True if the activity was deleted, false if not found
 */
export function deleteActivity(id: string): boolean {
  return activities.delete(id);
}

/**
 * Get recent activities for a user
 * @param userId The user ID
 * @param daysAgo How many days ago to look back (default 7)
 * @returns Array of recent activities
 */
export function getRecentActivities(
  userId: string,
  daysAgo: number = 7
): Activity[] {
  const now = new Date();
  const past = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

  return getActivitiesByUser(userId, {
    startDateFrom: past,
    startDateTo: now
  });
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
  daysAgo: number = 30
) {
  const now = new Date();
  const past = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

  const acts = getActivitiesByUser(userId, {
    sportType,
    startDateFrom: past,
    startDateTo: now
  });

  // Calculate statistics
  const totalActivities = acts.length;
  const totalDuration = acts.reduce((sum, act) => sum + act.actualMetrics.durationSeconds, 0);
  const totalDistance = acts.reduce((sum, act) => sum + (act.actualMetrics.distanceMeters || 0), 0);
  const totalCalories = acts.reduce((sum, act) => sum + (act.actualMetrics.calories || 0), 0);

  // Average metrics
  const avgDuration = totalActivities > 0 ? totalDuration / totalActivities : 0;
  const avgDistance = totalActivities > 0 ? totalDistance / totalActivities : 0;
  const avgCalories = totalActivities > 0 ? totalCalories / totalActivities : 0;

  // Activities by sport type
  const bySportType = acts.reduce((acc, act) => {
    acc[act.sportType] = (acc[act.sportType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalActivities,
    totalDurationSeconds: totalDuration,
    totalDistanceMeters: totalDistance,
    totalCalories: totalCalories,
    averageDurationSeconds: avgDuration,
    averageDistanceMeters: avgDistance,
    averageCalories: avgCalories,
    activitiesBySportType: bySportType,
    periodDays: daysAgo
  };
}