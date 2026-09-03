import { BaseEntity } from '@/types/common/base';

/**
 * A business owned or managed by the user.
 * All business-scoped entities (inventory, sales, customers, expenses)
 * reference this entity via `businessId`.
 */
export interface Business extends BaseEntity {
  name: string;
  description?: string;
  /** ISO 4217 currency code, e.g. "USD". */
  currency: string;
}
