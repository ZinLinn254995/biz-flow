import { afterEach, describe, expect, it } from 'vitest';
import { createTestContext } from '@/test/helpers';
import type { EntityId } from '@/types/common/base';

const ctx = createTestContext();

const businessInput = { name: 'Cascade Shop', currency: 'USD' };

async function clearAll() {
  await ctx.db.businesses.clear();
  await ctx.db.inventoryItems.clear();
  await ctx.db.sales.clear();
  await ctx.db.customers.clear();
  await ctx.db.businessExpenses.clear();
  await ctx.db.personalIncomes.clear();
  await ctx.db.personalExpenses.clear();
}

afterEach(clearAll);

describe('business cascade deletion', () => {
  it('deletes business-owned records while preserving another business and personal records', async () => {
    const target = await ctx.businessRepository.create(businessInput);
    const other = await ctx.businessRepository.create({ name: 'Keep Shop', currency: 'USD' });

    await ctx.inventoryRepository.create({ businessId: target.id, name: 'Target Item', quantity: 1, unit: 'each', costPrice: { amountMinor: 100, currency: 'USD' }, salePrice: { amountMinor: 200, currency: 'USD' }, reorderThreshold: 1, stockStatus: 'in_stock' });
    await ctx.customerRepository.create({ businessId: target.id, name: 'Target Customer' });
    await ctx.businessExpenseRepository.create({ businessId: target.id, amount: { amountMinor: 500, currency: 'USD' }, title: 'Supplies', date: '2026-01-01', notes: 'Target expense' });
    await ctx.inventoryRepository.create({ businessId: other.id, name: 'Other Item', quantity: 1, unit: 'each', costPrice: { amountMinor: 100, currency: 'USD' }, salePrice: { amountMinor: 200, currency: 'USD' }, reorderThreshold: 1, stockStatus: 'in_stock' });
    await ctx.personalIncomeRepository.create({ amount: { amountMinor: 1000, currency: 'USD' }, source: 'Personal', date: '2026-01-01' });

    await ctx.businessRepository.removeCascade(target.id);

    expect(await ctx.businessRepository.getById(target.id)).toBeNull();
    expect(await ctx.inventoryRepository.getByBusinessId(target.id)).toEqual([]);
    expect(await ctx.customerRepository.getByBusinessId(target.id)).toEqual([]);
    expect(await ctx.businessExpenseRepository.getByBusinessId(target.id)).toEqual([]);
    expect(await ctx.businessRepository.getById(other.id)).not.toBeNull();
    expect(await ctx.inventoryRepository.getByBusinessId(other.id)).toHaveLength(1);
    expect(await ctx.personalIncomeRepository.getAll()).toHaveLength(1);
  });

  it('does nothing for a missing business ID', async () => {
    await expect(ctx.businessRepository.removeCascade('missing-business' as EntityId)).resolves.toBeUndefined();
    expect(await ctx.businessRepository.getAll()).toEqual([]);
  });
});
