import type { Account } from '@/types/domain/account';
import type { Budget } from '@/types/domain/budget';
import type { Business } from '@/types/domain/business';
import type { BusinessExpense } from '@/types/domain/businessExpense';
import type { Category } from '@/types/domain/category';
import type { Customer } from '@/types/domain/customer';
import type { InventoryItem } from '@/types/domain/inventory';
import type { PersonalExpense, PersonalIncome } from '@/types/domain/personalFinance';
import type { Sale } from '@/types/domain/sale';
import type { SavedItem } from '@/types/domain/savedItem';

export const BACKUP_VERSION = 1 as const;

export interface BackupData {
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  data: {
    businesses: Business[];
    inventoryItems: InventoryItem[];
    sales: Sale[];
    customers: Customer[];
    businessExpenses: BusinessExpense[];
    personalIncomes: PersonalIncome[];
    personalExpenses: PersonalExpense[];
    categories: Category[];
    budgets: Budget[];
    accounts: Account[];
    savedItems?: SavedItem[];
  };
}

export interface DataBackupRepository {
  exportData(): Promise<BackupData['data']>;
  replaceData(data: BackupData['data']): Promise<void>;
}

export type BackupEntity = keyof BackupData['data'];

export const BACKUP_ENTITIES: BackupEntity[] = [
  'businesses',
  'inventoryItems',
  'sales',
  'customers',
  'businessExpenses',
  'personalIncomes',
  'personalExpenses',
  'categories',
  'budgets',
  'accounts',
  'savedItems',
];
