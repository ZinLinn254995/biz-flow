import { db } from '@/db';
import type { TransactionRunner } from '@/services/common/transaction';

/**
 * Dexie-backed transaction runner covering the tables touched by sale
 * creation, update and deletion. Dexie rolls the whole transaction back
 * automatically if the callback throws, which makes stock movements and sale
 * persistence atomic.
 */
export const salesTransactionRunner: TransactionRunner = {
  run<T>(work: () => Promise<T>): Promise<T> {
    return db.transaction('rw', [db.sales, db.inventoryItems], work);
  },
};

/** Covers account-linked income and expense writes atomically. */
export const financeTransactionRunner: TransactionRunner = {
  run<T>(work: () => Promise<T>): Promise<T> {
    return db.transaction(
      'rw',
      [db.accounts, db.businessExpenses, db.personalExpenses, db.personalIncomes],
      work,
    );
  },
};
