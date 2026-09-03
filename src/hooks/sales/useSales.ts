import { useServiceContainer } from '@/hooks/common';
import { useAsync } from '@/hooks/common/useAsync';
import type { Sale } from '@/types/domain/sale';
import type { EntityId } from '@/types/common/base';

export function useSales() {
  const { salesService } = useServiceContainer();
  return useAsync<Sale[]>(() => salesService.getAllSales());
}

export function useSalesByBusiness(businessId: EntityId | null) {
  const { salesService } = useServiceContainer();
  return useAsync<Sale[]>(
    () =>
      businessId
        ? salesService.getSalesByBusinessId(businessId)
        : Promise.resolve([]),
    [businessId],
  );
}

export function useSale(id: EntityId | null) {
  const { salesService } = useServiceContainer();
  return useAsync<Sale | null>(
    () => (id ? salesService.getSaleById(id) : Promise.resolve(null)),
    [id],
  );
}
