import { BusinessService } from '@/services/business/BusinessService';
import { InventoryService } from '@/services/inventory/InventoryService';
import { SalesService } from '@/services/sales/SalesService';
import { CustomerService } from '@/services/customers/CustomerService';
import { BusinessExpenseService } from '@/services/businessExpenses/BusinessExpenseService';
import { PersonalIncomeService } from '@/services/personalFinance/PersonalIncomeService';
import { PersonalExpenseService } from '@/services/personalFinance/PersonalExpenseService';
import { CategoryService } from '@/services/categories/CategoryService';
import { BudgetService } from '@/services/budgets/BudgetService';
import { AccountService } from '@/services/accounts/AccountService';

import {
  businessRepository,
  inventoryRepository,
  saleRepository,
  customerRepository,
  businessExpenseRepository,
  personalIncomeRepository,
  personalExpenseRepository,
  categoryRepository,
  budgetRepository,
  accountRepository,
  dataBackupRepository,
  salesTransactionRunner,
  financeTransactionRunner,
} from '@/repositories';
import { DataBackupService } from '@/services/dataBackup/DataBackupService';

/**
 * Bundles all application services so they can be provided to the
 * React layer through a single context. Production wiring uses the
 * existing repository singletons; tests can construct a container
 * with mock repositories instead.
 */
export interface ServiceContainer {
  businessService: BusinessService;
  inventoryService: InventoryService;
  salesService: SalesService;
  customerService: CustomerService;
  businessExpenseService: BusinessExpenseService;
  personalIncomeService: PersonalIncomeService;
  personalExpenseService: PersonalExpenseService;
  categoryService: CategoryService;
  budgetService: BudgetService;
  accountService: AccountService;
  dataBackupService?: DataBackupService;
}

export function createServiceContainer(): ServiceContainer {
  return {
    businessService: new BusinessService(businessRepository),
    inventoryService: new InventoryService(inventoryRepository),
    salesService: new SalesService(saleRepository, inventoryRepository, salesTransactionRunner),
    customerService: new CustomerService(customerRepository),
    businessExpenseService: new BusinessExpenseService(businessExpenseRepository, new AccountService(accountRepository), financeTransactionRunner),
    personalIncomeService: new PersonalIncomeService(personalIncomeRepository, new AccountService(accountRepository), financeTransactionRunner),
    personalExpenseService: new PersonalExpenseService(personalExpenseRepository, new AccountService(accountRepository), financeTransactionRunner),
    categoryService: new CategoryService(categoryRepository),
    budgetService: new BudgetService(budgetRepository, businessExpenseRepository, personalExpenseRepository),
    accountService: new AccountService(accountRepository),
    dataBackupService: new DataBackupService(dataBackupRepository),
  };
}

let cachedContainer: ServiceContainer | null = null;

export function getServiceContainer(): ServiceContainer {
  if (!cachedContainer) {
    cachedContainer = createServiceContainer();
  }
  return cachedContainer;
}
