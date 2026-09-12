import { db } from '@/db';
import type { BackupData, DataBackupRepository } from '@/types/repositories/dataBackupRepository';

export class DexieDataBackupRepository implements DataBackupRepository {
  async exportData(): Promise<BackupData['data']> {
    const [businesses, inventoryItems, sales, customers, businessExpenses, personalIncomes, personalExpenses, categories, budgets, accounts, savedItems] = await Promise.all([
      db.businesses.toArray(), db.inventoryItems.toArray(), db.sales.toArray(), db.customers.toArray(),
      db.businessExpenses.toArray(), db.personalIncomes.toArray(), db.personalExpenses.toArray(),
      db.categories.toArray(), db.budgets.toArray(), db.accounts.toArray(), db.savedItems.toArray(),
    ]);
    return { businesses, inventoryItems, sales, customers, businessExpenses, personalIncomes, personalExpenses, categories, budgets, accounts, savedItems };
  }

  async replaceData(data: BackupData['data']): Promise<void> {
    await db.transaction('rw', [
      db.businesses, db.inventoryItems, db.sales, db.customers, db.businessExpenses,
      db.personalIncomes, db.personalExpenses, db.categories, db.budgets, db.accounts, db.savedItems,
    ], async () => {
      await Promise.all([
        db.businesses.clear(), db.inventoryItems.clear(), db.sales.clear(), db.customers.clear(),
        db.businessExpenses.clear(), db.personalIncomes.clear(), db.personalExpenses.clear(),
        db.categories.clear(), db.budgets.clear(), db.accounts.clear(), db.savedItems.clear(),
      ]);
      await Promise.all([
        db.businesses.bulkAdd(data.businesses), db.inventoryItems.bulkAdd(data.inventoryItems),
        db.sales.bulkAdd(data.sales), db.customers.bulkAdd(data.customers),
        db.businessExpenses.bulkAdd(data.businessExpenses), db.personalIncomes.bulkAdd(data.personalIncomes),
        db.personalExpenses.bulkAdd(data.personalExpenses), db.categories.bulkAdd(data.categories),
        db.budgets.bulkAdd(data.budgets), db.accounts.bulkAdd(data.accounts), db.savedItems.bulkAdd(data.savedItems ?? []),
      ]);
    });
  }
}
