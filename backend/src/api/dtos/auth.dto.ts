import { IsEmail, IsString, MinLength, MaxLength, IsArray, IsOptional } from 'class-validator';

// ===== REGISTER DTO =====
export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  displayName!: string;

  @IsArray()
  @IsString({ each: true })
  primarySports!: string[];
}

// ===== LOGIN DTO =====
export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

// ===== AUTH RESPONSE DTO =====
export class AuthResponseDto {
  accessToken!: string;
  userId!: string;
  email!: string;

  static fromServiceResponse(response: any): AuthResponseDto {
    const dto = new AuthResponseDto();
    dto.accessToken = response.accessToken;
    dto.userId = response.userId;
    dto.email = response.email;
    return dto;
  }
}

// ===== DELETION REQUEST DTO =====
export class DeleteAccountDto {
  @IsOptional()
  @IsString()
  reason?: string;
}