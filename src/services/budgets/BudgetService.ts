import type { BudgetRepository } from '@/types/repositories/budgetRepository';
import type { BusinessExpenseRepository } from '@/types/repositories/businessExpenseRepository';
import type { PersonalExpenseRepository } from '@/types/repositories/personalExpenseRepository';
import type { Budget } from '@/types/domain/budget';
import type { EntityId, Money } from '@/types/common/base';
import { requireNonEmptyString, validateMoney, trimToNull } from '@/services/common';

export interface BudgetSpending {
  spent: Money;
  remaining: Money;
  percentUsed: number;
  isOverLimit: boolean;
}

export class BudgetService {
  constructor(
    private readonly repository: BudgetRepository,
    private readonly businessExpenseRepository?: BusinessExpenseRepository,
    private readonly personalExpenseRepository?: PersonalExpenseRepository,
  ) {}

  async getSpending(budget: Budget): Promise<BudgetSpending> {
    const [businessExpenses, personalExpenses] = await Promise.all([
      this.businessExpenseRepository?.getAll() ?? Promise.resolve([]),
      this.personalExpenseRepository?.getAll() ?? Promise.resolve([]),
    ]);
    const spentMinor = [...businessExpenses, ...personalExpenses]
      .filter((expense) =>
        expense.categoryId === budget.categoryId &&
        expense.date >= budget.startDate &&
        expense.date <= budget.endDate &&
        expense.amount.currency === budget.limit.currency,
      )
      .reduce((total, expense) => total + expense.amount.amountMinor, 0);
    const remainingMinor = budget.limit.amountMinor - spentMinor;
    return {
      spent: { amountMinor: spentMinor, currency: budget.limit.currency },
      remaining: { amountMinor: remainingMinor, currency: budget.limit.currency },
      percentUsed: budget.limit.amountMinor === 0
        ? (spentMinor > 0 ? 100 : 0)
        : Math.min(100, Math.round((spentMinor / budget.limit.amountMinor) * 100)),
      isOverLimit: spentMinor > budget.limit.amountMinor,
    };
  }

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
