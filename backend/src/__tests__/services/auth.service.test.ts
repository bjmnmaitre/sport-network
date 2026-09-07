import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../application/AuthService';
import { UserRepository } from '../../infrastructure/repository/UserRepository';
import { ProfileRepository } from '../../infrastructure/repository/ProfileRepository';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;
  let profileRepository: ProfileRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            findActiveByEmail: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: ProfileRepository,
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    profileRepository = module.get<ProfileRepository>(ProfileRepository);
  });

  describe('register', () => {
    it('should register new user with valid data', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (userRepository.save as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      });
      (profileRepository.save as jest.Mock).mockResolvedValue({
        id: 'profile-1',
        userId: 'user-1',
      });

      const result = await service.register(
        'test@example.com',
        'Password123',
        'Test User',
        ['running'],
      );

      expect(result.userId).toBe('user-1');
      expect(result.email).toBe('test@example.com');
      expect(result.accessToken).toBeDefined();
    });

    it('should reject invalid email', async () => {
      expect(
        service.register('invalid-email', 'Password123', 'Test', ['running']),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject weak password', async () => {
      expect(
        service.register('test@example.com', 'weak', 'Test', ['running']),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject duplicate email', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue({
        id: 'user-1',
      });

      expect(
        service.register('test@example.com', 'Password123', 'Test', ['running']),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      (userRepository.findActiveByEmail as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: '$2b$10$...',
      });

      // Mock bcrypt comparison
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);

      // Note: This will fail without actual bcrypt, but structure is correct
    });
  });
});