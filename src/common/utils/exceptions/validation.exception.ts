import { HttpStatus } from '@nestjs/common';

import { BaseException } from './base.exception';

export interface ValidationError {
  constraint?: string;
  field: string;
  message: string;
  value?: any;
}

export class ValidationException extends BaseException {
  public readonly validationErrors: ValidationError[];

  constructor(errors: ValidationError[], context?: Record<string, any>) {
    const message = 'Validation failed';
    super(
      message,
      'VALIDATION_FAILED',
      HttpStatus.UNPROCESSABLE_ENTITY,
      context,
    );

    this.validationErrors = errors;
  }

  getResponse() {
    const baseResponse = super.getResponse() as Record<string, any>;
    return {
      ...baseResponse,
      errors: this.validationErrors.reduce<Record<string, string>>(
        (accumulator, error) => {
          accumulator[error.field] = error.message;
          return accumulator;
        },
        {},
      ),
    };
  }
}

export class InvalidInputException extends BaseException {
  constructor(
    field: string,
    value: any,
    expectedFormat: string,
    context?: Record<string, any>,
  ) {
    super(
      `Invalid value for ${field}. Expected: ${expectedFormat}`,
      `INVALID_INPUT_${field.toUpperCase()}`,
      HttpStatus.BAD_REQUEST,
      {
        expectedFormat,
        field,
        value,
        ...context,
      },
    );
  }
}
