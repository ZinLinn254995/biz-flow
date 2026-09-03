import { Repository } from '@/types/repositories/repository';
import { Sale } from '@/types/domain/sale';
import { EntityId } from '@/types/common/base';

export interface SaleRepository extends Repository<Sale> {
  /** Return all sales belonging to a given business. */
  getByBusinessId(businessId: EntityId): Promise<Sale[]>;
}
