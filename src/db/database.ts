import Dexie, { type Table } from 'dexie';
import type { EntityId } from '@/types/common/base';
import type { Business } from '@/types/domain/business';
import type { InventoryItem } from '@/types/domain/inventory';
import type { Sale } from '@/types/domain/sale';
import type { Purchase } from '@/types/domain/purchase';
import type { Customer } from '@/types/domain/customer';
import type { BusinessExpense } from '@/types/domain/businessExpense';
import type { PersonalIncome, PersonalExpense } from '@/types/domain/personalFinance';
import type { Category } from '@/types/domain/category';
import type { Budget } from '@/types/domain/budget';
import type { Account } from '@/types/domain/account';
import type { SavedItem } from '@/types/domain/savedItem';
import type { StockMovement } from '@/types/domain/stockMovement';

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
  purchases!: Table<Purchase, EntityId>;
  customers!: Table<Customer, EntityId>;
  businessExpenses!: Table<BusinessExpense, EntityId>;
  personalIncomes!: Table<PersonalIncome, EntityId>;
  personalExpenses!: Table<PersonalExpense, EntityId>;
  categories!: Table<Category, EntityId>;
  budgets!: Table<Budget, EntityId>;
  accounts!: Table<Account, EntityId>;
  savedItems!: Table<SavedItem, EntityId>;
  stockMovements!: Table<StockMovement, EntityId>;

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

    this.version(3).stores({
      purchases: 'id, businessId, date',
      stockMovements: 'id, inventoryItemId, operationId, kind, createdAt',
    }).upgrade(async (tx) => {
      const items = await tx.table('inventoryItems').toArray() as InventoryItem[];
      const existing = await tx.table('stockMovements').count();
      if (existing > 0) return;
      const now = new Date().toISOString();
      await tx.table('stockMovements').bulkAdd(items.map((item) => ({
        id: `opening-${item.id}`,
        inventoryItemId: item.id,
        delta: item.quantity,
        kind: 'opening',
        operationId: 'migration-p5-7-v1',
        provenance: 'migration-baseline',
        createdAt: now,
        updatedAt: now,
      })));
    });
  }
}

/**
 * Single shared database instance for the entire application.
 * Importing this module opens the database lazily on first access.
 */
export const db = new BizFlowDB();
