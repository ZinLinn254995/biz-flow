import { Repository } from '@/types/repositories/repository';
import { Category } from '@/types/domain/category';
import { CategoryScope } from '@/types/common/enums';

export interface CategoryRepository extends Repository<Category> {
  /** Return categories filtered by scope (business or personal). */
  getByScope(scope: CategoryScope): Promise<Category[]>;
}
