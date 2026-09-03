import { useServiceContainer } from '@/hooks/common';
import { useMutation } from '@/hooks/common/useMutation';
import type { InventoryItem } from '@/types/domain/inventory';
import type { EntityId } from '@/types/common/base';

export function useCreateInventoryItem() {
  const { inventoryService } = useServiceContainer();
  return useMutation<
    [input: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>],
    InventoryItem
  >((input) => inventoryService.createInventoryItem(input));
}

export function useUpdateInventoryItem() {
  const { inventoryService } = useServiceContainer();
  return useMutation<
    [id: EntityId, changes: Partial<InventoryItem>],
    InventoryItem
  >((id, changes) => inventoryService.updateInventoryItem(id, changes));
}

export function useDeleteInventoryItem() {
  const { inventoryService } = useServiceContainer();
  return useMutation<[id: EntityId], void>(
    (id) => inventoryService.deleteInventoryItem(id),
  );
}
