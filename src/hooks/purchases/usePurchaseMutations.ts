import { useServiceContainer } from '@/hooks/common';
import { useMutation } from '@/hooks/common/useMutation';
import type { EntityId, Money } from '@/types/common/base';
import type { Purchase, PurchaseItem } from '@/types/domain/purchase';

export function useCreatePurchase() {
  const { purchaseService } = useServiceContainer();
  return useMutation<
    [input: {
      businessId: EntityId;
      date: string;
      items: PurchaseItem[];
      totalAmount: Money;
      supplierName?: string;
      notes?: string;
    }],
    Purchase
  >((input) => purchaseService?.createPurchase(input) ?? Promise.reject(new Error('Purchase service unavailable')));
}

export function useUpdatePurchase() {
  const { purchaseService } = useServiceContainer();
  return useMutation<[id: EntityId, changes: Partial<Purchase>], Purchase>(
    (id, changes) => purchaseService?.updatePurchase(id, changes) ?? Promise.reject(new Error('Purchase service unavailable')),
  );
}

export function useDeletePurchase() {
  const { purchaseService } = useServiceContainer();
  return useMutation<[id: EntityId], void>(
    (id) => purchaseService?.deletePurchase(id) ?? Promise.reject(new Error('Purchase service unavailable')),
  );
}
