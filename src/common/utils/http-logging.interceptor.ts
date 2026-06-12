import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { RequestWithCorrelation } from './correlation-id.middleware';
import { LoggerService } from './logger.service';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('HttpLoggingInterceptor');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<RequestWithCorrelation>();
    const response = ctx.getResponse<{ statusCode?: number }>();
    const startTime = Date.now();

    // Skip logging for health check endpoints to reduce noise
    if (request.url === '/' || request.url.includes('/health')) {
      return next.handle();
    }

    // Log the incoming request
    this.logger.logRequest(request, {
      controller: context.getClass().name,
      handler: context.getHandler().name,
    });

    return next.handle().pipe(
      tap({
        error: (error: unknown) => {
          const responseTime = Date.now() - startTime;
          this.logger.error('HTTP Request Error', error, {
            correlationId: request.correlationId,
            method: request.method,
            responseTime: `${String(responseTime)}ms`,
            statusCode: response.statusCode,
            url: request.url,
          });
        },
        next: (data: unknown) => {
          const responseTime = Date.now() - startTime;
          this.logger.logResponse(request, response, responseTime, {
            dataSize: data != null ? JSON.stringify(data).length : 0,
          });
        },
      }),
    );
  }
}
