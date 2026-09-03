import type { BudgetRepository } from '@/types/repositories/budgetRepository';
import type { Budget } from '@/types/domain/budget';
import type { EntityId } from '@/types/common/base';
import { requireNonEmptyString, validateMoney, trimToNull } from '@/services/common';

export class BudgetService {
  constructor(private readonly repository: BudgetRepository) {}

  async getBudgetById(id: EntityId): Promise<Budget | null> {
    return this.repository.getById(id);
  }

  async getAllBudgets(): Promise<Budget[]> {
    return this.repository.getAll();
  }

  async createBudget(input: {
    categoryId: EntityId;
    limit: { amountMinor: number; currency: string };
    period: Budget['period'];
    startDate: string;
    endDate: string;
    notes?: string;
  }): Promise<Budget> {
    requireNonEmptyString(input.categoryId, 'categoryId');
    validateMoney(input.limit, 'limit');
    const startDate = requireNonEmptyString(input.startDate, 'startDate');
    const endDate = requireNonEmptyString(input.endDate, 'endDate');
    const notes = trimToNull(input.notes) ?? undefined;

    return this.repository.create({ ...input, startDate, endDate, notes });
  }

  async updateBudget(id: EntityId, changes: Partial<Budget>): Promise<Budget> {
    if (changes.limit !== undefined) {
      validateMoney(changes.limit, 'limit');
    }
    if (changes.startDate !== undefined) {
      requireNonEmptyString(changes.startDate, 'startDate');
    }
    if (changes.endDate !== undefined) {
      requireNonEmptyString(changes.endDate, 'endDate');
    }
    return this.repository.update(id, changes);
  }

  async deleteBudget(id: EntityId): Promise<void> {
    return this.repository.remove(id);
  }
}
