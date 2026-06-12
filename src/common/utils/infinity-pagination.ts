import type { InfinityPaginationResponseDto } from './dto/infinity-pagination-response.dto';
import type { IPaginationOptions } from './types/pagination-options';

export const infinityPagination = <T>(
  data: T[],
  options: IPaginationOptions,
): InfinityPaginationResponseDto<T> => ({
  data,
  hasNextPage: data.length === options.limit,
});
