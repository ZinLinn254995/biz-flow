import { BaseEntity, EntityId, Money } from '@/types/common/base';

/**
 * A business expense record.
 */
export interface BusinessExpense extends BaseEntity {
  businessId: EntityId;
  categoryId?: EntityId;
  title: string;
  /** ISO-8601 date the expense occurred. */
  date: string;
  amount: Money;
  accountId?: EntityId;
  notes?: string;
}
