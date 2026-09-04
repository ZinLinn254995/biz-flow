import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const salesUiFiles = [
  'src/pages/SalesPage.tsx',
  'src/components/sales/SaleForm.tsx',
  'src/components/sales/SaleCard.tsx',
  'src/components/sales/DeleteSaleDialog.tsx',
];

describe('Sales UI architectural constraints', () => {
  it('Sales UI files were discovered', () => {
    expect(salesUiFiles.length).toBe(4);
  });

  it('Sales UI does not import Dexie', () => {
    for (const file of salesUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain("from 'dexie'");
      expect(content).not.toContain('import Dexie');
      expect(content).not.toContain('from "dexie"');
    }
  });

  it('Sales UI does not import the database directly', () => {
    for (const file of salesUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/db');
      expect(content).not.toContain('BizFlowDB');
    }
  });

  it('Sales UI does not import concrete repository implementations', () => {
    const concreteRepos = [
      'DexieBusinessRepository',
      'DexieInventoryRepository',
      'DexieSaleRepository',
      'DexieCustomerRepository',
      'DexieBusinessExpenseRepository',
      'DexiePersonalIncomeRepository',
      'DexiePersonalExpenseRepository',
      'DexieCategoryRepository',
      'DexieBudgetRepository',
      'DexieAccountRepository',
      'DexieRepository',
    ];
    for (const file of salesUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      for (const repo of concreteRepos) {
        expect(content).not.toContain(repo);
      }
    }
  });

  it('Sales UI does not import repository interfaces', () => {
    for (const file of salesUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/types/repositories');
    }
  });

  it('Sales UI does not import services directly', () => {
    for (const file of salesUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/services/sales');
      expect(content).not.toContain('SalesService');
    }
  });

  it('Sales UI does not make fetch/API/network calls', () => {
    for (const file of salesUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('fetch(');
      expect(content).not.toContain('XMLHttpRequest');
      expect(content).not.toContain('WebSocket');
    }
  });

  it('Sales UI does not import Supabase or Firebase', () => {
    for (const file of salesUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@supabase');
      expect(content).not.toContain('supabase');
      expect(content).not.toContain('firebase');
    }
  });

  it('SalesPage uses hooks for data operations', () => {
    const content = readFileSync(resolve(process.cwd(), 'src/pages/SalesPage.tsx'), 'utf-8');
    expect(content).toContain('@/hooks/sales');
    expect(content).toContain('useSales');
    expect(content).toContain('useCreateSale');
    expect(content).toContain('useUpdateSale');
    expect(content).toContain('useDeleteSale');
  });

  it('Sales UI does not use require()', () => {
    for (const file of salesUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toMatch(/\brequire\s*\(/);
    }
  });
});
