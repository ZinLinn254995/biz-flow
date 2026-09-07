import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const categoryUiFiles = [
  'src/pages/CategoriesPage.tsx',
  'src/components/categories/CategoryForm.tsx',
  'src/components/categories/CategoryCard.tsx',
  'src/components/categories/DeleteCategoryDialog.tsx',
];

describe('Category UI architectural constraints', () => {
  it('Category UI files were discovered', () => {
    expect(categoryUiFiles.length).toBe(4);
  });

  it('Category UI does not import Dexie', () => {
    for (const file of categoryUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain("from 'dexie'");
      expect(content).not.toContain('import Dexie');
      expect(content).not.toContain('from "dexie"');
    }
  });

  it('Category UI does not import the database directly', () => {
    for (const file of categoryUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/db');
      expect(content).not.toContain('BizFlowDB');
    }
  });

  it('Category UI does not import concrete repository implementations', () => {
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
    for (const file of categoryUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      for (const repo of concreteRepos) {
        expect(content).not.toContain(repo);
      }
    }
  });

  it('Category UI does not import repository interfaces', () => {
    for (const file of categoryUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/types/repositories');
    }
  });

  it('Category UI does not import services directly', () => {
    for (const file of categoryUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/services/categories');
      expect(content).not.toContain('CategoryService');
    }
  });

  it('Category UI does not make fetch/API/network calls', () => {
    for (const file of categoryUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('fetch(');
      expect(content).not.toContain('XMLHttpRequest');
      expect(content).not.toContain('WebSocket');
    }
  });

  it('Category UI does not import Supabase or Firebase', () => {
    for (const file of categoryUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@supabase');
      expect(content).not.toContain('supabase');
      expect(content).not.toContain('firebase');
    }
  });

  it('CategoriesPage uses hooks for data operations', () => {
    const content = readFileSync(resolve(process.cwd(), 'src/pages/CategoriesPage.tsx'), 'utf-8');
    expect(content).toContain('@/hooks/categories');
    expect(content).toContain('useCategories');
    expect(content).toContain('useCreateCategory');
    expect(content).toContain('useUpdateCategory');
    expect(content).toContain('useDeleteCategory');
  });

  it('Category UI does not use require()', () => {
    for (const file of categoryUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toMatch(/\brequire\s*\(/);
    }
  });
});
