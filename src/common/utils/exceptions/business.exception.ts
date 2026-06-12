import { HttpStatus } from '@nestjs/common';

import { BaseException } from './base.exception';

export class BusinessRuleViolationException extends BaseException {
  constructor(message: string, rule: string, context?: Record<string, any>) {
    super(
      message,
      `BUSINESS_RULE_VIOLATION_${rule}`,
      HttpStatus.UNPROCESSABLE_ENTITY,
      context,
    );
  }
}

export class ResourceNotFoundException extends BaseException {
  constructor(
    resource: string,
    identifier?: string | number,
    context?: Record<string, any>,
  ) {
    const message = identifier != null
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;

    super(
      message,
      `RESOURCE_NOT_FOUND_${resource.toUpperCase()}`,
      HttpStatus.NOT_FOUND,
      {
        identifier,
        resource,
        ...context,
      },
    );
  }
}

export class DuplicateResourceException extends BaseException {
  constructor(
    resource: string,
    field: string,
    value: string,
    context?: Record<string, any>,
  ) {
    super(
      `${resource} with ${field} '${value}' already exists`,
      `DUPLICATE_RESOURCE_${resource.toUpperCase()}`,
      HttpStatus.CONFLICT,
      {
        field,
        resource,
        value,
        ...context,
      },
    );
  }
}

export class InvalidOperationException extends BaseException {
  constructor(
    operation: string,
    reason: string,
    context?: Record<string, any>,
  ) {
    super(
      `Cannot perform ${operation}: ${reason}`,
      `INVALID_OPERATION_${operation.toUpperCase()}`,
      HttpStatus.BAD_REQUEST,
      {
        operation,
        reason,
        ...context,
      },
    );
  }
}
