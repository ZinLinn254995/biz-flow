import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const businessUiFiles = [
  'src/pages/BusinessPage.tsx',
  'src/components/business/BusinessForm.tsx',
  'src/components/business/BusinessCard.tsx',
  'src/components/business/DeleteBusinessDialog.tsx',
];

describe('Business UI architectural constraints', () => {
  it('Business UI files were discovered', () => {
    expect(businessUiFiles.length).toBe(4);
  });

  it('Business UI does not import Dexie', () => {
    for (const file of businessUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain("from 'dexie'");
      expect(content).not.toContain('import Dexie');
      expect(content).not.toContain('from "dexie"');
    }
  });

  it('Business UI does not import the database directly', () => {
    for (const file of businessUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/db');
      expect(content).not.toContain('BizFlowDB');
    }
  });

  it('Business UI does not import concrete repository implementations', () => {
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
    for (const file of businessUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      for (const repo of concreteRepos) {
        expect(content).not.toContain(repo);
      }
    }
  });

  it('Business UI does not import repository interfaces', () => {
    for (const file of businessUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/types/repositories');
    }
  });

  it('Business UI does not import services directly', () => {
    for (const file of businessUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/services/business');
      expect(content).not.toContain('BusinessService');
    }
  });

  it('Business UI does not make fetch/API/network calls', () => {
    for (const file of businessUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('fetch(');
      expect(content).not.toContain('XMLHttpRequest');
      expect(content).not.toContain('WebSocket');
    }
  });

  it('Business UI does not import Supabase or Firebase', () => {
    for (const file of businessUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@supabase');
      expect(content).not.toContain('supabase');
      expect(content).not.toContain('firebase');
    }
  });

  it('BusinessPage uses hooks for data operations', () => {
    const content = readFileSync(resolve(process.cwd(), 'src/pages/BusinessPage.tsx'), 'utf-8');
    expect(content).toContain('@/hooks/business');
    expect(content).toContain('useBusinesses');
    expect(content).toContain('useCreateBusiness');
    expect(content).toContain('useUpdateBusiness');
    expect(content).toContain('useDeleteBusiness');
  });

  it('Business UI does not use require()', () => {
    for (const file of businessUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toMatch(/\brequire\s*\(/);
    }
  });
});
