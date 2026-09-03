import { Repository } from '@/types/repositories/repository';
import { BusinessExpense } from '@/types/domain/businessExpense';
import { EntityId } from '@/types/common/base';

export interface BusinessExpenseRepository extends Repository<BusinessExpense> {
  /** Return all expenses belonging to a given business. */
  getByBusinessId(businessId: EntityId): Promise<BusinessExpense[]>;
}
