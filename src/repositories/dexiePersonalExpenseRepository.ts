import { db } from '@/db';
import type { BizFlowDB } from '@/db/database';
import type { PersonalExpense } from '@/types/domain/personalFinance';
import type { PersonalExpenseRepository } from '@/types/repositories/personalExpenseRepository';
import { DexieRepository } from '@/repositories/dexieRepository';

export class DexiePersonalExpenseRepository
  extends DexieRepository<PersonalExpense>
  implements PersonalExpenseRepository
{
  constructor(database: BizFlowDB = db) {
    super(database.personalExpenses);
  }
}
