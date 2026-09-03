import type { PersonalIncomeRepository } from '@/types/repositories/personalIncomeRepository';
import type { PersonalIncome } from '@/types/domain/personalFinance';
import type { EntityId } from '@/types/common/base';
import { requireNonEmptyString, validateMoney, trimToNull } from '@/services/common';

export class PersonalIncomeService {
  constructor(private readonly repository: PersonalIncomeRepository) {}

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

    return this.repository.create({ ...input, source, date, notes });
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
    return this.repository.update(id, changes);
  }

  async delete(id: EntityId): Promise<void> {
    return this.repository.remove(id);
  }
}
