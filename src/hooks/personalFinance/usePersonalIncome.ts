import { useServiceContainer } from '@/hooks/common';
import { useAsync } from '@/hooks/common/useAsync';
import type { PersonalIncome } from '@/types/domain/personalFinance';
import type { EntityId } from '@/types/common/base';

export function usePersonalIncomeRecords() {
  const { personalIncomeService } = useServiceContainer();
  return useAsync<PersonalIncome[]>(() => personalIncomeService.getAll());
}

export function usePersonalIncomeRecord(id: EntityId | null) {
  const { personalIncomeService } = useServiceContainer();
  return useAsync<PersonalIncome | null>(
    () => (id ? personalIncomeService.getById(id) : Promise.resolve(null)),
    [id],
  );
}
