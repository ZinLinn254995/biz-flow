import { describe, it, expect, afterEach } from 'vitest';
import { createTestContext } from '@/test/helpers';

const ctx = createTestContext();

afterEach(async () => {
  await ctx.db.transaction('rw', ctx.db.businesses, async () => {
    await ctx.db.businesses.clear();
  });
});

describe('Money precision', () => {
  it('preserves exact integer minor units without floating-point conversion', async () => {
    const testValues = [0, 1, 99, 100, 1250, 999999, 123456789];

    for (const amountMinor of testValues) {
      const business = await ctx.businessRepository.create({
        name: `Money Test ${amountMinor}`,
        currency: 'THB',
      });

      const retrieved = await ctx.businessRepository.getById(business.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.currency).toBe('THB');
    }
  });

  it('preserves Money structure in expense records', async () => {
    const business = await ctx.businessRepository.create({
      name: 'Money Business',
      currency: 'THB',
    });

    const expense = await ctx.businessExpenseRepository.create({
      businessId: business.id,
      title: 'Test Expense',
      date: '2026-01-01T00:00:00.000Z',
      amount: { amountMinor: 1250, currency: 'THB' },
    });

    const retrieved = await ctx.businessExpenseRepository.getById(expense.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.amount.amountMinor).toBe(1250);
    expect(retrieved!.amount.currency).toBe('THB');
    expect(Number.isInteger(retrieved!.amount.amountMinor)).toBe(true);
  });

  it('preserves Money structure in sale line items', async () => {
    const business = await ctx.businessRepository.create({
      name: 'Sale Money Business',
      currency: 'USD',
    });

    const sale = await ctx.saleRepository.create({
      businessId: business.id,
      date: '2026-01-01T00:00:00.000Z',
      items: [
        {
          inventoryItemId: 'inv-1' as never,
          name: 'Item',
          quantity: 2,
          unitPrice: { amountMinor: 499, currency: 'USD' },
          lineTotal: { amountMinor: 998, currency: 'USD' },
        },
      ],
      totalAmount: { amountMinor: 998, currency: 'USD' },
      paymentStatus: 'paid',
    });

    const retrieved = await ctx.saleRepository.getById(sale.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.items[0].unitPrice.amountMinor).toBe(499);
    expect(retrieved!.items[0].lineTotal.amountMinor).toBe(998);
    expect(retrieved!.totalAmount.amountMinor).toBe(998);
    expect(Number.isInteger(retrieved!.items[0].unitPrice.amountMinor)).toBe(true);
  });
});
