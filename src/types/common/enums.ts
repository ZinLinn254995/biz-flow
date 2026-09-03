/**
 * Status of a sale's payment lifecycle.
 */
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';

/**
 * Distinguishes business-scoped categories from personal-scoped ones.
 */
export type CategoryScope = 'business' | 'personal';

/**
 * The recurrence period a budget applies to.
 */
export type BudgetPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

/**
 * The kind of liquid asset an account represents.
 */
export type AccountType = 'cash' | 'bank' | 'wallet' | 'other';

/**
 * Stock availability state for an inventory item.
 */
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

/**
 * Whether a personal finance record is income or an expense.
 * Used by the Category model to scope categories to a direction.
 */
export type TransactionDirection = 'income' | 'expense';

/**
 * Sync state for future cloud synchronization.
 * `local`   – created/modified locally, not yet pushed.
 * `synced`  – pushed to remote and up to date.
 * `pending` – queued for push.
 * `conflict`– remote and local both changed; needs resolution.
 */
export type SyncStatus = 'local' | 'synced' | 'pending' | 'conflict';
