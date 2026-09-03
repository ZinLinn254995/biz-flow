import { BaseEntity, EntityId, Money } from '@/types/common/base';

/**
 * A personal income record.
 */
export interface PersonalIncome extends BaseEntity {
  categoryId?: EntityId;
  source: string;
  /** ISO-8601 date the income was received. */
  date: string;
  amount: Money;
  accountId?: EntityId;
  notes?: string;
}

/**
 * A personal expense record.
 */
export interface PersonalExpense extends BaseEntity {
  categoryId?: EntityId;
  title: string;
  /** ISO-8601 date the expense occurred. */
  date: string;
  amount: Money;
  accountId?: EntityId;
  notes?: string;
}
