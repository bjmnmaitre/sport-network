import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Auth middleware - validates JWT token in Authorization header
 * For MVP: simple token extraction, full JWT validation in PHASE 3
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer') {
      throw new UnauthorizedException('Invalid authorization scheme');
    }

    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    // TODO: Validate JWT token in PHASE 3
    // For now, attach token to request
    (req as any).token = token;
    (req as any).userId = this.extractUserIdFromToken(token); // placeholder

    next();
  }

  private extractUserIdFromToken(token: string): string {
    // TODO: Implement JWT verification
    // For MVP, extract from token payload (unsafe, for testing only)
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid token');

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      return payload.sub || payload.userId;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

/**
 * Decorator for extracting userId from request
 */
export function GetUserId(req: Request): string {
  const userId = (req as any).userId;
  if (!userId) {
    throw new UnauthorizedException('User ID not found in request');
  }
  return userId;
}