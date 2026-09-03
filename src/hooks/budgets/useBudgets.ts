import { useServiceContainer } from '@/hooks/common';
import { useAsync } from '@/hooks/common/useAsync';
import type { Budget } from '@/types/domain/budget';
import type { EntityId } from '@/types/common/base';

export function useBudgets() {
  const { budgetService } = useServiceContainer();
  return useAsync<Budget[]>(() => budgetService.getAllBudgets());
}

export function useBudget(id: EntityId | null) {
  const { budgetService } = useServiceContainer();
  return useAsync<Budget | null>(
    () => (id ? budgetService.getBudgetById(id) : Promise.resolve(null)),
    [id],
  );
}
