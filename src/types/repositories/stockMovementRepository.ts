import type { EntityId } from '@/types/common/base';
import type { StockMovement } from '@/types/domain/stockMovement';

export interface StockMovementRepository {
  getById(id: EntityId): Promise<StockMovement | null>;
  getAll(): Promise<StockMovement[]>;
  getByInventoryItemId(inventoryItemId: EntityId): Promise<StockMovement[]>;
  create(entity: Omit<StockMovement, 'id' | 'createdAt' | 'updatedAt'>): Promise<StockMovement>;
}
