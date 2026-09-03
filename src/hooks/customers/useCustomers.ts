import { useServiceContainer } from '@/hooks/common';
import { useAsync } from '@/hooks/common/useAsync';
import type { Customer } from '@/types/domain/customer';
import type { EntityId } from '@/types/common/base';

export function useCustomers() {
  const { customerService } = useServiceContainer();
  return useAsync<Customer[]>(() => customerService.getAllCustomers());
}

export function useCustomersByBusiness(businessId: EntityId | null) {
  const { customerService } = useServiceContainer();
  return useAsync<Customer[]>(
    () =>
      businessId
        ? customerService.getCustomersByBusinessId(businessId)
        : Promise.resolve([]),
    [businessId],
  );
}

export function useCustomer(id: EntityId | null) {
  const { customerService } = useServiceContainer();
  return useAsync<Customer | null>(
    () => (id ? customerService.getCustomerById(id) : Promise.resolve(null)),
    [id],
  );
}
