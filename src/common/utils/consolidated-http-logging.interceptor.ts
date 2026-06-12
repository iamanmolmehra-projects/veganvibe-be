import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { RequestWithCorrelation } from './correlation-id.middleware';
import { LoggerService } from './logger.service';

export interface HttpLogContext {
  bodySize: number;
  // Request details
  controller: string;
  correlationId: string;
  customFields?: Record<string, unknown>;
  handler: string;
  ip: string;

  // Request data
  method: string;
  path: string;

  queryParams: Record<string, unknown>;
  responseTime: number;
  // Response data
  statusCode: number;
  tenantId?: string;

  url: string;
  userAgent: string;
  // Additional context that can be added during request processing
  userId?: string;
}

@Injectable()
export class ConsolidatedHttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('HttpLogger');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<RequestWithCorrelation>();
    const response = ctx.getResponse<Response>();
    const startTime = Date.now();

    // Skip logging for health check endpoints
    if (this.shouldSkipLogging(request.url)) {
      return next.handle();
    }

    // Initialize log context on request object for middleware/services to add data
    request.logContext = this.initializeLogContext(request, context);

    return next.handle().pipe(
      tap({
        error: (error: unknown) => {
          // Error response
          const errorObject = error as Record<string, unknown>;
          this.finalizeAndLogRequest(request, response, startTime, {
            error: {
              message: (typeof errorObject.message === 'string' ? errorObject.message : undefined) ?? 'Unknown error',
              name: (typeof errorObject.name === 'string' ? errorObject.name : undefined) ?? 'Error',
              statusCode: (typeof errorObject.status === 'number' ? errorObject.status : undefined) ?? 500,
            },
            success: false,
          });
        },
        next: (responseData) => {
          // Success response
          this.finalizeAndLogRequest(request, response, startTime, {
            responseDataSize: responseData !== undefined ? this.getDataSize(responseData) : 0,
            success: true,
          });
        },
      }),
    );
  }

  private shouldSkipLogging(url: string): boolean {
    const skipPatterns = [
      '/',
      '/health',
      '/readiness',
      '/liveness',
      '/metrics',
    ];
    return skipPatterns.some(
      (pattern) => url === pattern || url.includes(pattern),
    );
  }

  private initializeLogContext(
    request: RequestWithCorrelation,
    context: ExecutionContext,
  ): HttpLogContext {
    return {
      bodySize: request.body !== undefined ? this.getDataSize(request.body) : 0,
      controller: context.getClass().name,
      correlationId: request.correlationId,
      handler: context.getHandler().name,
      ip: request.ip ?? (request.socket ? request.socket.remoteAddress : undefined) ?? 'Unknown',
      method: request.method,
      path: (request as { route?: { path?: string } }).route?.path ?? request.url,
      queryParams: this.sanitizeData(request.query ?? {}) as Record<string, unknown>,
      responseTime: 0, // Will be calculated later
      statusCode: 0, // Will be set later
      url: request.url,
      userAgent: request.headers['user-agent'] ?? 'Unknown',
    };
  }

  private finalizeAndLogRequest(
    request: RequestWithCorrelation,
    response: Response,
    startTime: number,
    finalData: { success: boolean; responseDataSize?: number; error?: unknown },
  ): void {
    const logContext = request.logContext;

    if (!logContext) {
      // Fallback if logContext is missing
      this.logger.warn('Missing log context for request', {
        correlationId: request.correlationId,
        method: request.method,
        url: request.url,
      });
      return;
    }

    // Finalize timing and status
    logContext.responseTime = Date.now() - startTime;
    const errorStatusCode = finalData.error != null && 
      typeof finalData.error === 'object' && 
      'statusCode' in finalData.error &&
      typeof (finalData.error as { statusCode: unknown }).statusCode === 'number'
        ? (finalData.error as { statusCode: number }).statusCode
        : undefined;
    
    logContext.statusCode = response.statusCode || errorStatusCode || 500;

    // Prepare final log entry
    const logEntry = {
      // Core HTTP data
      ...logContext,

      // Request metadata
      requestBody: this.sanitizeData(request.body ?? {}) as Record<string, unknown>,

      // Response metadata
      success: finalData.success,
      ...(finalData.responseDataSize !== undefined && {
        responseDataSize: finalData.responseDataSize,
      }),
      ...(finalData.error != null ? { error: finalData.error } : {}),
    };

    // Log based on status
    if (finalData.success) {
      this.logger.info('HTTP Request Completed', logEntry);
    } else {
      this.logger.error('HTTP Request Failed', finalData.error, logEntry);
    }
  }

  private sanitizeData(data: unknown): unknown {
    if (data == null || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = [
      'password',
      'token',
      'authorization',
      'cookie',
      'secret',
      'key',
      'apikey',
      'api_key',
      'access_token',
      'refresh_token',
      'jwt',
      'bearer',
    ];

    const sanitized = Array.isArray(data) ? [...data] : { ...(data as Record<string, unknown>) };

    const sanitizeRecursive = (object: unknown): unknown => {
      if (object == null || typeof object !== 'object') return object;
      if (Array.isArray(object)) return object.map(sanitizeRecursive);

      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(object as Record<string, unknown>)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveFields.some((field) => lowerKey.includes(field))) {
          result[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
          result[key] = sanitizeRecursive(value);
        } else {
          result[key] = value;
        }
      }
      return result;
    };

    return sanitizeRecursive(sanitized);
  }

  private getDataSize(data: unknown): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }
}

// Extend Request interface to include log context
declare global {
  namespace Express {
    interface Request {
      logContext?: HttpLogContext;
    }
  }
}
