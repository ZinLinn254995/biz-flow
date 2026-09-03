import { useServiceContainer } from '@/hooks/common';
import { useMutation } from '@/hooks/common/useMutation';
import type { Budget } from '@/types/domain/budget';
import type { EntityId } from '@/types/common/base';

export function useCreateBudget() {
  const { budgetService } = useServiceContainer();
  return useMutation<
    [input: {
      categoryId: EntityId;
      limit: { amountMinor: number; currency: string };
      period: Budget['period'];
      startDate: string;
      endDate: string;
      notes?: string;
    }],
    Budget
  >((input) => budgetService.createBudget(input));
}

export function useUpdateBudget() {
  const { budgetService } = useServiceContainer();
  return useMutation<[id: EntityId, changes: Partial<Budget>], Budget>(
    (id, changes) => budgetService.updateBudget(id, changes),
  );
}

export function useDeleteBudget() {
  const { budgetService } = useServiceContainer();
  return useMutation<[id: EntityId], void>(
    (id) => budgetService.deleteBudget(id),
  );
}
