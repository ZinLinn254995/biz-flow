import { describe, it, expect, vi } from 'vitest';
import { CategoryService } from '@/services/categories/CategoryService';
import { BudgetService } from '@/services/budgets/BudgetService';
import { AccountService } from '@/services/accounts/AccountService';
import { ValidationError } from '@/services/common/errors';
import type { CategoryRepository } from '@/types/repositories/categoryRepository';
import type { BudgetRepository } from '@/types/repositories/budgetRepository';
import type { AccountRepository } from '@/types/repositories/accountRepository';
import type { EntityId } from '@/types/common/base';

function createMockCategoryRepo(): CategoryRepository {
  return {
    getById: vi.fn(),
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    getByScope: vi.fn(),
  };
}

function createMockBudgetRepo(): BudgetRepository {
  return {
    getById: vi.fn(),
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
}

function createMockAccountRepo(): AccountRepository {
  return {
    getById: vi.fn(),
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
}

describe('CategoryService', () => {
  it('createCategory validates and trims', async () => {
    const repo = createMockCategoryRepo();
    (repo.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'x' as EntityId, createdAt: '', updatedAt: '', name: 'Food', scope: 'personal' });
    const service = new CategoryService(repo);

    await service.createCategory({ name: '  Food  ', scope: 'personal' });
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Food', scope: 'personal' }));
  });

  it('createCategory rejects empty name', async () => {
    const repo = createMockCategoryRepo();
    const service = new CategoryService(repo);

    await expect(service.createCategory({ name: '', scope: 'business' })).rejects.toThrow(ValidationError);
  });

  it('getCategoriesByScope delegates to repository getByScope', async () => {
    const repo = createMockCategoryRepo();
    (repo.getByScope as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const service = new CategoryService(repo);

    await service.getCategoriesByScope('business');
    expect(repo.getByScope).toHaveBeenCalledWith('business');
  });

  it('repository errors propagate', async () => {
    const repo = createMockCategoryRepo();
    (repo.getByScope as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB error'));
    const service = new CategoryService(repo);

    await expect(service.getCategoriesByScope('business')).rejects.toThrow('DB error');
  });
});

describe('BudgetService', () => {
  const validInput = {
    categoryId: 'cat-1' as EntityId,
    limit: { amountMinor: 50000, currency: 'THB' },
    period: 'monthly' as const,
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2026-01-31T23:59:59.000Z',
  };

  it('createBudget validates and delegates', async () => {
    const repo = createMockBudgetRepo();
    (repo.create as ReturnType<typeof vi.fn>).mockResolvedValue({ ...validInput, id: 'x' as EntityId, createdAt: '', updatedAt: '' });
    const service = new BudgetService(repo);

    await service.createBudget(validInput);
    expect(repo.create).toHaveBeenCalled();
  });

  it('createBudget rejects empty categoryId', async () => {
    const repo = createMockBudgetRepo();
    const service = new BudgetService(repo);

    await expect(service.createBudget({ ...validInput, categoryId: '' as EntityId })).rejects.toThrow(ValidationError);
  });

  it('createBudget rejects negative limit', async () => {
    const repo = createMockBudgetRepo();
    const service = new BudgetService(repo);

    await expect(service.createBudget({ ...validInput, limit: { amountMinor: -1, currency: 'THB' } })).rejects.toThrow(ValidationError);
  });

  it('repository errors propagate', async () => {
    const repo = createMockBudgetRepo();
    (repo.getAll as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB error'));
    const service = new BudgetService(repo);

    await expect(service.getAllBudgets()).rejects.toThrow('DB error');
  });
});

describe('AccountService', () => {
  const validInput = {
    name: 'Cash Wallet',
    type: 'cash' as const,
    balance: { amountMinor: 5000, currency: 'THB' },
  };

  it('createAccount validates and delegates', async () => {
    const repo = createMockAccountRepo();
    (repo.create as ReturnType<typeof vi.fn>).mockResolvedValue({ ...validInput, id: 'x' as EntityId, createdAt: '', updatedAt: '' });
    const service = new AccountService(repo);

    await service.createAccount(validInput);
    expect(repo.create).toHaveBeenCalled();
  });

  it('createAccount rejects empty name', async () => {
    const repo = createMockAccountRepo();
    const service = new AccountService(repo);

    await expect(service.createAccount({ ...validInput, name: '' })).rejects.toThrow(ValidationError);
  });

  it('createAccount rejects negative balance', async () => {
    const repo = createMockAccountRepo();
    const service = new AccountService(repo);

    await expect(service.createAccount({ ...validInput, balance: { amountMinor: -1, currency: 'THB' } })).rejects.toThrow(ValidationError);
  });

  it('repository errors propagate', async () => {
    const repo = createMockAccountRepo();
    (repo.remove as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB error'));
    const service = new AccountService(repo);

    await expect(service.deleteAccount('x' as EntityId)).rejects.toThrow('DB error');
  });
});
