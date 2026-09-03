import { useServiceContainer } from '@/hooks/common';
import { useMutation } from '@/hooks/common/useMutation';
import type { Business } from '@/types/domain/business';
import type { EntityId } from '@/types/common/base';

export function useCreateBusiness() {
  const { businessService } = useServiceContainer();
  return useMutation<
    [input: { name: string; description?: string; currency: string }],
    Business
  >((input) => businessService.createBusiness(input));
}

export function useUpdateBusiness() {
  const { businessService } = useServiceContainer();
  return useMutation<
    [id: EntityId, changes: Partial<Business>],
    Business
  >((id, changes) => businessService.updateBusiness(id, changes));
}

export function useDeleteBusiness() {
  const { businessService } = useServiceContainer();
  return useMutation<[id: EntityId], void>(
    (id) => businessService.deleteBusiness(id),
  );
}
