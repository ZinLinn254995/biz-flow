import { useServiceContainer } from '@/hooks/common';
import { useMutation } from '@/hooks/common/useMutation';
import type { Account } from '@/types/domain/account';
import type { EntityId } from '@/types/common/base';

export function useCreateAccount() {
  const { accountService } = useServiceContainer();
  return useMutation<
    [input: {
      name: string;
      type: Account['type'];
      balance: { amountMinor: number; currency: string };
      institution?: string;
    }],
    Account
  >((input) => accountService.createAccount(input));
}

export function useUpdateAccount() {
  const { accountService } = useServiceContainer();
  return useMutation<[id: EntityId, changes: Partial<Account>], Account>(
    (id, changes) => accountService.updateAccount(id, changes),
  );
}

export function useDeleteAccount() {
  const { accountService } = useServiceContainer();
  return useMutation<[id: EntityId], void>(
    (id) => accountService.deleteAccount(id),
  );
}
