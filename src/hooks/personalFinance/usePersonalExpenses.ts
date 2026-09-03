import { useServiceContainer } from '@/hooks/common';
import { useAsync } from '@/hooks/common/useAsync';
import type { PersonalExpense } from '@/types/domain/personalFinance';
import type { EntityId } from '@/types/common/base';

export function usePersonalExpenses() {
  const { personalExpenseService } = useServiceContainer();
  return useAsync<PersonalExpense[]>(() => personalExpenseService.getAll());
}

export function usePersonalExpense(id: EntityId | null) {
  const { personalExpenseService } = useServiceContainer();
  return useAsync<PersonalExpense | null>(
    () => (id ? personalExpenseService.getById(id) : Promise.resolve(null)),
    [id],
  );
}
