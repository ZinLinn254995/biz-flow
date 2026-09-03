import { useServiceContainer } from '@/hooks/common';
import { useAsync } from '@/hooks/common/useAsync';
import type { InventoryItem } from '@/types/domain/inventory';
import type { EntityId } from '@/types/common/base';

export function useInventoryItems() {
  const { inventoryService } = useServiceContainer();
  return useAsync<InventoryItem[]>(() => inventoryService.getAllInventoryItems());
}

export function useInventoryItemsByBusiness(businessId: EntityId | null) {
  const { inventoryService } = useServiceContainer();
  return useAsync<InventoryItem[]>(
    () =>
      businessId
        ? inventoryService.getInventoryItemsByBusinessId(businessId)
        : Promise.resolve([]),
    [businessId],
  );
}

export function useInventoryItem(id: EntityId | null) {
  const { inventoryService } = useServiceContainer();
  return useAsync<InventoryItem | null>(
    () => (id ? inventoryService.getInventoryItemById(id) : Promise.resolve(null)),
    [id],
  );
}
