import type { MaybeType } from '../types/maybe.type';
import type { TransformFnParams } from 'class-transformer/types/interfaces';

export const lowerCaseTransformer = (
  parameters: TransformFnParams,
): MaybeType<string> => {
  const { value } = parameters;
  if (typeof value === 'string') {
    return value.toLowerCase().trim();
  }
  return value as MaybeType<string>;
};
