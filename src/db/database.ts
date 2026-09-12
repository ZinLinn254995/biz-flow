import Dexie, { type Table } from 'dexie';
import type { EntityId } from '@/types/common/base';
import type { Business } from '@/types/domain/business';
import type { InventoryItem } from '@/types/domain/inventory';
import type { Sale } from '@/types/domain/sale';
import type { Customer } from '@/types/domain/customer';
import type { BusinessExpense } from '@/types/domain/businessExpense';
import type { PersonalIncome, PersonalExpense } from '@/types/domain/personalFinance';
import type { Category } from '@/types/domain/category';
import type { Budget } from '@/types/domain/budget';
import type { Account } from '@/types/domain/account';
import type { SavedItem } from '@/types/domain/savedItem';

/**
 * BizFlow's local IndexedDB database, accessed through Dexie.
 *
 * The database starts empty — no seed or demo data. All storage is
 * local; no network calls are made. Schema changes require a new
 * version() declaration with an upgrade function when needed.
 */
export class BizFlowDB extends Dexie {
  businesses!: Table<Business, EntityId>;
  inventoryItems!: Table<InventoryItem, EntityId>;
  sales!: Table<Sale, EntityId>;
  customers!: Table<Customer, EntityId>;
  businessExpenses!: Table<BusinessExpense, EntityId>;
  personalIncomes!: Table<PersonalIncome, EntityId>;
  personalExpenses!: Table<PersonalExpense, EntityId>;
  categories!: Table<Category, EntityId>;
  budgets!: Table<Budget, EntityId>;
  accounts!: Table<Account, EntityId>;
  savedItems!: Table<SavedItem, EntityId>;

  constructor(name = 'BizFlowDB') {
    super(name);

    this.version(1).stores({
      // Primary key is the domain entity `id`; indexed fields follow.
      businesses: 'id',

      inventoryItems: 'id, businessId',

      sales: 'id, businessId, customerId, date',

      customers: 'id, businessId',

      businessExpenses: 'id, businessId, categoryId, date',

      personalIncomes: 'id, categoryId, accountId, date',

      personalExpenses: 'id, categoryId, accountId, date',

      categories: 'id, scope',

      budgets: 'id, categoryId, period',

      accounts: 'id, type',
    });

    this.version(2).stores({
      savedItems: 'id, scope, kind, categoryId, businessId',
    });
  }
}

/**
 * Single shared database instance for the entire application.
 * Importing this module opens the database lazily on first access.
 */
export const db = new BizFlowDB();
