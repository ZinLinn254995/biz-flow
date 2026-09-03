import { db } from '@/db';
import type { BizFlowDB } from '@/db/database';
import type { EntityId } from '@/types/common/base';
import type { Customer } from '@/types/domain/customer';
import type { CustomerRepository } from '@/types/repositories/customerRepository';
import { DexieRepository } from '@/repositories/dexieRepository';

export class DexieCustomerRepository
  extends DexieRepository<Customer>
  implements CustomerRepository
{
  constructor(database: BizFlowDB = db) {
    super(database.customers);
  }

  async getByBusinessId(businessId: EntityId): Promise<Customer[]> {
    return this.table.where('businessId').equals(businessId).toArray();
  }
}
