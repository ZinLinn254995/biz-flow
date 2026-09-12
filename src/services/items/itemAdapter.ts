import type { InventoryItem } from '@/types/domain/inventory';
import type { GenericItem } from '@/types/domain/item';

/** Projects persisted inventory identity into the generic item foundation. */
export function toGenericItem(inventoryItem: InventoryItem): GenericItem {
  return {
    id: inventoryItem.id,
    createdAt: inventoryItem.createdAt,
    updatedAt: inventoryItem.updatedAt,
    name: inventoryItem.name,
    kind: 'inventory',
  };
}
