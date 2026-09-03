import { useServiceContainer } from '@/hooks/common';
import { useAsync } from '@/hooks/common/useAsync';
import type { Business } from '@/types/domain/business';
import type { EntityId } from '@/types/common/base';

export function useBusiness(id: EntityId | null) {
  const { businessService } = useServiceContainer();
  return useAsync<Business | null>(
    () => (id ? businessService.getBusinessById(id) : Promise.resolve(null)),
    [id],
  );
}
