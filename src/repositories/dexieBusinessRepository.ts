import { db } from '@/db';
import type { BizFlowDB } from '@/db/database';
import type { Business } from '@/types/domain/business';
import type { BusinessRepository } from '@/types/repositories/businessRepository';
import { DexieRepository } from '@/repositories/dexieRepository';
import { createBusinessCascadeTransactionRunner } from '@/repositories/salesTransactionRunner';
import type { EntityId } from '@/types/common/base';

export class DexieBusinessRepository
  extends DexieRepository<Business>
  implements BusinessRepository
{
  private readonly database: BizFlowDB;

  constructor(database: BizFlowDB = db) {
    super(database.businesses);
    this.database = database;
  }

  async removeCascade(id: EntityId): Promise<void> {
    const transactionRunner = createBusinessCascadeTransactionRunner(this.database);
    await transactionRunner.run(async () => {
      const business = await this.database.businesses.get(id);
      if (!business) return;

      await this.database.inventoryItems.where('businessId').equals(id).delete();
      await this.database.sales.where('businessId').equals(id).delete();
      await this.database.customers.where('businessId').equals(id).delete();
      await this.database.businessExpenses.where('businessId').equals(id).delete();
      await this.database.businesses.delete(id);
    });
  }
}
