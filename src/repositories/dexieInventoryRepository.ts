import { db } from '@/db';
import type { BizFlowDB } from '@/db/database';
import type { EntityId } from '@/types/common/base';
import type { InventoryItem } from '@/types/domain/inventory';
import type { InventoryRepository } from '@/types/repositories/inventoryRepository';
import { DexieRepository } from '@/repositories/dexieRepository';

export class DexieInventoryRepository
  extends DexieRepository<InventoryItem>
  implements InventoryRepository
{
  constructor(database: BizFlowDB = db) {
    super(database.inventoryItems);
  }

  async getByBusinessId(businessId: EntityId): Promise<InventoryItem[]> {
    return this.table.where('businessId').equals(businessId).toArray();
  }
}
