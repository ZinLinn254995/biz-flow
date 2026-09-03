import { BaseEntity, EntityId, Money } from '@/types/common/base';
import { BudgetPeriod } from '@/types/common/enums';

/**
 * A budget limit for a category over a period.
 */
export interface Budget extends BaseEntity {
  categoryId: EntityId;
  /** Spending limit in minor units. */
  limit: Money;
  period: BudgetPeriod;
  /** ISO-8601 start date of the budget period. */
  startDate: string;
  /** ISO-8601 end date of the budget period. */
  endDate: string;
  notes?: string;
}
