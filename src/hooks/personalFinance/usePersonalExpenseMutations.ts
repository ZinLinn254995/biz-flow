import { useServiceContainer } from '@/hooks/common';
import { useMutation } from '@/hooks/common/useMutation';
import type { PersonalExpense } from '@/types/domain/personalFinance';
import type { EntityId } from '@/types/common/base';

export function useCreatePersonalExpense() {
  const { personalExpenseService } = useServiceContainer();
  return useMutation<
    [input: {
      categoryId?: EntityId;
      title: string;
      date: string;
      amount: { amountMinor: number; currency: string };
      accountId?: EntityId;
      notes?: string;
    }],
    PersonalExpense
  >((input) => personalExpenseService.create(input));
}

export function useUpdatePersonalExpense() {
  const { personalExpenseService } = useServiceContainer();
  return useMutation<
    [id: EntityId, changes: Partial<PersonalExpense>],
    PersonalExpense
  >((id, changes) => personalExpenseService.update(id, changes));
}

export function useDeletePersonalExpense() {
  const { personalExpenseService } = useServiceContainer();
  return useMutation<[id: EntityId], void>(
    (id) => personalExpenseService.delete(id),
  );
}
