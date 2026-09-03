import { describe, it, expect, afterEach } from 'vitest';
import { createTestContext } from '@/test/helpers';

const ctx = createTestContext();

afterEach(async () => {
  await ctx.db.transaction(
    'rw',
    [ctx.db.personalIncomes, ctx.db.personalExpenses, ctx.db.accounts, ctx.db.categories],
    async () => {
      await ctx.db.personalIncomes.clear();
      await ctx.db.personalExpenses.clear();
      await ctx.db.accounts.clear();
      await ctx.db.categories.clear();
    },
  );
});

describe('DexiePersonalIncomeRepository', () => {
  it('creates and retrieves a personal income record', async () => {
    const income = await ctx.personalIncomeRepository.create({
      source: 'Freelance',
      date: '2026-01-15T00:00:00.000Z',
      amount: { amountMinor: 50000, currency: 'THB' },
    });

    expect(income.id).toBeTruthy();
    expect(income.source).toBe('Freelance');

    const retrieved = await ctx.personalIncomeRepository.getById(income.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.amount.amountMinor).toBe(50000);
  });

  it('preserves categoryId and accountId references', async () => {
    const category = await ctx.categoryRepository.create({
      name: 'Freelance Income',
      scope: 'personal',
      direction: 'income',
    });
    const account = await ctx.accountRepository.create({
      name: 'Bank Account',
      type: 'bank',
      balance: { amountMinor: 0, currency: 'THB' },
    });

    const income = await ctx.personalIncomeRepository.create({
      source: 'Freelance',
      date: '2026-01-15T00:00:00.000Z',
      amount: { amountMinor: 50000, currency: 'THB' },
      categoryId: category.id,
      accountId: account.id,
    });

    const retrieved = await ctx.personalIncomeRepository.getById(income.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.categoryId).toBe(category.id);
    expect(retrieved!.accountId).toBe(account.id);
  });

  it('updates and removes records', async () => {
    const income = await ctx.personalIncomeRepository.create({
      source: 'Salary',
      date: '2026-01-15T00:00:00.000Z',
      amount: { amountMinor: 30000, currency: 'THB' },
    });

    const updated = await ctx.personalIncomeRepository.update(income.id, {
      source: 'Bonus',
    });
    expect(updated.source).toBe('Bonus');

    await ctx.personalIncomeRepository.remove(income.id);
    const after = await ctx.personalIncomeRepository.getById(income.id);
    expect(after).toBeNull();
  });

  it('getAll returns all records', async () => {
    await ctx.personalIncomeRepository.create({
      source: 'A',
      date: '2026-01-01T00:00:00.000Z',
      amount: { amountMinor: 100, currency: 'THB' },
    });
    await ctx.personalIncomeRepository.create({
      source: 'B',
      date: '2026-01-02T00:00:00.000Z',
      amount: { amountMinor: 200, currency: 'THB' },
    });

    const all = await ctx.personalIncomeRepository.getAll();
    expect(all).toHaveLength(2);
  });
});

describe('DexiePersonalExpenseRepository', () => {
  it('creates and retrieves a personal expense record', async () => {
    const expense = await ctx.personalExpenseRepository.create({
      title: 'Groceries',
      date: '2026-01-15T00:00:00.000Z',
      amount: { amountMinor: 1500, currency: 'THB' },
    });

    expect(expense.id).toBeTruthy();
    expect(expense.title).toBe('Groceries');

    const retrieved = await ctx.personalExpenseRepository.getById(expense.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.amount.amountMinor).toBe(1500);
  });

  it('preserves categoryId and accountId references', async () => {
    const category = await ctx.categoryRepository.create({
      name: 'Groceries',
      scope: 'personal',
      direction: 'expense',
    });
    const account = await ctx.accountRepository.create({
      name: 'Wallet',
      type: 'wallet',
      balance: { amountMinor: 0, currency: 'THB' },
    });

    const expense = await ctx.personalExpenseRepository.create({
      title: 'Groceries',
      date: '2026-01-15T00:00:00.000Z',
      amount: { amountMinor: 1500, currency: 'THB' },
      categoryId: category.id,
      accountId: account.id,
    });

    const retrieved = await ctx.personalExpenseRepository.getById(expense.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.categoryId).toBe(category.id);
    expect(retrieved!.accountId).toBe(account.id);
  });

  it('updates and removes records', async () => {
    const expense = await ctx.personalExpenseRepository.create({
      title: 'Rent',
      date: '2026-01-01T00:00:00.000Z',
      amount: { amountMinor: 8000, currency: 'THB' },
    });

    const updated = await ctx.personalExpenseRepository.update(expense.id, {
      title: 'Utilities',
    });
    expect(updated.title).toBe('Utilities');

    await ctx.personalExpenseRepository.remove(expense.id);
    const after = await ctx.personalExpenseRepository.getById(expense.id);
    expect(after).toBeNull();
  });

  it('getAll returns all records', async () => {
    await ctx.personalExpenseRepository.create({
      title: 'A',
      date: '2026-01-01T00:00:00.000Z',
      amount: { amountMinor: 100, currency: 'THB' },
    });
    await ctx.personalExpenseRepository.create({
      title: 'B',
      date: '2026-01-02T00:00:00.000Z',
      amount: { amountMinor: 200, currency: 'THB' },
    });

    const all = await ctx.personalExpenseRepository.getAll();
    expect(all).toHaveLength(2);
  });
});
