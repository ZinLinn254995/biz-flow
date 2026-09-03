import { BaseEntity } from '@/types/common/base';
import { CategoryScope, TransactionDirection } from '@/types/common/enums';

/**
 * A category for classifying expenses, income, or other records.
 * Scoped to either business or personal context.
 */
export interface Category extends BaseEntity {
  name: string;
  scope: CategoryScope;
  /** Which transaction direction this category applies to. */
  direction?: TransactionDirection;
  /** Optional parent category for hierarchical grouping. */
  parentId?: string;
  /** UI display color (hex or Tailwind name). */
  color?: string;
}
