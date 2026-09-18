import { Repository } from '@/types/repositories/repository';
import { Purchase } from '@/types/domain/purchase';
import { EntityId } from '@/types/common/base';

export interface PurchaseRepository extends Repository<Purchase> {
  /** Return all purchases belonging to a given business. */
  getByBusinessId(businessId: EntityId): Promise<Purchase[]>;
}
