import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const inventoryUiFiles = [
  'src/pages/InventoryPage.tsx',
  'src/components/inventory/InventoryForm.tsx',
  'src/components/inventory/InventoryCard.tsx',
  'src/components/inventory/DeleteInventoryDialog.tsx',
];

describe('Inventory UI architectural constraints', () => {
  it('Inventory UI files were discovered', () => {
    expect(inventoryUiFiles.length).toBe(4);
  });

  it('Inventory UI does not import Dexie', () => {
    for (const file of inventoryUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain("from 'dexie'");
      expect(content).not.toContain('import Dexie');
      expect(content).not.toContain('from "dexie"');
    }
  });

  it('Inventory UI does not import the database directly', () => {
    for (const file of inventoryUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/db');
      expect(content).not.toContain('BizFlowDB');
    }
  });

  it('Inventory UI does not import concrete repository implementations', () => {
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
    for (const file of inventoryUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      for (const repo of concreteRepos) {
        expect(content).not.toContain(repo);
      }
    }
  });

  it('Inventory UI does not import repository interfaces', () => {
    for (const file of inventoryUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/types/repositories');
    }
  });

  it('Inventory UI does not import services directly', () => {
    for (const file of inventoryUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/services/inventory');
      expect(content).not.toContain('InventoryService');
    }
  });

  it('Inventory UI does not make fetch/API/network calls', () => {
    for (const file of inventoryUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('fetch(');
      expect(content).not.toContain('XMLHttpRequest');
      expect(content).not.toContain('WebSocket');
    }
  });

  it('Inventory UI does not import Supabase or Firebase', () => {
    for (const file of inventoryUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@supabase');
      expect(content).not.toContain('supabase');
      expect(content).not.toContain('firebase');
    }
  });

  it('InventoryPage uses hooks for data operations', () => {
    const content = readFileSync(resolve(process.cwd(), 'src/pages/InventoryPage.tsx'), 'utf-8');
    expect(content).toContain('@/hooks/inventory');
    expect(content).toContain('useInventoryItems');
    expect(content).toContain('useCreateInventoryItem');
    expect(content).toContain('useUpdateInventoryItem');
    expect(content).toContain('useDeleteInventoryItem');
  });

  it('Inventory UI does not use require()', () => {
    for (const file of inventoryUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toMatch(/\brequire\s*\(/);
    }
  });
});
