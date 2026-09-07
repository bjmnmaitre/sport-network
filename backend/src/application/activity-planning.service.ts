/**
 * Sport Network - Activity Planning Service
 *
 * Service for managing activity plans (intentions to perform activities).
 * Handles creation, retrieval, updating, and deletion of activity plans.
 */

import { ActivityPlan, ActivityPlanValidation } from '../domain/activity-plan';
import { SportType } from '../domain/sport';
import { v4 as uuidv4 } from 'uuid';

/**
 * In-memory storage for activity plans (in real implementation, this would be a database)
 * Using Map for simplicity in this example
 */
let activityPlans: Map<string, ActivityPlan> = new Map();

/**
 * Create a new activity plan
 * @param planData The data for the new activity plan (without id and timestamps)
 * @returns The created activity plan
 */
export function createActivityPlan(planData: Omit<ActivityPlan, 'id' | 'createdAt' | 'updatedAt'>): ActivityPlan {
  const now = new Date();
  const activityPlan: ActivityPlan = {
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
    ...planData
  };

  // Validate the plan
  const timeError = ActivityPlanValidation.validateTimes(activityPlan);
  if (timeError) {
    throw new Error(`Invalid plan times: ${timeError}`);
  }

  const metricsError = ActivityPlanValidation.validateMetrics(activityPlan);
  if (metricsError) {
    throw new Error(`Invalid plan metrics: ${metricsError}`);
  }

  // Store the plan
  activityPlans.set(activityPlan.id, activityPlan);

  return activityPlan;
}

/**
 * Retrieve an activity plan by ID
 * @param id The ID of the activity plan to retrieve
 * @returns The activity plan if found, null otherwise
 */
export function getActivityPlanById(id: string): ActivityPlan | null {
  return activityPlans.get(id) || null;
}

/**
 * Retrieve activity plans for a user with optional filtering
 * @param userId The user ID to filter by
 * @param filters Optional filters (sportType, dateRange, status, etc.)
 * @returns Array of matching activity plans
 */
export function getActivityPlansByUser(
  userId: string,
  filters: {
    sportType?: SportType;
    startDateFrom?: Date;
    startDateTo?: Date;
    status?: ActivityPlan['status'];
    limit?: number;
    offset?: number;
  } = {}
): ActivityPlan[] {
  let plans = Array.from(activityPlans.values())
    .filter(plan => plan.userId === userId);

  // Apply filters
  if (filters.sportType) {
    plans = plans.filter(plan => plan.sportType === filters.sportType);
  }

  if (filters.startDateFrom) {
    const startDateFrom = filters.startDateFrom;
    plans = plans.filter(plan => plan.plannedStartTime >= startDateFrom);
  }

  if (filters.startDateTo) {
    const startDateTo = filters.startDateTo;
    plans = plans.filter(plan => plan.plannedStartTime <= startDateTo);
  }

  if (filters.status) {
    plans = plans.filter(plan => plan.status === filters.status);
  }

  // Sort by planned start time (newest first)
  plans.sort((a, b) => b.plannedStartTime.getTime() - a.plannedStartTime.getTime());

  // Apply pagination
  const start = filters.offset ?? 0;
  const end = filters.limit ? start + filters.limit : plans.length;
  return plans.slice(start, end);
}

/**
 * Update an existing activity plan
 * @param id The ID of the activity plan to update
 * @param updates The fields to update (partial update)
 * @returns The updated activity plan if found, null otherwise
 */
export function updateActivityPlan(
  id: string,
  updates: Partial<Omit<ActivityPlan, 'id' | 'createdAt'>>
): ActivityPlan | null {
  const existingPlan = activityPlans.get(id);
  if (!existingPlan) {
    return null;
  }

  // Merge updates while preserving id and createdAt
  const updatedPlan: ActivityPlan = {
    ...existingPlan,
    ...updates,
    updatedAt: new Date()
  };

  // Validate the updated plan
  const timeError = ActivityPlanValidation.validateTimes(updatedPlan);
  if (timeError) {
    throw new Error(`Invalid plan times: ${timeError}`);
  }

  const metricsError = ActivityPlanValidation.validateMetrics(updatedPlan);
  if (metricsError) {
    throw new Error(`Invalid plan metrics: ${metricsError}`);
  }

  // Store the updated plan
  activityPlans.set(id, updatedPlan);

  return updatedPlan;
}

/**
 * Delete an activity plan
 * @param id The ID of the activity plan to delete
 * @returns True if the plan was deleted, false if not found
 */
export function deleteActivityPlan(id: string): boolean {
  return activityPlans.delete(id);
}

/**
 * Change the status of an activity plan
 * @param id The ID of the activity plan
 * @param status The new status
 * @returns The updated activity plan if found, null otherwise
 */
export function updateActivityPlanStatus(
  id: string,
  status: ActivityPlan['status']
): ActivityPlan | null {
  return updateActivityPlan(id, { status });
}

/**
 * Mark an activity plan as completed (optionally link to an actual activity)
 * @param id The ID of the activity plan
 * @param activityId Optional ID of the actual activity that fulfilled this plan
 * @returns The updated activity plan if found, null otherwise
 */
export function completeActivityPlan(
  id: string,
  activityId?: string
): ActivityPlan | null {
  const plan = activityPlans.get(id);
  if (!plan) {
    return null;
  }

  const updatedPlan = {
    ...plan,
    status: 'completed' as const,
    updatedAt: new Date(),
    // Optionally store the activity ID that fulfilled this plan
    // In a real implementation, we might have a separate linking mechanism
    // For now, we'll rely on the activity having a planId field
  };

  activityPlans.set(id, updatedPlan);
  return updatedPlan;
}

/**
 * Get upcoming activity plans for a user
 * @param userId The user ID
 * @param hoursAhead How many hours ahead to look (default 24)
 * @returns Array of upcoming activity plans
 */
export function getUpcomingActivityPlans(
  userId: string,
  hoursAhead: number = 24
): ActivityPlan[] {
  const now = new Date();
  const future = new Date(now.getTime() + (hoursAhead * 60 * 60 * 1000));

  return getActivityPlansByUser(userId, {
    startDateFrom: now,
    startDateTo: future,
    status: 'scheduled'
  });
}