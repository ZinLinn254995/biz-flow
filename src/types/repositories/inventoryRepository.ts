import { Repository } from '@/types/repositories/repository';
import { InventoryItem } from '@/types/domain/inventory';
import { EntityId } from '@/types/common/base';

export interface InventoryRepository extends Repository<InventoryItem> {
  /** Return all inventory items belonging to a given business. */
  getByBusinessId(businessId: EntityId): Promise<InventoryItem[]>;
}
