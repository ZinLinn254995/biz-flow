import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const customerUiFiles = [
  'src/pages/CustomersPage.tsx',
  'src/components/customers/CustomerForm.tsx',
  'src/components/customers/CustomerCard.tsx',
  'src/components/customers/DeleteCustomerDialog.tsx',
];

describe('Customer UI architectural constraints', () => {
  it('Customer UI files were discovered', () => {
    expect(customerUiFiles.length).toBe(4);
  });

  it('Customer UI does not import Dexie', () => {
    for (const file of customerUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain("from 'dexie'");
      expect(content).not.toContain('import Dexie');
      expect(content).not.toContain('from "dexie"');
    }
  });

  it('Customer UI does not import the database directly', () => {
    for (const file of customerUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/db');
      expect(content).not.toContain('BizFlowDB');
    }
  });

  it('Customer UI does not import concrete repository implementations', () => {
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
    for (const file of customerUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      for (const repo of concreteRepos) {
        expect(content).not.toContain(repo);
      }
    }
  });

  it('Customer UI does not import repository interfaces', () => {
    for (const file of customerUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/types/repositories');
    }
  });

  it('Customer UI does not import services directly', () => {
    for (const file of customerUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/services/customers');
      expect(content).not.toContain('CustomerService');
    }
  });

  it('Customer UI does not make fetch/API/network calls', () => {
    for (const file of customerUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('fetch(');
      expect(content).not.toContain('XMLHttpRequest');
      expect(content).not.toContain('WebSocket');
    }
  });

  it('Customer UI does not import Supabase or Firebase', () => {
    for (const file of customerUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@supabase');
      expect(content).not.toContain('supabase');
      expect(content).not.toContain('firebase');
    }
  });

  it('CustomersPage uses hooks for data operations', () => {
    const content = readFileSync(resolve(process.cwd(), 'src/pages/CustomersPage.tsx'), 'utf-8');
    expect(content).toContain('@/hooks/customers');
    expect(content).toContain('useCustomers');
    expect(content).toContain('useCreateCustomer');
    expect(content).toContain('useUpdateCustomer');
    expect(content).toContain('useDeleteCustomer');
  });

  it('Customer UI does not use require()', () => {
    for (const file of customerUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toMatch(/\brequire\s*\(/);
    }
  });
});
