import { useServiceContainer } from '@/hooks/common';
import { useAsync } from '@/hooks/common/useAsync';
import type { Business } from '@/types/domain/business';

export function useBusinesses() {
  const { businessService } = useServiceContainer();
  return useAsync<Business[]>(() => businessService.getAllBusinesses());
}
