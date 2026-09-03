import { Repository } from '@/types/repositories/repository';
import { Customer } from '@/types/domain/customer';
import { EntityId } from '@/types/common/base';

export interface CustomerRepository extends Repository<Customer> {
  /** Return all customers belonging to a given business. */
  getByBusinessId(businessId: EntityId): Promise<Customer[]>;
}
