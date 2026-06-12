import { Injectable, Scope, Global } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Global()
@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  constructor(private readonly logger: PinoLogger) {}

  /**
   * Set the context for this logger instance.
   * @param context
   */
  setContext(context: string): void {
    this.logger.setContext(context);
  }

  /**
   * Log an error message with optional metadata and error object.
   * @param message
   * @param error
   * @param metadata
   */
  error(
    message: string,
    error?: unknown,
    metadata?: Record<string, unknown>,
  ): void {
    const logData = {
      ...metadata,
      ...(error != null && {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          name: error instanceof Error ? error.name : 'Error',
          stack:
            process.env.NODE_ENV !== 'production' && error instanceof Error ? error.stack : undefined,
        },
      }),
    };

    this.logger.error(logData, message);
  }

  /**
   * Log a warning message with optional metadata.
   * @param message
   * @param metadata
   */
  warn(message: string, metadata?: Record<string, unknown>): void {
    this.logger.warn(metadata ?? {}, message);
  }

  /**
   * Log an info message with optional metadata.
   * @param message
   * @param metadata
   */
  info(message: string, metadata?: Record<string, unknown>): void {
    this.logger.info(metadata ?? {}, message);
  }

  /**
   * Log a debug message with optional metadata.
   * @param message
   * @param metadata
   */
  debug(message: string, metadata?: Record<string, unknown>): void {
    this.logger.debug(metadata ?? {}, message);
  }

  /**
   * Log a verbose message with optional metadata.
   * @param message
   * @param metadata
   */
  verbose(message: string, metadata?: Record<string, unknown>): void {
    this.logger.trace(metadata ?? {}, message);
  }

  /**
   * Create a child logger with additional context.
   * @param bindings
   */
  child(bindings: Record<string, unknown>): LoggerService {
    const childLogger = this.logger.logger.child(bindings);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    const childPinoLogger = new PinoLogger(childLogger as any);
    return new LoggerService(childPinoLogger);
  }

  /**
   * Sanitize sensitive data from objects before logging.
   * @param data
   */
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const sanitized = Array.isArray(data) ? [...data] : { ...(data as Record<string, unknown>) };

    const sanitizeRecursive = (object: unknown): unknown => {
      if (object == null || typeof object !== 'object') {
        return object;
      }

      if (Array.isArray(object)) {
        return object.map(sanitizeRecursive);
      }

      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(object as Record<string, unknown>)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveFields.some((field) => lowerKey.includes(field))) {
          // eslint-disable-next-line security/detect-object-injection
          result[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
          // eslint-disable-next-line security/detect-object-injection
          result[key] = sanitizeRecursive(value);
        } else {
          // eslint-disable-next-line security/detect-object-injection
          result[key] = value;
        }
      }
      return result;
    };

    return sanitizeRecursive(sanitized);
  }

  /**
   * Log HTTP request with sanitized data.
   * @param req
   * @param metadata
   */
  logRequest(req: { body?: unknown; headers?: Record<string, unknown>; query?: unknown; correlationId?: string; ip?: string; connection?: { remoteAddress?: string }; method?: string; url?: string; }, metadata?: Record<string, unknown>): void {
    const sanitizedBody = this.sanitizeData(req.body);
    const sanitizedHeaders = this.sanitizeData(req.headers);
    const sanitizedQuery = this.sanitizeData(req.query);

    this.info('HTTP Request', {
      body: sanitizedBody,
      correlationId: req.correlationId,
      headers: sanitizedHeaders,
      ip: req.ip ?? req.connection?.remoteAddress,
      method: req.method,
      query: sanitizedQuery,
      url: req.url,
      userAgent: req.headers && typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined,
      ...metadata,
    });
  }

  /**
   * Log HTTP response with timing information.
   * @param req
   * @param res
   * @param responseTime
   * @param metadata
   */
  logResponse(
    req: { correlationId?: string; method?: string; url?: string; },
    res: { statusCode?: number; },
    responseTime: number,
    metadata?: Record<string, unknown>,
  ): void {
    this.info('HTTP Response', {
      correlationId: req.correlationId,
      method: req.method,
      responseTime: `${String(responseTime)}ms`,
      statusCode: res.statusCode,
      url: req.url,
      ...metadata,
    });
  }
}
