import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ErrorMiddleware implements NestMiddleware {
  private logger = new Logger('ErrorMiddleware');

  use(req: Request, res: Response, next: NextFunction) {
    const originalJson = res.json;
    const logger = this.logger;

    res.json = function (data) {
      // Log response
      logger.log(`${req.method} ${req.path} - ${res.statusCode}`);
      return originalJson.call(this, data);
    };

    next();
  }
}

/**
 * Global error handler
 */
export class GlobalExceptionFilter {
  catch(exception: any, host: any) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = 500;
    let message = 'Internal Server Error';
    let details = null;

    // Handle specific errors
    if (exception.statusCode) {
      status = exception.statusCode;
      message = exception.message;
    } else if (exception.message?.includes('not found')) {
      status = 404;
      message = exception.message;
    } else if (exception.message?.includes('unauthorized')) {
      status = 401;
      message = 'Unauthorized';
    } else if (exception.message?.includes('forbidden')) {
      status = 403;
      message = 'Forbidden';
    } else if (exception.message?.includes('validation')) {
      status = 400;
      message = exception.message;
      details = exception.errors;
    }

    response.status(status).json({
      statusCode: status,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}