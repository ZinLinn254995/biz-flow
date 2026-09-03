import { db } from '@/db';
import type { BizFlowDB } from '@/db/database';
import type { EntityId } from '@/types/common/base';
import type { Sale } from '@/types/domain/sale';
import type { SaleRepository } from '@/types/repositories/saleRepository';
import { DexieRepository } from '@/repositories/dexieRepository';

export class DexieSaleRepository
  extends DexieRepository<Sale>
  implements SaleRepository
{
  constructor(database: BizFlowDB = db) {
    super(database.sales);
  }

  async getByBusinessId(businessId: EntityId): Promise<Sale[]> {
    return this.table.where('businessId').equals(businessId).toArray();
  }
}
