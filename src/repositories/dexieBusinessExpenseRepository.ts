import { db } from '@/db';
import type { BizFlowDB } from '@/db/database';
import type { EntityId } from '@/types/common/base';
import type { BusinessExpense } from '@/types/domain/businessExpense';
import type { BusinessExpenseRepository } from '@/types/repositories/businessExpenseRepository';
import { DexieRepository } from '@/repositories/dexieRepository';

export class DexieBusinessExpenseRepository
  extends DexieRepository<BusinessExpense>
  implements BusinessExpenseRepository
{
  constructor(database: BizFlowDB = db) {
    super(database.businessExpenses);
  }

  async getByBusinessId(businessId: EntityId): Promise<BusinessExpense[]> {
    return this.table.where('businessId').equals(businessId).toArray();
  }
}
