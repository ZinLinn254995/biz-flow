import { db } from '@/db';
import type { BizFlowDB } from '@/db/database';
import type { EntityId } from '@/types/common/base';
import type { Purchase } from '@/types/domain/purchase';
import type { PurchaseRepository } from '@/types/repositories/purchaseRepository';
import { DexieRepository } from '@/repositories/dexieRepository';

export class DexiePurchaseRepository
  extends DexieRepository<Purchase>
  implements PurchaseRepository
{
  constructor(database: BizFlowDB = db) {
    super(database.purchases);
  }

  async getByBusinessId(businessId: EntityId): Promise<Purchase[]> {
    return this.table.where('businessId').equals(businessId).toArray();
  }
}
