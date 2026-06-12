import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class InfinityPaginationResponseDto<T> {
  data: T[];
  hasNextPage: boolean;
}

export function InfinityPaginationResponse<T>(classReference: Type<T>): any {
  abstract class Pagination {
    @ApiProperty({ type: [classReference] })
    data!: T[];

    @ApiProperty({
      example: true,
      type: Boolean,
    })
    hasNextPage: boolean;
  }

  Object.defineProperty(Pagination, 'name', {
    value: `InfinityPagination${classReference.name}ResponseDto`,
    writable: false,
  });

  return Pagination;
}
