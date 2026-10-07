import type { EntityId } from '@/types/common/base';
import type { StockMovement } from '@/types/domain/stockMovement';
import type { StockMovementRepository } from '@/types/repositories/stockMovementRepository';
import { DexieRepository } from '@/repositories/dexieRepository';
import { db } from '@/db';

export class DexieStockMovementRepository extends DexieRepository<StockMovement> implements StockMovementRepository {
  constructor() { super(db.stockMovements); }

  async getByInventoryItemId(inventoryItemId: EntityId): Promise<StockMovement[]> {
    return this.table.where('inventoryItemId').equals(inventoryItemId).toArray();
  }
}
