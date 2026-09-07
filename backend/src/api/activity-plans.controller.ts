/**
 * Sport Network - Activity Plans Controller
 *
 * REST-style controller for activity plan endpoints.
 * In a real implementation, this would be connected to an HTTP framework like Express.
 */

import { ActivityPlan } from '../domain/activity-plan';
import { SportType } from '../domain/sport';
import * as activityPlanningService from '../application/activity-planning.service';

/**
 * Get all activity plans for a user with optional filtering
 * @param userId The user ID (would come from auth in real implementation)
 * @param queryParams Query parameters for filtering
 * @returns Array of activity plans
 */
export function getActivityPlans(
  userId: string,
  queryParams: {
    sportType?: SportType;
    startDateFrom?: string; // ISO date string
    startDateTo?: string;   // ISO date string
    status?: ActivityPlan['status'];
    limit?: number;
    offset?: number;
  }
): ActivityPlan[] {
  const filters: any = {};
  if (queryParams.sportType) filters.sportType = queryParams.sportType;
  if (queryParams.startDateFrom) filters.startDateFrom = new Date(queryParams.startDateFrom);
  if (queryParams.startDateTo) filters.startDateTo = new Date(queryParams.startDateTo);
  if (queryParams.status) filters.status = queryParams.status;
  if (queryParams.limit) filters.limit = queryParams.limit;
  if (queryParams.offset) filters.offset = queryParams.offset;

  return activityPlanningService.getActivityPlansByUser(userId, filters);
}

/**
 * Get a specific activity plan by ID
 * @param id The activity plan ID
 * @param userId The user ID (for authorization check)
 * @returns The activity plan if found and belongs to user
 */
export function getActivityPlanById(
  id: string,
  userId: string
): ActivityPlan | null {
  const plan = activityPlanningService.getActivityPlanById(id);
  if (!plan) return null;
  // Authorization check: ensure the plan belongs to the user
  if (plan.userId !== userId) return null;
  return plan;
}

/**
 * Create a new activity plan
 * @param userId The user ID (would come from auth)
 * @param planData The activity plan data (without id and timestamps)
 * @returns The created activity plan
 */
export function createActivityPlan(
  userId: string,
  planData: Omit<ActivityPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): ActivityPlan {
  // Ensure the plan belongs to the authenticated user
  const planWithUserId = { ...planData, userId };
  return activityPlanningService.createActivityPlan(planWithUserId);
}

/**
 * Update an existing activity plan
 * @param id The activity plan ID
 * @param userId The user ID (for authorization check)
 * @param updates The fields to update
 * @returns The updated activity plan if found and belongs to user
 */
export function updateActivityPlan(
  id: string,
  userId: string,
  updates: Partial<Omit<ActivityPlan, 'id' | 'userId' | 'createdAt'>>
): ActivityPlan | null {
  // First check if the plan exists and belongs to the user
  const existing = activityPlanningService.getActivityPlanById(id);
  if (!existing || existing.userId !== userId) return null;

  // Perform the update
  return activityPlanningService.updateActivityPlan(id, updates);
}

/**
 * Delete an activity plan
 * @param id The activity plan ID
 * @param userId The user ID (for authorization check)
 * @returns True if deleted, false if not found or not authorized
 */
export function deleteActivityPlan(
  id: string,
  userId: string
): boolean {
  // First check if the plan exists and belongs to the user
  const existing = activityPlanningService.getActivityPlanById(id);
  if (!existing || existing.userId !== userId) return false;

  // Perform the deletion
  return activityPlanningService.deleteActivityPlan(id);
}

/**
 * Update the status of an activity plan
 * @param id The activity plan ID
 * @param userId The user ID (for authorization check)
 * @param status The new status
 * @returns The updated activity plan if found and belongs to user
 */
export function updateActivityPlanStatus(
  id: string,
  userId: string,
  status: ActivityPlan['status']
): ActivityPlan | null {
  // First check if the plan exists and belongs to the user
  const existing = activityPlanningService.getActivityPlanById(id);
  if (!existing || existing.userId !== userId) return null;

  // Update the status
  return activityPlanningService.updateActivityPlanStatus(id, status);
}

/**
 * Get upcoming activity plans for a user
 * @param userId The user ID
 * @param hoursAhead How many hours ahead to look (default 24)
 * @returns Array of upcoming activity plans
 */
export function getUpcomingActivityPlans(
  userId: string,
  hoursAhead?: number
): ActivityPlan[] {
  const hours = hoursAhead ?? 24;
  return activityPlanningService.getUpcomingActivityPlans(userId, hours);
}