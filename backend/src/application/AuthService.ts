import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserRepository } from '../infrastructure/repository/UserRepository';
import { ProfileRepository } from '../infrastructure/repository/ProfileRepository';
import { UserEntity } from '../infrastructure/database/entities/UserEntity';
import { ProfileEntity } from '../infrastructure/database/entities/ProfileEntity';

export interface AuthPayload {
  userId: string;
  email: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  userId: string;
  email: string;
}

@Injectable()
export class AuthService {
  private jwtSecret = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
  private jwtExpiration = process.env.JWT_EXPIRATION || '24h';

  constructor(
    private userRepository: UserRepository,
    private profileRepository: ProfileRepository,
  ) {}

  /**
   * Register new user
   */
  async register(
    email: string,
    password: string,
    displayName: string,
    primarySports: string[],
  ): Promise<AuthTokenResponse> {
    // Validate email format
    if (!this.isValidEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Validate password strength
    if (!this.isStrongPassword(password)) {
      throw new BadRequestException(
        'Password must be at least 8 characters, with uppercase, lowercase, and numbers',
      );
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user
    const user = new UserEntity();
    user.email = email;
    user.passwordHash = passwordHash;
    user.status = 'active';
    user.emailVerified = false; // TODO: Email verification in PHASE 4

    const savedUser = await this.userRepository.save(user);

    // Create profile
    const profile = new ProfileEntity();
    profile.userId = savedUser.id;
    profile.displayName = displayName;
    profile.primarySports = primarySports;
    profile.visibility = 'public';

    const savedProfile = await this.profileRepository.save(profile);

    // Link profile to user
    savedUser.profileId = savedProfile.id;
    await this.userRepository.save(savedUser);

    // Generate token
    const token = this.generateToken(savedUser);

    return {
      accessToken: token,
      userId: savedUser.id,
      email: savedUser.email,
    };
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<AuthTokenResponse> {
    // Find user by email
    const user = await this.userRepository.findActiveByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      accessToken: token,
      userId: user.id,
      email: user.email,
    };
  }

  /**
   * Validate token and return payload
   */
  async validateToken(token: string): Promise<AuthPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as AuthPayload;
      return decoded;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Request user deletion (grace period before anonymization)
   */
  async requestDeletion(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.status = 'deletion_requested';
    user.deletionRequestedAt = new Date();

    await this.userRepository.save(user);

    return {
      message: 'Deletion requested. Your account will be anonymized in 7 days.',
    };
  }

  /**
   * Cancel deletion request
   */
  async cancelDeletion(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'deletion_requested') {
      throw new BadRequestException('No deletion request pending');
    }

    user.status = 'active';
    user.deletionRequestedAt = null;

    await this.userRepository.save(user);

    return {
      message: 'Deletion request cancelled',
    };
  }

  /**
   * Anonymize user (called after grace period)
   */
  async anonymizeUser(userId: string): Promise<void> {
    await this.userRepository.anonymize(userId);
  }

  // ===== HELPERS =====

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private generateToken(user: UserEntity): string {
    const payload: AuthPayload = {
      userId: user.id,
      email: user.email,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiration,
    } as jwt.SignOptions);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isStrongPassword(password: string): boolean {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password)
    );
  }
}