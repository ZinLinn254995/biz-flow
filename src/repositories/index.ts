import { DexieBusinessRepository } from '@/repositories/dexieBusinessRepository';
import { DexieInventoryRepository } from '@/repositories/dexieInventoryRepository';
import { DexieSaleRepository } from '@/repositories/dexieSaleRepository';
import { DexieCustomerRepository } from '@/repositories/dexieCustomerRepository';
import { DexieBusinessExpenseRepository } from '@/repositories/dexieBusinessExpenseRepository';
import { DexiePersonalIncomeRepository } from '@/repositories/dexiePersonalIncomeRepository';
import { DexiePersonalExpenseRepository } from '@/repositories/dexiePersonalExpenseRepository';
import { DexieCategoryRepository } from '@/repositories/dexieCategoryRepository';
import { DexieBudgetRepository } from '@/repositories/dexieBudgetRepository';
import { DexieAccountRepository } from '@/repositories/dexieAccountRepository';
import { DexieDataBackupRepository } from '@/repositories/dexieDataBackupRepository';

export type {
  BusinessRepository,
  InventoryRepository,
  SaleRepository,
  CustomerRepository,
  BusinessExpenseRepository,
  PersonalIncomeRepository,
  PersonalExpenseRepository,
  CategoryRepository,
  BudgetRepository,
  AccountRepository,
} from '@/types/repositories';

export {
  DexieRepository,
} from '@/repositories/dexieRepository';

export { financeTransactionRunner, salesTransactionRunner } from '@/repositories/salesTransactionRunner';

export {
  DexieBusinessRepository,
  DexieInventoryRepository,
  DexieSaleRepository,
  DexieCustomerRepository,
  DexieBusinessExpenseRepository,
  DexiePersonalIncomeRepository,
  DexiePersonalExpenseRepository,
  DexieCategoryRepository,
  DexieBudgetRepository,
  DexieAccountRepository,
};

/**
 * Shared singleton repository instances.
 * Future application layers (hooks, services) should import these
 * rather than constructing new instances.
 */
export const businessRepository = new DexieBusinessRepository();
export const inventoryRepository = new DexieInventoryRepository();
export const saleRepository = new DexieSaleRepository();
export const customerRepository = new DexieCustomerRepository();
export const businessExpenseRepository = new DexieBusinessExpenseRepository();
export const personalIncomeRepository = new DexiePersonalIncomeRepository();
export const personalExpenseRepository = new DexiePersonalExpenseRepository();
export const categoryRepository = new DexieCategoryRepository();
export const budgetRepository = new DexieBudgetRepository();
export const accountRepository = new DexieAccountRepository();
export const dataBackupRepository = new DexieDataBackupRepository();
