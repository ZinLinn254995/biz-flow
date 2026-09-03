import { db } from '@/db';
import type { BizFlowDB } from '@/db/database';
import type { PersonalIncome } from '@/types/domain/personalFinance';
import type { PersonalIncomeRepository } from '@/types/repositories/personalIncomeRepository';
import { DexieRepository } from '@/repositories/dexieRepository';

export class DexiePersonalIncomeRepository
  extends DexieRepository<PersonalIncome>
  implements PersonalIncomeRepository
{
  constructor(database: BizFlowDB = db) {
    super(database.personalIncomes);
  }
}
