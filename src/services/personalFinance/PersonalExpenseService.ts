import type { PersonalExpenseRepository } from '@/types/repositories/personalExpenseRepository';
import type { PersonalExpense } from '@/types/domain/personalFinance';
import type { EntityId } from '@/types/common/base';
import { requireNonEmptyString, validateMoney, trimToNull, directTransactionRunner, type TransactionRunner } from '@/services/common';
import { AccountService } from '@/services/accounts/AccountService';

export class PersonalExpenseService {
  constructor(
    private readonly repository: PersonalExpenseRepository,
    private readonly accountService?: AccountService,
    private readonly transactionRunner: TransactionRunner = directTransactionRunner,
  ) {}

  async getById(id: EntityId): Promise<PersonalExpense | null> {
    return this.repository.getById(id);
  }

  async getAll(): Promise<PersonalExpense[]> {
    return this.repository.getAll();
  }

  async create(input: {
    categoryId?: EntityId;
    title: string;
    date: string;
    amount: { amountMinor: number; currency: string };
    accountId?: EntityId;
    notes?: string;
  }): Promise<PersonalExpense> {
    const title = requireNonEmptyString(input.title, 'title');
    const date = requireNonEmptyString(input.date, 'date');
    validateMoney(input.amount, 'amount');
    const notes = trimToNull(input.notes) ?? undefined;

    return this.transactionRunner.run(async () => {
      const expense = await this.repository.create({ ...input, title, date, notes });
      if (expense.accountId) {
        await this.accountService?.adjustBalance(expense.accountId, {
          amountMinor: -expense.amount.amountMinor,
          currency: expense.amount.currency,
        });
      }
      return expense;
    });
  }

  async update(id: EntityId, changes: Partial<PersonalExpense>): Promise<PersonalExpense> {
    if (changes.title !== undefined) {
      requireNonEmptyString(changes.title, 'title');
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
          amountMinor: current.amount.amountMinor,
          currency: current.amount.currency,
        });
      }
      if (updated.accountId) {
        await this.accountService?.adjustBalance(updated.accountId, {
          amountMinor: -updated.amount.amountMinor,
          currency: updated.amount.currency,
        });
      }
      return updated;
    });
  }

  async delete(id: EntityId): Promise<void> {
    return this.transactionRunner.run(async () => {
      const current = await this.repository.getById(id);
      if (current?.accountId) {
        await this.accountService?.adjustBalance(current.accountId, current.amount);
      }
      await this.repository.remove(id);
    });
  }
}
