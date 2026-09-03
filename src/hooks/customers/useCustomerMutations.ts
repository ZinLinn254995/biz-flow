import { useServiceContainer } from '@/hooks/common';
import { useMutation } from '@/hooks/common/useMutation';
import type { Customer } from '@/types/domain/customer';
import type { EntityId } from '@/types/common/base';

export function useCreateCustomer() {
  const { customerService } = useServiceContainer();
  return useMutation<
    [input: {
      businessId: EntityId;
      name: string;
      email?: string;
      phone?: string;
      address?: string;
      notes?: string;
    }],
    Customer
  >((input) => customerService.createCustomer(input));
}

export function useUpdateCustomer() {
  const { customerService } = useServiceContainer();
  return useMutation<[id: EntityId, changes: Partial<Customer>], Customer>(
    (id, changes) => customerService.updateCustomer(id, changes),
  );
}

export function useDeleteCustomer() {
  const { customerService } = useServiceContainer();
  return useMutation<[id: EntityId], void>(
    (id) => customerService.deleteCustomer(id),
  );
}
