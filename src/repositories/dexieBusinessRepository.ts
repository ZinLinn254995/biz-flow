import { db } from '@/db';
import type { BizFlowDB } from '@/db/database';
import type { Business } from '@/types/domain/business';
import type { BusinessRepository } from '@/types/repositories/businessRepository';
import { DexieRepository } from '@/repositories/dexieRepository';

export class DexieBusinessRepository
  extends DexieRepository<Business>
  implements BusinessRepository
{
  constructor(database: BizFlowDB = db) {
    super(database.businesses);
  }
}
