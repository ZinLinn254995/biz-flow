import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const accountUiFiles = [
  'src/pages/AccountsPage.tsx',
  'src/components/accounts/AccountForm.tsx',
  'src/components/accounts/AccountCard.tsx',
  'src/components/accounts/DeleteAccountDialog.tsx',
];

describe('Account UI architectural constraints', () => {
  it('Account UI files were discovered', () => {
    expect(accountUiFiles.length).toBe(4);
  });

  it('Account UI does not import Dexie', () => {
    for (const file of accountUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain("from 'dexie'");
      expect(content).not.toContain('import Dexie');
    }
  });

  it('Account UI does not import the database directly', () => {
    for (const file of accountUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/db');
      expect(content).not.toContain('BizFlowDB');
    }
  });

  it('Account UI does not import concrete repositories', () => {
    const concreteRepos = [
      'DexieAccountRepository',
      'DexieRepository',
      'DexieBusinessRepository',
      'DexieCategoryRepository',
    ];
    for (const file of accountUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      for (const repo of concreteRepos) {
        expect(content).not.toContain(repo);
      }
    }
  });

  it('Account UI does not import repository interfaces', () => {
    for (const file of accountUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/types/repositories');
    }
  });

  it('Account UI does not import services directly', () => {
    for (const file of accountUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@/services/accounts');
      expect(content).not.toContain('AccountService');
    }
  });

  it('Account UI does not make fetch/API/network calls', () => {
    for (const file of accountUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('fetch(');
      expect(content).not.toContain('XMLHttpRequest');
    }
  });

  it('Account UI does not import Supabase or Firebase', () => {
    for (const file of accountUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toContain('@supabase');
      expect(content).not.toContain('supabase');
      expect(content).not.toContain('firebase');
    }
  });

  it('AccountsPage uses hooks for data operations', () => {
    const content = readFileSync(resolve(process.cwd(), 'src/pages/AccountsPage.tsx'), 'utf-8');
    expect(content).toContain('@/hooks/accounts');
    expect(content).toContain('useAccounts');
    expect(content).toContain('useCreateAccount');
    expect(content).toContain('useUpdateAccount');
    expect(content).toContain('useDeleteAccount');
  });

  it('Account UI does not use require()', () => {
    for (const file of accountUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toMatch(/\brequire\s*\(/);
    }
  });
});
