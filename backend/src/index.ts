/**
 * Sport Network - Backend Entry Point
 *
 * Main entry point for the Sport Network backend API.
 * Sets up Express server and registers API routes.
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import API controllers
import * as activityPlansController from './api/activity-plans.controller';
import * as activitiesController from './api/activities.controller';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Activity Plans Routes
// In a real app, these would be protected by authentication middleware
app.get('/api/users/:userId/activity-plans', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;
    const plans = activityPlansController.getActivityPlans(userId, req.query);
    res.status(200).json(plans);
  } catch (error) {
    next(error);
  }
});

app.post('/api/users/:userId/activity-plans', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;
    const plan = activityPlansController.createActivityPlan(userId, req.body);
    res.status(201).json(plan);
  } catch (error) {
    next(error);
  }
});

app.get('/api/users/:userId/activity-plans/:planId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;
    const planId = req.params.planId;
    const plan = activityPlansController.getActivityPlanById(planId, userId);
    if (!plan) {
      return res.status(404).json({ error: 'Activity plan not found' });
    }
    res.status(200).json(plan);
  } catch (error) {
    next(error);
  }
});

app.put('/api/users/:userId/activity-plans/:planId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;
    const planId = req.params.planId;
    const plan = activityPlansController.updateActivityPlan(planId, userId, req.body);
    if (!plan) {
      return res.status(404).json({ error: 'Activity plan not found' });
    }
    res.status(200).json(plan);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/users/:userId/activity-plans/:planId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;
    const planId = req.params.planId;
    const deleted = activityPlansController.deleteActivityPlan(planId, userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Activity plan not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.patch('/api/users/:userId/activity-plans/:planId/status', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;
    const planId = req.params.planId;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    const plan = activityPlansController.updateActivityPlanStatus(planId, userId, status);
    if (!plan) {
      return res.status(404).json({ error: 'Activity plan not found' });
    }
    res.status(200).json(plan);
  } catch (error) {
    next(error);
  }
});

app.get('/api/users/:userId/activity-plans/upcoming', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;
    const hoursAhead = req.query.hoursAhead ? parseInt(req.query.hoursAhead as string) : undefined;
    const plans = activityPlansController.getUpcomingActivityPlans(userId, hoursAhead);
    res.status(200).json(plans);
  } catch (error) {
    next(error);
  }
});

// Activities Routes
app.get('/api/users/:userId/activities', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;
    const activities = activitiesController.getActivities(userId, req.query);
    res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
});

app.post('/api/users/:userId/activities', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;
    const activity = activitiesController.recordActivity(userId, req.body);
    res.status(201).json(activity);
  } catch (error) {
    next(error);
  }
});

app.get('/api/users/:userId/activities/:activityId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;
    const activityId = req.params.activityId;
    const activity = activitiesController.getActivityById(activityId, userId);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.status(200).json(activity);
  } catch (error) {
    next(error);
  }
});

app.put('/api/users/:userId/activities/:activityId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;
    const activityId = req.params.activityId;
    const activity = activitiesController.updateActivity(activityId, userId, req.body);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.status(200).json(activity);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/users/:userId/activities/:activityId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;
    const activityId = req.params.activityId;
    const deleted = activitiesController.deleteActivity(activityId, userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get('/api/users/:userId/activities/recent', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;
    const daysAgo = req.query.daysAgo ? parseInt(req.query.daysAgo as string) : undefined;
    const activities = activitiesController.getRecentActivities(userId, daysAgo);
    res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
});

app.get('/api/users/:userId/activities/statistics', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;
    const sportType = req.query.sportType as any; // Would need proper enum parsing
    const daysAgo = req.query.daysAgo ? parseInt(req.query.daysAgo as string) : undefined;
    const stats = activitiesController.getActivityStatistics(userId, sportType, daysAgo);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Sport Network backend running on port ${PORT}`);
  });
}

export default app;