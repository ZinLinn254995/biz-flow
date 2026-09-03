import { useServiceContainer } from '@/hooks/common';
import { useMutation } from '@/hooks/common/useMutation';
import type { PersonalIncome } from '@/types/domain/personalFinance';
import type { EntityId } from '@/types/common/base';

export function useCreatePersonalIncome() {
  const { personalIncomeService } = useServiceContainer();
  return useMutation<
    [input: {
      categoryId?: EntityId;
      source: string;
      date: string;
      amount: { amountMinor: number; currency: string };
      accountId?: EntityId;
      notes?: string;
    }],
    PersonalIncome
  >((input) => personalIncomeService.create(input));
}

export function useUpdatePersonalIncome() {
  const { personalIncomeService } = useServiceContainer();
  return useMutation<
    [id: EntityId, changes: Partial<PersonalIncome>],
    PersonalIncome
  >((id, changes) => personalIncomeService.update(id, changes));
}

export function useDeletePersonalIncome() {
  const { personalIncomeService } = useServiceContainer();
  return useMutation<[id: EntityId], void>(
    (id) => personalIncomeService.delete(id),
  );
}
