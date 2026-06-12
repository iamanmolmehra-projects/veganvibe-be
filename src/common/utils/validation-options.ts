import {
  HttpStatus,
  UnprocessableEntityException,
  type ValidationError,
  type ValidationPipeOptions,
} from '@nestjs/common';

function generateErrors(errors: ValidationError[]): Record<string, unknown> {
  return Object.fromEntries(
    errors.map((currentValue) => [
      currentValue.property,
      (currentValue.children?.length ?? 0) > 0
        ? generateErrors(currentValue.children ?? [])
        : Object.values(currentValue.constraints ?? {}).join(', '),
    ]),
  );
}

const validationOptions: ValidationPipeOptions = {
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  exceptionFactory: (errors: ValidationError[]) =>
    new UnprocessableEntityException({
      errors: generateErrors(errors),
      status: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  transform: true,
  whitelist: true,
};

export { validationOptions as default };
