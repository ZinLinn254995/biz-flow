import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const serviceFiles = [
  'src/services/business/BusinessService.ts',
  'src/services/inventory/InventoryService.ts',
  'src/services/sales/SalesService.ts',
  'src/services/customers/CustomerService.ts',
  'src/services/businessExpenses/BusinessExpenseService.ts',
  'src/services/personalFinance/PersonalIncomeService.ts',
  'src/services/personalFinance/PersonalExpenseService.ts',
  'src/services/categories/CategoryService.ts',
  'src/services/budgets/BudgetService.ts',
  'src/services/accounts/AccountService.ts',
  'src/services/common/errors.ts',
  'src/services/common/validation.ts',
  'src/services/index.ts',
];

describe('Service layer architectural constraints', () => {
  it('services do not import Dexie directly', () => {
    for (const file of serviceFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain("from 'dexie'");
      expect(content).not.toContain('import Dexie');
    }
  });

  it('services do not import the database directly', () => {
    for (const file of serviceFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/db');
      expect(content).not.toContain('BizFlowDB');
    }
  });

  it('services do not import concrete repository implementations', () => {
    for (const file of serviceFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('DexieBusinessRepository');
      expect(content).not.toContain('DexieInventoryRepository');
      expect(content).not.toContain('DexieSaleRepository');
      expect(content).not.toContain('DexieCustomerRepository');
      expect(content).not.toContain('DexieBusinessExpenseRepository');
      expect(content).not.toContain('DexiePersonalIncomeRepository');
      expect(content).not.toContain('DexiePersonalExpenseRepository');
      expect(content).not.toContain('DexieCategoryRepository');
      expect(content).not.toContain('DexieBudgetRepository');
      expect(content).not.toContain('DexieAccountRepository');
    }
  });

  it('services do not contain fetch() calls', () => {
    for (const file of serviceFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('fetch(');
    }
  });

  it('services do not import Supabase or Firebase', () => {
    for (const file of serviceFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@supabase');
      expect(content).not.toContain('supabase');
      expect(content).not.toContain('firebase');
    }
  });

  it('services depend on repository interfaces', () => {
    const servicesWithRepo = [
      'src/services/business/BusinessService.ts',
      'src/services/inventory/InventoryService.ts',
      'src/services/sales/SalesService.ts',
      'src/services/customers/CustomerService.ts',
      'src/services/businessExpenses/BusinessExpenseService.ts',
      'src/services/personalFinance/PersonalIncomeService.ts',
      'src/services/personalFinance/PersonalExpenseService.ts',
      'src/services/categories/CategoryService.ts',
      'src/services/budgets/BudgetService.ts',
      'src/services/accounts/AccountService.ts',
    ];

    for (const file of servicesWithRepo) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).toContain('@/types/repositories');
    }
  });
});
