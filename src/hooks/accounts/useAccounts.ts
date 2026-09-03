import { useServiceContainer } from '@/hooks/common';
import { useAsync } from '@/hooks/common/useAsync';
import type { Account } from '@/types/domain/account';
import type { EntityId } from '@/types/common/base';

export function useAccounts() {
  const { accountService } = useServiceContainer();
  return useAsync<Account[]>(() => accountService.getAllAccounts());
}

export function useAccount(id: EntityId | null) {
  const { accountService } = useServiceContainer();
  return useAsync<Account | null>(
    () => (id ? accountService.getAccountById(id) : Promise.resolve(null)),
    [id],
  );
}
