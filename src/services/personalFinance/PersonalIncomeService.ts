import type { PersonalIncomeRepository } from '@/types/repositories/personalIncomeRepository';
import type { PersonalIncome } from '@/types/domain/personalFinance';
import type { EntityId } from '@/types/common/base';
import { requireNonEmptyString, validateMoney, trimToNull, directTransactionRunner, type TransactionRunner } from '@/services/common';
import { AccountService } from '@/services/accounts/AccountService';

export class PersonalIncomeService {
  constructor(
    private readonly repository: PersonalIncomeRepository,
    private readonly accountService?: AccountService,
    private readonly transactionRunner: TransactionRunner = directTransactionRunner,
  ) {}

  async getById(id: EntityId): Promise<PersonalIncome | null> {
    return this.repository.getById(id);
  }

  async getAll(): Promise<PersonalIncome[]> {
    return this.repository.getAll();
  }

  async create(input: {
    categoryId?: EntityId;
    source: string;
    date: string;
    amount: { amountMinor: number; currency: string };
    accountId?: EntityId;
    notes?: string;
  }): Promise<PersonalIncome> {
    const source = requireNonEmptyString(input.source, 'source');
    const date = requireNonEmptyString(input.date, 'date');
    validateMoney(input.amount, 'amount');
    const notes = trimToNull(input.notes) ?? undefined;

    return this.transactionRunner.run(async () => {
      const income = await this.repository.create({ ...input, source, date, notes });
      if (income.accountId) {
        await this.accountService?.adjustBalance(income.accountId, income.amount);
      }
      return income;
    });
  }

  async update(id: EntityId, changes: Partial<PersonalIncome>): Promise<PersonalIncome> {
    if (changes.source !== undefined) {
      requireNonEmptyString(changes.source, 'source');
    }
    if (changes.date !== undefined) {
      requireNonEmptyString(changes.date, 'date');
    }
    if (changes.amount !== undefined) {
      validateMoney(changes.amount, 'amount');
    }
    return this.transactionRunner.run(async () => {
      const current = await this.repository.getById(id);
      const updated = await this.repository.update(id, changes);
      if (current?.accountId) {
        await this.accountService?.adjustBalance(current.accountId, {
          amountMinor: -current.amount.amountMinor,
          currency: current.amount.currency,
        });
      }
      if (updated.accountId) {
        await this.accountService?.adjustBalance(updated.accountId, updated.amount);
      }
      return updated;
    });
  }

  async delete(id: EntityId): Promise<void> {
    return this.transactionRunner.run(async () => {
      const current = await this.repository.getById(id);
      if (current?.accountId) {
        await this.accountService?.adjustBalance(current.accountId, {
          amountMinor: -current.amount.amountMinor,
          currency: current.amount.currency,
        });
      }
      await this.repository.remove(id);
    });
  }
}
