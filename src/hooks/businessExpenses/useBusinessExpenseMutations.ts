import { useServiceContainer } from '@/hooks/common';
import { useMutation } from '@/hooks/common/useMutation';
import type { BusinessExpense } from '@/types/domain/businessExpense';
import type { EntityId } from '@/types/common/base';

export function useCreateBusinessExpense() {
  const { businessExpenseService } = useServiceContainer();
  return useMutation<
    [input: {
      businessId: EntityId;
      categoryId?: EntityId;
      title: string;
      date: string;
      amount: { amountMinor: number; currency: string };
      accountId?: EntityId;
      notes?: string;
    }],
    BusinessExpense
  >((input) => businessExpenseService.createBusinessExpense(input));
}

export function useUpdateBusinessExpense() {
  const { businessExpenseService } = useServiceContainer();
  return useMutation<
    [id: EntityId, changes: Partial<BusinessExpense>],
    BusinessExpense
  >((id, changes) => businessExpenseService.updateBusinessExpense(id, changes));
}

export function useDeleteBusinessExpense() {
  const { businessExpenseService } = useServiceContainer();
  return useMutation<[id: EntityId], void>(
    (id) => businessExpenseService.deleteBusinessExpense(id),
  );
}
