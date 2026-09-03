import { describe, it, expect, afterEach } from 'vitest';
import { createTestContext } from '@/test/helpers';

const ctx = createTestContext();

afterEach(async () => {
  await ctx.db.transaction(
    'rw',
    [ctx.db.budgets, ctx.db.accounts, ctx.db.categories],
    async () => {
      await ctx.db.budgets.clear();
      await ctx.db.accounts.clear();
      await ctx.db.categories.clear();
    },
  );
});

describe('DexieBudgetRepository', () => {
  it('creates and retrieves a budget', async () => {
    const category = await ctx.categoryRepository.create({
      name: 'Food',
      scope: 'personal',
      direction: 'expense',
    });

    const budget = await ctx.budgetRepository.create({
      categoryId: category.id,
      limit: { amountMinor: 50000, currency: 'THB' },
      period: 'monthly',
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-01-31T23:59:59.000Z',
    });

    expect(budget.id).toBeTruthy();
    expect(budget.period).toBe('monthly');

    const retrieved = await ctx.budgetRepository.getById(budget.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.categoryId).toBe(category.id);
    expect(retrieved!.limit.amountMinor).toBe(50000);
    expect(retrieved!.limit.currency).toBe('THB');
  });

  it('updates budget fields', async () => {
    const category = await ctx.categoryRepository.create({
      name: 'Transport',
      scope: 'personal',
      direction: 'expense',
    });

    const budget = await ctx.budgetRepository.create({
      categoryId: category.id,
      limit: { amountMinor: 10000, currency: 'THB' },
      period: 'weekly',
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-01-07T23:59:59.000Z',
    });

    const updated = await ctx.budgetRepository.update(budget.id, {
      period: 'monthly',
      limit: { amountMinor: 40000, currency: 'THB' },
    });

    expect(updated.period).toBe('monthly');
    expect(updated.limit.amountMinor).toBe(40000);
    expect(updated.id).toBe(budget.id);
    expect(updated.createdAt).toBe(budget.createdAt);
  });

  it('removes a budget', async () => {
    const category = await ctx.categoryRepository.create({
      name: 'Entertainment',
      scope: 'personal',
      direction: 'expense',
    });

    const budget = await ctx.budgetRepository.create({
      categoryId: category.id,
      limit: { amountMinor: 5000, currency: 'THB' },
      period: 'monthly',
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-01-31T23:59:59.000Z',
    });

    await ctx.budgetRepository.remove(budget.id);
    const after = await ctx.budgetRepository.getById(budget.id);
    expect(after).toBeNull();
  });

  it('getAll returns all budgets', async () => {
    const cat1 = await ctx.categoryRepository.create({
      name: 'A',
      scope: 'personal',
      direction: 'expense',
    });
    const cat2 = await ctx.categoryRepository.create({
      name: 'B',
      scope: 'personal',
      direction: 'expense',
    });

    await ctx.budgetRepository.create({
      categoryId: cat1.id,
      limit: { amountMinor: 1000, currency: 'THB' },
      period: 'monthly',
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-01-31T23:59:59.000Z',
    });
    await ctx.budgetRepository.create({
      categoryId: cat2.id,
      limit: { amountMinor: 2000, currency: 'THB' },
      period: 'weekly',
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-01-07T23:59:59.000Z',
    });

    const all = await ctx.budgetRepository.getAll();
    expect(all).toHaveLength(2);
  });
});

describe('DexieAccountRepository', () => {
  it('creates and retrieves an account', async () => {
    const account = await ctx.accountRepository.create({
      name: 'Cash Wallet',
      type: 'cash',
      balance: { amountMinor: 5000, currency: 'THB' },
    });

    expect(account.id).toBeTruthy();
    expect(account.type).toBe('cash');

    const retrieved = await ctx.accountRepository.getById(account.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.name).toBe('Cash Wallet');
    expect(retrieved!.balance.amountMinor).toBe(5000);
    expect(retrieved!.balance.currency).toBe('THB');
  });

  it('updates account fields', async () => {
    const account = await ctx.accountRepository.create({
      name: 'Bank',
      type: 'bank',
      balance: { amountMinor: 100000, currency: 'THB' },
      institution: 'KBank',
    });

    const updated = await ctx.accountRepository.update(account.id, {
      balance: { amountMinor: 90000, currency: 'THB' },
    });

    expect(updated.balance.amountMinor).toBe(90000);
    expect(updated.institution).toBe('KBank');
    expect(updated.id).toBe(account.id);
  });

  it('removes an account', async () => {
    const account = await ctx.accountRepository.create({
      name: 'Wallet',
      type: 'wallet',
      balance: { amountMinor: 0, currency: 'THB' },
    });

    await ctx.accountRepository.remove(account.id);
    const after = await ctx.accountRepository.getById(account.id);
    expect(after).toBeNull();
  });

  it('getAll returns all accounts', async () => {
    await ctx.accountRepository.create({
      name: 'Cash',
      type: 'cash',
      balance: { amountMinor: 100, currency: 'THB' },
    });
    await ctx.accountRepository.create({
      name: 'Bank',
      type: 'bank',
      balance: { amountMinor: 200, currency: 'THB' },
    });
    await ctx.accountRepository.create({
      name: 'Wallet',
      type: 'wallet',
      balance: { amountMinor: 300, currency: 'THB' },
    });

    const all = await ctx.accountRepository.getAll();
    expect(all).toHaveLength(3);
  });
});
