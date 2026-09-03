import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Offline-first verification', () => {
  it('repository source does not contain fetch() calls', () => {
    const files = [
      'src/repositories/dexieRepository.ts',
      'src/repositories/dexieBusinessRepository.ts',
      'src/repositories/dexieInventoryRepository.ts',
      'src/repositories/dexieSaleRepository.ts',
      'src/repositories/dexieCustomerRepository.ts',
      'src/repositories/dexieBusinessExpenseRepository.ts',
      'src/repositories/dexiePersonalIncomeRepository.ts',
      'src/repositories/dexiePersonalExpenseRepository.ts',
      'src/repositories/dexieCategoryRepository.ts',
      'src/repositories/dexieBudgetRepository.ts',
      'src/repositories/dexieAccountRepository.ts',
      'src/db/database.ts',
    ];

    for (const file of files) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('fetch(');
    }
  });

  it('repository source does not import Supabase', () => {
    const files = [
      'src/repositories/dexieRepository.ts',
      'src/repositories/dexieBusinessRepository.ts',
      'src/repositories/dexieInventoryRepository.ts',
      'src/repositories/dexieSaleRepository.ts',
      'src/repositories/dexieCustomerRepository.ts',
      'src/repositories/dexieBusinessExpenseRepository.ts',
      'src/repositories/dexiePersonalIncomeRepository.ts',
      'src/repositories/dexiePersonalExpenseRepository.ts',
      'src/repositories/dexieCategoryRepository.ts',
      'src/repositories/dexieBudgetRepository.ts',
      'src/repositories/dexieAccountRepository.ts',
      'src/db/database.ts',
    ];

    for (const file of files) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@supabase');
      expect(content).not.toContain('supabase');
    }
  });

  it('repository source does not import Firebase', () => {
    const files = [
      'src/repositories/dexieRepository.ts',
      'src/db/database.ts',
    ];

    for (const file of files) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('firebase');
    }
  });

  it('database layer only imports from dexie and domain types', () => {
    const content = readFileSync(
      resolve(process.cwd(), 'src/db/database.ts'),
      'utf-8',
    );
    expect(content).toContain('dexie');
    expect(content).toContain('@/types');
    expect(content).not.toContain('axios');
    expect(content).not.toContain('XMLHttpRequest');
  });
});
