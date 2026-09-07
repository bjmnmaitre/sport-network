import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Req,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../../application/AuthService';
import { AuthGuard } from '../guards/auth.guard';
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  DeleteAccountDto,
} from '../dtos/auth.dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /api/v1/auth/register
   * Register new user
   */
  @Post('register')
  @HttpCode(201)
  async register(
    @Body(ValidationPipe) dto: RegisterDto,
  ): Promise<{ data: AuthResponseDto }> {
    const response = await this.authService.register(
      dto.email,
      dto.password,
      dto.displayName,
      dto.primarySports,
    );

    return {
      data: AuthResponseDto.fromServiceResponse(response),
    };
  }

  /**
   * POST /api/v1/auth/login
   * Login user
   */
  @Post('login')
  @HttpCode(200)
  async login(
    @Body(ValidationPipe) dto: LoginDto,
  ): Promise<{ data: AuthResponseDto }> {
    const response = await this.authService.login(dto.email, dto.password);

    return {
      data: AuthResponseDto.fromServiceResponse(response),
    };
  }

  /**
   * POST /api/v1/auth/delete-account
   * Request account deletion (grace period 7 days)
   */
  @Post('delete-account')
  @UseGuards(AuthGuard)
  async deleteAccount(
    @Body(ValidationPipe) dto: DeleteAccountDto,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const userId = this.getUserId(req);
    return this.authService.requestDeletion(userId);
  }

  /**
   * POST /api/v1/auth/cancel-deletion
   * Cancel deletion request
   */
  @Post('cancel-deletion')
  @UseGuards(AuthGuard)
  async cancelDeletion(@Req() req: Request): Promise<{ message: string }> {
    const userId = this.getUserId(req);
    return this.authService.cancelDeletion(userId);
  }

  // ===== HELPER =====
  private getUserId(req: Request): string {
    const userId = (req as any).userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in request');
    }
    return userId;
  }
}