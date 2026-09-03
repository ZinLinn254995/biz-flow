import { db } from '@/db';
import type { BizFlowDB } from '@/db/database';
import type { CategoryScope } from '@/types/common/enums';
import type { Category } from '@/types/domain/category';
import type { CategoryRepository } from '@/types/repositories/categoryRepository';
import { DexieRepository } from '@/repositories/dexieRepository';

export class DexieCategoryRepository
  extends DexieRepository<Category>
  implements CategoryRepository
{
  constructor(database: BizFlowDB = db) {
    super(database.categories);
  }

  async getByScope(scope: CategoryScope): Promise<Category[]> {
    return this.table.where('scope').equals(scope).toArray();
  }
}
