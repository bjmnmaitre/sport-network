import { Request, Response, NextFunction, Router } from 'express';
import { ActivityService } from '../../application/ActivityService';
import { SportType } from '../../domain/sport';

/**
 * Extending the Express Request type to include userId (set by auth middleware).
 */
declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

/**
 * Creates an Express router for activity-related endpoints.
 * @param activityService The activity service instance
 * @returns Configured Express router
 */
export function createActivitiesRouter(activityService: ActivityService): Router {
  const router = Router();

  // Middleware to ensure user is authenticated (sets req.userId)
  // In a real app, this would be a separate middleware (e.g., JWT verification)
  const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers['x-user-id'] as string | undefined; // Simple header for demo
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.userId = userId;
    next();
  };

  // Apply authentication to all routes
  router.use(authenticate);

  // POST /activities
  // Create a new activity
  router.post('/', async (req: Request, res: Response) => {
    try {
      const userId = req.userId as string;
      const { sportType, startTime, metrics } = req.body;

      // Validate required fields
      if (!sportType || !startTime || !metrics) {
        return res.status(400).json({ error: 'Missing required fields: sportType, startTime, metrics' });
      }

      // Validate sportType is a valid enum value
      if (!Object.values(SportType).includes(sportType as SportType)) {
        return res.status(400).json({ error: 'Invalid sport type' });
      }

      const activity = await activityService.createActivity(
        userId,
        sportType as SportType,
        startTime,
        metrics
      );

      return res.status(201).json(activity);
    } catch (error: any) {
      return res.status(400).json({ error: error.message ?? 'Unknown error' });
    }
  });

  // GET /activities/:id
  // Get an activity by ID
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const userId = req.userId as string;
      const { id } = req.params;

      const activity = await activityService.getActivityById(id);
      if (!activity) {
        return res.status(404).json({ error: 'Activity not found' });
      }
      // Authorization check: ensure the activity belongs to the user
      if (activity.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      return res.json(activity);
    } catch (error: any) {
      return res.status(500).json({ error: error.message ?? 'Internal server error' });
    }
  });

  // PATCH /activities/:id
  // Update an activity (only completedAt and notes allowed)
  router.patch('/:id', async (req: Request, res: Response) => {
    try {
      const userId = req.userId as string;
      const { id } = req.params;
      const { completedAt, notes } = req.body;

      const activity = await activityService.getActivityById(id);
      if (!activity) {
        return res.status(404).json({ error: 'Activity not found' });
      }
      // Authorization check
      if (activity.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Only allow specific fields
      if (completedAt !== undefined) {
        activity.actualEndTime = new Date(completedAt);
      }
      if (notes !== undefined) {
        activity.notes = notes;
      }

      // Validate the updated activity
      const timeError = ActivityValidation.validateTimes(activity);
      if (timeError) {
        return res.status(400).json({ error: timeError });
      }
      const metricsError = ActivityValidation.validateMetrics(activity);
      if (metricsError) {
        return res.status(400).json({ error: metricsError });
      }

      const updatedActivity = await activityService.updateActivity(id, activity);
      return res.json(updatedActivity);
    } catch (error: any) {
      return res.status(400).json({ error: error.message ?? 'Bad request' });
    }
  });

  // GET /user/:userId/activities
  // Get weekly progression for a user
  router.get('/user/:userId/activities', async (req: Request, res: Response) => {
    try {
      const authUserId = req.userId as string;
      const { userId } = req.params;
      const { sportType, period } = req.query;

      // Ensure the authenticated user matches the requested userId
      if (authUserId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Parse sportType if provided
      const parsedSportType = sportType ? (sportType as SportType) : undefined;

      // We only support WEEK period for now
      if (period && period !== 'WEEK') {
        return res.status(400).json({ error: 'Unsupported period. Only WEEK is supported.' });
      }

      const progression = await activityService.getProgressionWeekly(
        userId,
        parsedSportType ?? SportType.RUNNING // Default to RUNNING if not provided
      );

      return res.json(progression);
    } catch (error: any) {
      return res.status(500).json({ error: error.message ?? 'Internal server error' });
    }
  });

  return router;
}