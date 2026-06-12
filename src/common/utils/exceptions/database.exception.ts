import { HttpStatus } from '@nestjs/common';

import { BaseException } from './base.exception';

export class DatabaseException extends BaseException {
  constructor(
    operation: string,
    originalError?: Error,
    context?: Record<string, any>,
  ) {
    super(
      `Database operation failed: ${operation}`,
      `DATABASE_ERROR_${operation.toUpperCase()}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        operation,
        originalError: originalError?.message,
        ...context,
      },
    );
  }
}

export class DatabaseConnectionException extends BaseException {
  constructor(
    connectionString?: string,
    originalError?: Error,
    context?: Record<string, any>,
  ) {
    super(
      'Failed to establish database connection',
      'DATABASE_CONNECTION_FAILED',
      HttpStatus.SERVICE_UNAVAILABLE,
      {
        connectionString: connectionString != null && connectionString !== '' ? '[REDACTED]' : undefined,
        originalError: originalError?.message,
        ...context,
      },
    );
  }
}

export class DatabaseTransactionException extends BaseException {
  constructor(
    transactionType: string,
    originalError?: Error,
    context?: Record<string, any>,
  ) {
    super(
      `Database transaction failed: ${transactionType}`,
      `DATABASE_TRANSACTION_${transactionType.toUpperCase()}_FAILED`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        originalError: originalError?.message,
        transactionType,
        ...context,
      },
    );
  }
}

export class DatabaseConstraintException extends BaseException {
  constructor(
    constraint: string,
    operation: string,
    originalError?: Error,
    context?: Record<string, any>,
  ) {
    super(
      `Database constraint violation: ${constraint}`,
      `DATABASE_CONSTRAINT_${constraint.toUpperCase()}_VIOLATION`,
      HttpStatus.CONFLICT,
      {
        constraint,
        operation,
        originalError: originalError?.message,
        ...context,
      },
    );
  }
}
