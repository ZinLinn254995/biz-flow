import type { BusinessExpenseRepository } from '@/types/repositories/businessExpenseRepository';
import type { BusinessExpense } from '@/types/domain/businessExpense';
import type { EntityId } from '@/types/common/base';
import { requireNonEmptyString, validateMoney, trimToNull } from '@/services/common';

export class BusinessExpenseService {
  constructor(private readonly repository: BusinessExpenseRepository) {}

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

    return this.repository.create({ ...input, title, date, notes });
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
    return this.repository.update(id, changes);
  }

  async deleteBusinessExpense(id: EntityId): Promise<void> {
    return this.repository.remove(id);
  }
}
