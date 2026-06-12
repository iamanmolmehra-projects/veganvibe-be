import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { HttpLogContext } from './consolidated-http-logging.interceptor';
import { RequestWithCorrelation } from './correlation-id.middleware';

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  constructor(
    @Inject(REQUEST) private readonly request: RequestWithCorrelation,
  ) {}

  /**
   * Add custom data to the HTTP log context for this request.
   * @param data
   */
  addLogData(data: Record<string, unknown>): void {
    if (this.request.logContext) {
      this.request.logContext.customFields = {
        ...this.request.logContext.customFields,
        ...data,
      };
    }
  }

  /**
   * Set the user ID for this request (commonly used for audit logging).
   * @param userId
   */
  setUserId(userId: string): void {
    if (this.request.logContext) {
      this.request.logContext.userId = userId;
    }
  }

  /**
   * Set the tenant/organization ID for this request.
   * @param tenantId
   */
  setTenantId(tenantId: string): void {
    if (this.request.logContext) {
      this.request.logContext.tenantId = tenantId;
    }
  }

  /**
   * Get the correlation ID for this request.
   */
  getCorrelationId(): string {
    return this.request.correlationId;
  }

  /**
   * Get the current log context (readonly).
   */
  getLogContext(): Readonly<HttpLogContext> | null {
    return this.request.logContext ?? null;
  }

  /**
   * Add timing data for specific operations within the request.
   * @param operation
   * @param duration
   */
  addTiming(operation: string, duration: number): void {
    this.addLogData({
      [`${operation}Duration`]: `${String(duration)}ms`,
    });
  }

  /**
   * Add business metrics to the log context.
   * @param metrics
   */
  addBusinessMetrics(metrics: Record<string, number | string>): void {
    this.addLogData({ businessMetrics: metrics });
  }
}
