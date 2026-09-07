import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesController } from '../../api/controllers/activities.controller';
import { ActivityService } from '../../application/ActivityService';
import { ProgressionService } from '../../application/ProgressionService';

describe('ActivitiesController', () => {
  let controller: ActivitiesController;
  let service: ActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivitiesController],
      providers: [
        {
          provide: ActivityService,
          useValue: {
            createActivity: jest.fn(),
            getActivity: jest.fn(),
            getUserActivities: jest.fn(),
            updateVisibility: jest.fn(),
            updateNotes: jest.fn(),
            getProgression: jest.fn(),
            getPersonalBest: jest.fn(),
            discoverActivities: jest.fn(),
            deleteActivity: jest.fn(),
          },
        },
        {
          provide: ProgressionService,
          useValue: {
            calculateProgression: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ActivitiesController>(ActivitiesController);
    service = module.get<ActivityService>(ActivityService);
  });

  describe('POST /activities', () => {
    it('should create activity and return 201', async () => {
      const mockActivity = {
        id: 'activity-1',
        userId: 'user-1',
        sportType: 'running',
        metrics: { distance: 5.1 },
        visibility: 'private',
      };

      (service.createActivity as jest.Mock).mockResolvedValue(mockActivity);

      const dto = {
        sportType: 'running',
        metrics: { distance: 5.1, duration: 1800 },
        completedAt: new Date().toISOString(),
      };

      const req = { userId: 'user-1' } as any;
      const result = await controller.createActivity(dto, req);

      expect(result.data.id).toBe('activity-1');
      expect(service.createActivity).toHaveBeenCalled();
    });
  });

  describe('GET /activities', () => {
    it('should return user activities', async () => {
      const mockActivities = [
        { id: 'activity-1', userId: 'user-1', sportType: 'RUNNING' },
        { id: 'activity-2', userId: 'user-1', sportType: 'RUNNING' },
      ];

      (service.getUserActivities as jest.Mock).mockResolvedValue(mockActivities);

      const req = { userId: 'user-1' } as any;
      const result = await controller.getUserActivities(req);

      expect(result.data).toHaveLength(2);
    });
  });

  describe('GET /discover', () => {
    it('should return public activities', async () => {
      const mockActivities = [
        { id: 'activity-1', visibility: 'public', sportType: 'RUNNING' },
      ];

      (service.discoverActivities as jest.Mock).mockResolvedValue(mockActivities);

      const result = await controller.discoverActivities('running');

      expect(result.data).toHaveLength(1);
    });
  });
});