import { HttpException, type HttpStatus } from '@nestjs/common';

export abstract class BaseException extends HttpException {
  public readonly code: string;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    status: HttpStatus,
    context?: Record<string, any>,
  ) {
    super(
      {
        code,
        message,
        statusCode: status,
        ...(context && { context }),
      },
      status,
    );

    this.code = code;
    this.context = context;
  }
}
