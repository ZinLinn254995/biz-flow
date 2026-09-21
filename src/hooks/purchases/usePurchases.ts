import { useServiceContainer } from '@/hooks/common';
import { useAsync } from '@/hooks/common/useAsync';
import type { EntityId } from '@/types/common/base';
import type { Purchase } from '@/types/domain/purchase';

export function usePurchases() {
  const { purchaseService } = useServiceContainer();
  return useAsync<Purchase[]>(() => purchaseService?.getAllPurchases() ?? Promise.resolve([]));
}

export function usePurchasesByBusiness(businessId: EntityId | null) {
  const { purchaseService } = useServiceContainer();
  return useAsync<Purchase[]>(
    () =>
      businessId && purchaseService
        ? purchaseService.getPurchasesByBusinessId(businessId)
        : Promise.resolve([]),
    [businessId, purchaseService],
  );
}

export function usePurchase(id: EntityId | null) {
  const { purchaseService } = useServiceContainer();
  return useAsync<Purchase | null>(
    () => (id && purchaseService ? purchaseService.getPurchaseById(id) : Promise.resolve(null)),
    [id, purchaseService],
  );
}
