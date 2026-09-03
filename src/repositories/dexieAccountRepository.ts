import { db } from '@/db';
import type { BizFlowDB } from '@/db/database';
import type { Account } from '@/types/domain/account';
import type { AccountRepository } from '@/types/repositories/accountRepository';
import { DexieRepository } from '@/repositories/dexieRepository';

export class DexieAccountRepository
  extends DexieRepository<Account>
  implements AccountRepository
{
  constructor(database: BizFlowDB = db) {
    super(database.accounts);
  }
}
