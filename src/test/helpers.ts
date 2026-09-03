import { BizFlowDB } from '@/db/database';
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

/**
 * Creates a fresh isolated test database and all repository instances
 * bound to it. Each test file gets its own database instance so tests
 * never touch the production BizFlowDB.
 */
export function createTestContext() {
  const dbName = `BizFlowDB_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const database = new BizFlowDB(dbName);

  return {
    db: database,
    businessRepository: new DexieBusinessRepository(database),
    inventoryRepository: new DexieInventoryRepository(database),
    saleRepository: new DexieSaleRepository(database),
    customerRepository: new DexieCustomerRepository(database),
    businessExpenseRepository: new DexieBusinessExpenseRepository(database),
    personalIncomeRepository: new DexiePersonalIncomeRepository(database),
    personalExpenseRepository: new DexiePersonalExpenseRepository(database),
    categoryRepository: new DexieCategoryRepository(database),
    budgetRepository: new DexieBudgetRepository(database),
    accountRepository: new DexieAccountRepository(database),
    async cleanup() {
      database.close();
    },
  };
}
