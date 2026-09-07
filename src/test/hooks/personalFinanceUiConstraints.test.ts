import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const personalFinanceUiFiles = [
  'src/pages/PersonalFinancePage.tsx',
  'src/components/personalFinance/PersonalIncomeForm.tsx',
  'src/components/personalFinance/PersonalIncomeCard.tsx',
  'src/components/personalFinance/DeletePersonalIncomeDialog.tsx',
  'src/components/personalFinance/PersonalExpenseForm.tsx',
  'src/components/personalFinance/PersonalExpenseCard.tsx',
  'src/components/personalFinance/DeletePersonalExpenseDialog.tsx',
];

describe('Personal Finance UI architectural constraints', () => {
  it('Personal Finance UI files were discovered', () => {
    expect(personalFinanceUiFiles.length).toBe(7);
  });

  it('Personal Finance UI does not import Dexie', () => {
    for (const file of personalFinanceUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain("from 'dexie'");
      expect(content).not.toContain('import Dexie');
      expect(content).not.toContain('from "dexie"');
    }
  });

  it('Personal Finance UI does not import the database directly', () => {
    for (const file of personalFinanceUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/db');
      expect(content).not.toContain('BizFlowDB');
    }
  });

  it('Personal Finance UI does not import concrete repository implementations', () => {
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
    for (const file of personalFinanceUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      for (const repo of concreteRepos) {
        expect(content).not.toContain(repo);
      }
    }
  });

  it('Personal Finance UI does not import repository interfaces', () => {
    for (const file of personalFinanceUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/types/repositories');
    }
  });

  it('Personal Finance UI does not import services directly', () => {
    for (const file of personalFinanceUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/services/personalFinance');
      expect(content).not.toContain('PersonalIncomeService');
      expect(content).not.toContain('PersonalExpenseService');
    }
  });

  it('Personal Finance UI does not make fetch/API/network calls', () => {
    for (const file of personalFinanceUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('fetch(');
      expect(content).not.toContain('XMLHttpRequest');
      expect(content).not.toContain('WebSocket');
    }
  });

  it('Personal Finance UI does not import Supabase or Firebase', () => {
    for (const file of personalFinanceUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@supabase');
      expect(content).not.toContain('supabase');
      expect(content).not.toContain('firebase');
    }
  });

  it('PersonalFinancePage uses hooks for data operations', () => {
    const content = readFileSync(resolve(process.cwd(), 'src/pages/PersonalFinancePage.tsx'), 'utf-8');
    expect(content).toContain('@/hooks/personalFinance');
    expect(content).toContain('usePersonalIncomeRecords');
    expect(content).toContain('usePersonalExpenses');
    expect(content).toContain('useCreatePersonalIncome');
    expect(content).toContain('useUpdatePersonalIncome');
    expect(content).toContain('useDeletePersonalIncome');
    expect(content).toContain('useCreatePersonalExpense');
    expect(content).toContain('useUpdatePersonalExpense');
    expect(content).toContain('useDeletePersonalExpense');
  });

  it('Personal Finance UI does not use require()', () => {
    for (const file of personalFinanceUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toMatch(/\brequire\s*\(/);
    }
  });
});
