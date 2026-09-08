import type { BusinessExpenseRepository } from '@/types/repositories/businessExpenseRepository';
import type { BusinessExpense } from '@/types/domain/businessExpense';
import type { EntityId } from '@/types/common/base';
import { requireNonEmptyString, validateMoney, trimToNull, directTransactionRunner, type TransactionRunner } from '@/services/common';
import { AccountService } from '@/services/accounts/AccountService';

export class BusinessExpenseService {
  constructor(
    private readonly repository: BusinessExpenseRepository,
    private readonly accountService?: AccountService,
    private readonly transactionRunner: TransactionRunner = directTransactionRunner,
  ) {}

  async getBusinessExpenseById(id: EntityId): Promise<BusinessExpense | null> {
    return this.repository.getById(id);
  }

  async getAllBusinessExpenses(): Promise<BusinessExpense[]> {
    return this.repository.getAll();
  }

  async getBusinessExpensesByBusinessId(businessId: EntityId): Promise<BusinessExpense[]> {
    return this.repository.getByBusinessId(businessId);
  }

  async createBusinessExpense(input: {
    businessId: EntityId;
    categoryId?: EntityId;
    title: string;
    date: string;
    amount: { amountMinor: number; currency: string };
    accountId?: EntityId;
    notes?: string;
  }): Promise<BusinessExpense> {
    requireNonEmptyString(input.businessId, 'businessId');
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

  async updateBusinessExpense(id: EntityId, changes: Partial<BusinessExpense>): Promise<BusinessExpense> {
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

  async deleteBusinessExpense(id: EntityId): Promise<void> {
    return this.transactionRunner.run(async () => {
      const current = await this.repository.getById(id);
      if (current?.accountId) {
        await this.accountService?.adjustBalance(current.accountId, current.amount);
      }
      await this.repository.remove(id);
    });
  }
}
