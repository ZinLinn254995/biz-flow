import { db } from '@/db';
import type { BizFlowDB } from '@/db/database';
import type { Budget } from '@/types/domain/budget';
import type { BudgetRepository } from '@/types/repositories/budgetRepository';
import { DexieRepository } from '@/repositories/dexieRepository';

export class DexieBudgetRepository
  extends DexieRepository<Budget>
  implements BudgetRepository
{
  constructor(database: BizFlowDB = db) {
    super(database.budgets);
  }
}
