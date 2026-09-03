import { useServiceContainer } from '@/hooks/common';
import { useAsync } from '@/hooks/common/useAsync';
import type { BusinessExpense } from '@/types/domain/businessExpense';
import type { EntityId } from '@/types/common/base';

export function useBusinessExpenses() {
  const { businessExpenseService } = useServiceContainer();
  return useAsync<BusinessExpense[]>(() =>
    businessExpenseService.getAllBusinessExpenses(),
  );
}

export function useBusinessExpensesByBusiness(businessId: EntityId | null) {
  const { businessExpenseService } = useServiceContainer();
  return useAsync<BusinessExpense[]>(
    () =>
      businessId
        ? businessExpenseService.getBusinessExpensesByBusinessId(businessId)
        : Promise.resolve([]),
    [businessId],
  );
}

export function useBusinessExpense(id: EntityId | null) {
  const { businessExpenseService } = useServiceContainer();
  return useAsync<BusinessExpense | null>(
    () =>
      id
        ? businessExpenseService.getBusinessExpenseById(id)
        : Promise.resolve(null),
    [id],
  );
}
