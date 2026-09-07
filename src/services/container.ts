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
  salesTransactionRunner,
} from '@/repositories';

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
}

export function createServiceContainer(): ServiceContainer {
  return {
    businessService: new BusinessService(businessRepository),
    inventoryService: new InventoryService(inventoryRepository),
    salesService: new SalesService(saleRepository, inventoryRepository, salesTransactionRunner),
    customerService: new CustomerService(customerRepository),
    businessExpenseService: new BusinessExpenseService(businessExpenseRepository),
    personalIncomeService: new PersonalIncomeService(personalIncomeRepository),
    personalExpenseService: new PersonalExpenseService(personalExpenseRepository),
    categoryService: new CategoryService(categoryRepository),
    budgetService: new BudgetService(budgetRepository),
    accountService: new AccountService(accountRepository),
  };
}

let cachedContainer: ServiceContainer | null = null;

export function getServiceContainer(): ServiceContainer {
  if (!cachedContainer) {
    cachedContainer = createServiceContainer();
  }
  return cachedContainer;
}
