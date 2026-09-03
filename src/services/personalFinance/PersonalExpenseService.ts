import type { PersonalExpenseRepository } from '@/types/repositories/personalExpenseRepository';
import type { PersonalExpense } from '@/types/domain/personalFinance';
import type { EntityId } from '@/types/common/base';
import { requireNonEmptyString, validateMoney, trimToNull } from '@/services/common';

export class PersonalExpenseService {
  constructor(private readonly repository: PersonalExpenseRepository) {}

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

    return this.repository.create({ ...input, title, date, notes });
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
    return this.repository.update(id, changes);
  }

  async delete(id: EntityId): Promise<void> {
    return this.repository.remove(id);
  }
}
