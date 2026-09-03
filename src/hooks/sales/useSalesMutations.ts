import { useServiceContainer } from '@/hooks/common';
import { useMutation } from '@/hooks/common/useMutation';
import type { Sale, SaleItem } from '@/types/domain/sale';
import type { EntityId, Money } from '@/types/common/base';

export function useCreateSale() {
  const { salesService } = useServiceContainer();
  return useMutation<
    [input: {
      businessId: EntityId;
      customerId?: EntityId;
      date: string;
      items: SaleItem[];
      totalAmount: Money;
      paymentStatus: Sale['paymentStatus'];
      notes?: string;
    }],
    Sale
  >((input) => salesService.createSale(input));
}

export function useUpdateSale() {
  const { salesService } = useServiceContainer();
  return useMutation<[id: EntityId, changes: Partial<Sale>], Sale>(
    (id, changes) => salesService.updateSale(id, changes),
  );
}

export function useDeleteSale() {
  const { salesService } = useServiceContainer();
  return useMutation<[id: EntityId], void>((id) => salesService.deleteSale(id));
}
