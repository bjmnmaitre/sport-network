import { Test, TestingModule } from '@nestjs/testing';
import { ActivityPlansController } from '../../api/controllers/activity-plans.controller';
import { ActivityPlanService } from '../../application/ActivityPlanService';

describe('ActivityPlansController', () => {
  let controller: ActivityPlansController;
  let service: ActivityPlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityPlansController],
      providers: [
        {
          provide: ActivityPlanService,
          useValue: {
            createPlan: jest.fn(),
            getPlan: jest.fn(),
            getUpcomingPlans: jest.fn(),
            updatePlan: jest.fn(),
            startActivityFromPlan: jest.fn(),
            convertPlanToActivity: jest.fn(),
            cancelPlan: jest.fn(),
            markMissed: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ActivityPlansController>(ActivityPlansController);
    service = module.get<ActivityPlanService>(ActivityPlanService);
  });

  describe('POST /activity-plans', () => {
    it('should create plan', async () => {
      const futureDate = new Date(Date.now() + 86400000); // Tomorrow
      const mockPlan = {
        id: 'plan-1',
        userId: 'user-1',
        sportType: 'running',
        plannedStartTime: futureDate,
        status: 'scheduled',
      };

      (service.createPlan as jest.Mock).mockResolvedValue(mockPlan);

      const dto = {
        sportType: 'running',
        plannedStartTime: futureDate.toISOString(),
      };

      const req = { userId: 'user-1' } as any;
      const result = await controller.createPlan(dto, req);

      expect(result.data.id).toBe('plan-1');
    });
  });

  describe('POST /:id/start', () => {
    it('should start activity from plan', async () => {
      const mockPlan = {
        id: 'plan-1',
        sportType: 'RUNNING',
        status: 'completed',
        activityId: 'activity-1',
      };

      (service.startActivityFromPlan as jest.Mock).mockResolvedValue(mockPlan);

      const dto = {
        metrics: { distance: 5.1, duration: 1800 },
      };

      const req = { userId: 'user-1' } as any;
      const result = await controller.startActivityFromPlan('plan-1', dto, req);

      expect(result.data.status).toBe('completed');
      expect(result.data.activityId).toBe('activity-1');
    });
  });
});