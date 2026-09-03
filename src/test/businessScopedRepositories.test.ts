import { describe, it, expect, afterEach } from 'vitest';
import { createTestContext } from '@/test/helpers';
import type { EntityId } from '@/types/common/base';

const ctx = createTestContext();

afterEach(async () => {
  await ctx.db.transaction(
    'rw',
    [ctx.db.inventoryItems, ctx.db.sales, ctx.db.customers, ctx.db.businessExpenses, ctx.db.businesses],
    async () => {
      await ctx.db.inventoryItems.clear();
      await ctx.db.sales.clear();
      await ctx.db.customers.clear();
      await ctx.db.businessExpenses.clear();
      await ctx.db.businesses.clear();
    },
  );
});

describe('Business-scoped repositories — getByBusinessId', () => {
  it('InventoryRepository returns only items for the given business', async () => {
    const businessA = await ctx.businessRepository.create({
      name: 'Business A',
      currency: 'USD',
    });
    const businessB = await ctx.businessRepository.create({
      name: 'Business B',
      currency: 'USD',
    });

    await ctx.inventoryRepository.create({
      businessId: businessA.id,
      name: 'Item A1',
      unit: 'pcs',
      quantity: 10,
      costPrice: { amountMinor: 500, currency: 'USD' },
      salePrice: { amountMinor: 1000, currency: 'USD' },
      stockStatus: 'in_stock',
    });
    await ctx.inventoryRepository.create({
      businessId: businessA.id,
      name: 'Item A2',
      unit: 'pcs',
      quantity: 5,
      costPrice: { amountMinor: 300, currency: 'USD' },
      salePrice: { amountMinor: 600, currency: 'USD' },
      stockStatus: 'low_stock',
    });
    await ctx.inventoryRepository.create({
      businessId: businessB.id,
      name: 'Item B1',
      unit: 'pcs',
      quantity: 20,
      costPrice: { amountMinor: 100, currency: 'USD' },
      salePrice: { amountMinor: 200, currency: 'USD' },
      stockStatus: 'in_stock',
    });

    const itemsA = await ctx.inventoryRepository.getByBusinessId(businessA.id);
    expect(itemsA).toHaveLength(2);
    expect(itemsA.every((i) => i.businessId === businessA.id)).toBe(true);

    const itemsB = await ctx.inventoryRepository.getByBusinessId(businessB.id);
    expect(itemsB).toHaveLength(1);
    expect(itemsB[0].businessId).toBe(businessB.id);
  });

  it('SaleRepository returns only sales for the given business', async () => {
    const businessA = await ctx.businessRepository.create({
      name: 'Business A',
      currency: 'USD',
    });
    const businessB = await ctx.businessRepository.create({
      name: 'Business B',
      currency: 'USD',
    });

    await ctx.saleRepository.create({
      businessId: businessA.id,
      date: '2026-01-01T00:00:00.000Z',
      items: [],
      totalAmount: { amountMinor: 1000, currency: 'USD' },
      paymentStatus: 'paid',
    });
    await ctx.saleRepository.create({
      businessId: businessB.id,
      date: '2026-01-02T00:00:00.000Z',
      items: [],
      totalAmount: { amountMinor: 2000, currency: 'USD' },
      paymentStatus: 'pending',
    });

    const salesA = await ctx.saleRepository.getByBusinessId(businessA.id);
    expect(salesA).toHaveLength(1);
    expect(salesA[0].businessId).toBe(businessA.id);

    const salesB = await ctx.saleRepository.getByBusinessId(businessB.id);
    expect(salesB).toHaveLength(1);
    expect(salesB[0].businessId).toBe(businessB.id);
  });

  it('CustomerRepository returns only customers for the given business', async () => {
    const businessA = await ctx.businessRepository.create({
      name: 'Business A',
      currency: 'USD',
    });
    const businessB = await ctx.businessRepository.create({
      name: 'Business B',
      currency: 'USD',
    });

    await ctx.customerRepository.create({
      businessId: businessA.id,
      name: 'Customer A1',
    });
    await ctx.customerRepository.create({
      businessId: businessA.id,
      name: 'Customer A2',
    });
    await ctx.customerRepository.create({
      businessId: businessB.id,
      name: 'Customer B1',
    });

    const customersA = await ctx.customerRepository.getByBusinessId(businessA.id);
    expect(customersA).toHaveLength(2);
    expect(customersA.every((c) => c.businessId === businessA.id)).toBe(true);

    const customersB = await ctx.customerRepository.getByBusinessId(businessB.id);
    expect(customersB).toHaveLength(1);
  });

  it('BusinessExpenseRepository returns only expenses for the given business', async () => {
    const businessA = await ctx.businessRepository.create({
      name: 'Business A',
      currency: 'USD',
    });
    const businessB = await ctx.businessRepository.create({
      name: 'Business B',
      currency: 'USD',
    });

    await ctx.businessExpenseRepository.create({
      businessId: businessA.id,
      title: 'Rent',
      date: '2026-01-01T00:00:00.000Z',
      amount: { amountMinor: 5000, currency: 'USD' },
    });
    await ctx.businessExpenseRepository.create({
      businessId: businessB.id,
      title: 'Supplies',
      date: '2026-01-02T00:00:00.000Z',
      amount: { amountMinor: 1500, currency: 'USD' },
    });

    const expensesA = await ctx.businessExpenseRepository.getByBusinessId(businessA.id);
    expect(expensesA).toHaveLength(1);
    expect(expensesA[0].businessId).toBe(businessA.id);

    const expensesB = await ctx.businessExpenseRepository.getByBusinessId(businessB.id);
    expect(expensesB).toHaveLength(1);
    expect(expensesB[0].businessId).toBe(businessB.id);
  });

  it('returns empty array for a business with no records', async () => {
    const businessC = await ctx.businessRepository.create({
      name: 'Business C',
      currency: 'USD',
    });

    const items = await ctx.inventoryRepository.getByBusinessId(businessC.id);
    expect(items).toEqual([]);

    const sales = await ctx.saleRepository.getByBusinessId(businessC.id);
    expect(sales).toEqual([]);

    const customers = await ctx.customerRepository.getByBusinessId(businessC.id);
    expect(customers).toEqual([]);

    const expenses = await ctx.businessExpenseRepository.getByBusinessId(businessC.id);
    expect(expenses).toEqual([]);
  });
});
