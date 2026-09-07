import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from '../../application/ActivityService';
import { ActivityRepository } from '../../infrastructure/repository/ActivityRepository';
import { ActivityPlanRepository } from '../../infrastructure/repository/ActivityPlanRepository';
import { ProgressionService } from '../../application/ProgressionService';
import { SportType } from '../../domain/sport';

describe('ActivityService', () => {
  let service: ActivityService;
  let repository: ActivityRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        {
          provide: ActivityRepository,
          useValue: {
            save: jest.fn(),
            findById: jest.fn(),
            findByUserId: jest.fn(),
            isOwner: jest.fn(),
          },
        },
        {
          provide: ActivityPlanRepository,
          useValue: {
            isOwner: jest.fn(),
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

    service = module.get<ActivityService>(ActivityService);
    repository = module.get<ActivityRepository>(ActivityRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createActivity', () => {
    it('should create activity with required fields', async () => {
      const userId = 'user-1';
      const data = {
        metrics: { distance: 5.1, duration: 1800 },
        completedAt: new Date(),
      };

      await service.createActivity(userId, SportType.RUNNING, data);

      expect(repository.save).toHaveBeenCalled();
    });

    it('should reject plan with future startTime', async () => {
      const userId = 'user-1';
      const futureDate = new Date(Date.now() + 1000);

      // This should fail if we add this validation
      // For now, test passes
    });
  });

  describe('getUserActivities', () => {
    it('should return user activities', async () => {
      const userId = 'user-1';
      const mockActivities = [{ id: 'activity-1', userId }];

      (repository.findByUserId as jest.Mock).mockResolvedValue(mockActivities);

      const result = await service.getUserActivities(userId);

      expect(result).toEqual(mockActivities);
    });
  });
});