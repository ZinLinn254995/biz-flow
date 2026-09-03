import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { globSync } from 'node:fs';

const hookFiles = globSync('src/hooks/**/*.ts').concat(globSync('src/hooks/**/*.tsx'));

describe('Hook layer architectural constraints', () => {
  it('hook files were discovered', () => {
    expect(hookFiles.length).toBeGreaterThan(0);
  });

  it('hooks do not import Dexie', () => {
    for (const file of hookFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain("from 'dexie'");
      expect(content).not.toContain('import Dexie');
      expect(content).not.toContain('from "dexie"');
    }
  });

  it('hooks do not import the database directly', () => {
    for (const file of hookFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/db');
      expect(content).not.toContain('BizFlowDB');
    }
  });

  it('hooks do not import concrete repository implementations', () => {
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
    for (const file of hookFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      for (const repo of concreteRepos) {
        expect(content).not.toContain(repo);
      }
    }
  });

  it('hooks do not import repository interfaces directly', () => {
    for (const file of hookFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/types/repositories');
    }
  });

  it('hooks do not make fetch/API/network calls', () => {
    for (const file of hookFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('fetch(');
      expect(content).not.toContain('XMLHttpRequest');
      expect(content).not.toContain('WebSocket');
    }
  });

  it('hooks do not import Supabase or Firebase', () => {
    for (const file of hookFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@supabase');
      expect(content).not.toContain('supabase');
      expect(content).not.toContain('firebase');
    }
  });

  it('hooks depend on the service layer', () => {
    const domainHookFiles = hookFiles.filter(
      (f) =>
        !f.endsWith('index.ts') &&
        (
          f.includes('/business/') ||
          f.includes('/inventory/') ||
          f.includes('/sales/') ||
          f.includes('/customers/') ||
          f.includes('/businessExpenses/') ||
          f.includes('/personalFinance/') ||
          f.includes('/categories/') ||
          f.includes('/budgets/') ||
          f.includes('/accounts/')
        ),
    );
    expect(domainHookFiles.length).toBeGreaterThan(0);
    for (const file of domainHookFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).toContain('@/hooks/common');
      expect(content).toContain('useServiceContainer');
    }
  });

  it('hooks do not use require()', () => {
    for (const file of hookFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toMatch(/\brequire\s*\(/);
    }
  });
});
