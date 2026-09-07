import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const budgetUiFiles = [
  'src/pages/BudgetsPage.tsx',
  'src/components/budgets/BudgetForm.tsx',
  'src/components/budgets/BudgetCard.tsx',
  'src/components/budgets/DeleteBudgetDialog.tsx',
];

describe('Budget UI architectural constraints', () => {
  it('Budget UI files were discovered', () => {
    expect(budgetUiFiles.length).toBe(4);
  });

  it('Budget UI does not import Dexie', () => {
    for (const file of budgetUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain("from 'dexie'");
      expect(content).not.toContain('import Dexie');
    }
  });

  it('Budget UI does not import the database directly', () => {
    for (const file of budgetUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/db');
      expect(content).not.toContain('BizFlowDB');
    }
  });

  it('Budget UI does not import concrete repositories', () => {
    const concreteRepos = [
      'DexieBudgetRepository',
      'DexieRepository',
      'DexieCategoryRepository',
      'DexieBusinessRepository',
    ];
    for (const file of budgetUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      for (const repo of concreteRepos) {
        expect(content).not.toContain(repo);
      }
    }
  });

  it('Budget UI does not import repository interfaces', () => {
    for (const file of budgetUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/types/repositories');
    }
  });

  it('Budget UI does not import services directly', () => {
    for (const file of budgetUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/services/budgets');
      expect(content).not.toContain('BudgetService');
    }
  });

  it('Budget UI does not make fetch/API/network calls', () => {
    for (const file of budgetUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('fetch(');
      expect(content).not.toContain('XMLHttpRequest');
    }
  });

  it('Budget UI does not import Supabase or Firebase', () => {
    for (const file of budgetUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@supabase');
      expect(content).not.toContain('supabase');
      expect(content).not.toContain('firebase');
    }
  });

  it('BudgetsPage uses hooks for data operations', () => {
    const content = readFileSync(resolve(process.cwd(), 'src/pages/BudgetsPage.tsx'), 'utf-8');
    expect(content).toContain('@/hooks/budgets');
    expect(content).toContain('useBudgets');
    expect(content).toContain('useCreateBudget');
    expect(content).toContain('useUpdateBudget');
    expect(content).toContain('useDeleteBudget');
  });

  it('Budget UI does not use require()', () => {
    for (const file of budgetUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toMatch(/\brequire\s*\(/);
    }
  });
});
