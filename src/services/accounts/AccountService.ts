import type { AccountRepository } from '@/types/repositories/accountRepository';
import type { Account } from '@/types/domain/account';
import type { EntityId } from '@/types/common/base';
import { requireNonEmptyString, validateMoney, trimToNull } from '@/services/common';

export class AccountService {
  constructor(private readonly repository: AccountRepository) {}

  async getAccountById(id: EntityId): Promise<Account | null> {
    return this.repository.getById(id);
  }

  async getAllAccounts(): Promise<Account[]> {
    return this.repository.getAll();
  }

  async createAccount(input: {
    name: string;
    type: Account['type'];
    balance: { amountMinor: number; currency: string };
    institution?: string;
  }): Promise<Account> {
    const name = requireNonEmptyString(input.name, 'name');
    validateMoney(input.balance, 'balance');
    const institution = trimToNull(input.institution) ?? undefined;

    return this.repository.create({ ...input, name, institution });
  }

  async updateAccount(id: EntityId, changes: Partial<Account>): Promise<Account> {
    if (changes.name !== undefined) {
      requireNonEmptyString(changes.name, 'name');
    }
    if (changes.balance !== undefined) {
      validateMoney(changes.balance, 'balance');
    }
    if (changes.institution !== undefined) {
      changes.institution = trimToNull(changes.institution) ?? undefined;
    }
    return this.repository.update(id, changes);
  }

  async deleteAccount(id: EntityId): Promise<void> {
    return this.repository.remove(id);
  }
}
