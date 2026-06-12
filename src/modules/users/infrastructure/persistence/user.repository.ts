import type { DeepPartial } from '../../../../common/utils/types/deep-partial.type';
import type { NullableType } from '../../../../common/utils/types/nullable.type';
import type { IPaginationOptions } from '../../../../common/utils/types/pagination-options';
import type { FilterUserDto, SortUserDto } from '../../dto/query-user.dto';
import type { User } from '../../dto/user.dto';

export abstract class UserRepository {
  abstract create(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<User>;

  abstract findManyWithPagination({
    filterOptions,
    paginationOptions,
    sortOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<User[]>;

  abstract findById(id: User['id']): Promise<NullableType<User>>;
  abstract findByIds(ids: User['id'][]): Promise<User[]>;
  abstract findByEmail(email: User['email']): Promise<NullableType<User>>;

  abstract update(
    id: User['id'],
    payload: DeepPartial<User>,
  ): Promise<User | null>;

  abstract remove(id: User['id']): Promise<void>;
}
