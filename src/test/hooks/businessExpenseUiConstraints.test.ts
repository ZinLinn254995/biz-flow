import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const expenseUiFiles = [
  'src/pages/BusinessExpensesPage.tsx',
  'src/components/businessExpenses/BusinessExpenseForm.tsx',
  'src/components/businessExpenses/BusinessExpenseCard.tsx',
  'src/components/businessExpenses/DeleteBusinessExpenseDialog.tsx',
];

describe('Business Expense UI architectural constraints', () => {
  it('Business Expense UI files were discovered', () => {
    expect(expenseUiFiles.length).toBe(4);
  });

  it('Business Expense UI does not import Dexie', () => {
    for (const file of expenseUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain("from 'dexie'");
      expect(content).not.toContain('import Dexie');
      expect(content).not.toContain('from "dexie"');
    }
  });

  it('Business Expense UI does not import the database directly', () => {
    for (const file of expenseUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/db');
      expect(content).not.toContain('BizFlowDB');
    }
  });

  it('Business Expense UI does not import concrete repository implementations', () => {
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
    for (const file of expenseUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      for (const repo of concreteRepos) {
        expect(content).not.toContain(repo);
      }
    }
  });

  it('Business Expense UI does not import repository interfaces', () => {
    for (const file of expenseUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/types/repositories');
    }
  });

  it('Business Expense UI does not import services directly', () => {
    for (const file of expenseUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/services/businessExpenses');
      expect(content).not.toContain('BusinessExpenseService');
    }
  });

  it('Business Expense UI does not make fetch/API/network calls', () => {
    for (const file of expenseUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('fetch(');
      expect(content).not.toContain('XMLHttpRequest');
      expect(content).not.toContain('WebSocket');
    }
  });

  it('Business Expense UI does not import Supabase or Firebase', () => {
    for (const file of expenseUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@supabase');
      expect(content).not.toContain('supabase');
      expect(content).not.toContain('firebase');
    }
  });

  it('BusinessExpensesPage uses hooks for data operations', () => {
    const content = readFileSync(resolve(process.cwd(), 'src/pages/BusinessExpensesPage.tsx'), 'utf-8');
    expect(content).toContain('@/hooks/businessExpenses');
    expect(content).toContain('useBusinessExpenses');
    expect(content).toContain('useCreateBusinessExpense');
    expect(content).toContain('useUpdateBusinessExpense');
    expect(content).toContain('useDeleteBusinessExpense');
  });

  it('Business Expense UI does not use require()', () => {
    for (const file of expenseUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toMatch(/\brequire\s*\(/);
    }
  });
});
