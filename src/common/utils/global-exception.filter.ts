import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { LoggerService } from './logger.service';
import { RequestContextService } from './request-context.service';

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: LoggerService,
    private readonly requestContext: RequestContextService,
  ) {
    this.logger.setContext('GlobalExceptionFilter');
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    let httpStatus: number;
    let message: string;
    let errors: any = undefined;

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObject = exceptionResponse as any;
        message =
          responseObject.message ?? responseObject.error ?? 'An error occurred';
        errors = responseObject.errors;
      } else {
        message = 'An error occurred';
      }
    } else {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
    }

    const errorResponse = {
      message,
      path: httpAdapter.getRequestUrl(request),
      status: 'error',
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      ...(errors != null && { errors }),
    };

    // Add error data to HTTP log context
    this.requestContext.addLogData({
      error: true,
      errorMessage: message,
      errorType:
        exception instanceof HttpException
          ? exception.constructor.name
          : 'UnknownError',
      statusCode: httpStatus,
    });

    // Log the exception with appropriate level
    if (httpStatus >= 500) {
      this.logger.error('Internal server error occurred', {
        error: exception instanceof Error ? exception.stack : exception,
        ip: request.ip ?? request.connection.remoteAddress,
        method: request.method,
        path: httpAdapter.getRequestUrl(request),
        statusCode: httpStatus,
        userAgent: request.headers['user-agent'],
      });
    } else if (httpStatus >= 400) {
      this.logger.warn('Client error occurred', {
        message,
        method: request.method,
        path: httpAdapter.getRequestUrl(request),
        statusCode: httpStatus,
        ...(errors != null && { validationErrors: errors }),
      });
    }

    httpAdapter.reply(response, errorResponse, httpStatus);
  }
}
