import { describe, it, expect, afterEach } from 'vitest';
import { createTestContext } from '@/test/helpers';

const ctx = createTestContext();

afterEach(async () => {
  await ctx.db.transaction('rw', [ctx.db.sales, ctx.db.businesses, ctx.db.customers], async () => {
    await ctx.db.sales.clear();
    await ctx.db.businesses.clear();
    await ctx.db.customers.clear();
  });
});

describe('Sale with SaleItem[] persistence', () => {
  it('preserves multiple SaleItems after round-trip', async () => {
    const business = await ctx.businessRepository.create({
      name: 'Test Business',
      currency: 'THB',
    });

    const sale = await ctx.saleRepository.create({
      businessId: business.id,
      date: '2026-01-15T10:30:00.000Z',
      items: [
        {
          inventoryItemId: 'item-1' as never,
          name: 'Product A',
          quantity: 3,
          unitPrice: { amountMinor: 250, currency: 'THB' },
          lineTotal: { amountMinor: 750, currency: 'THB' },
        },
        {
          inventoryItemId: 'item-2' as never,
          name: 'Product B',
          quantity: 1,
          unitPrice: { amountMinor: 5000, currency: 'THB' },
          lineTotal: { amountMinor: 5000, currency: 'THB' },
        },
      ],
      totalAmount: { amountMinor: 5750, currency: 'THB' },
      paymentStatus: 'paid',
    });

    const retrieved = await ctx.saleRepository.getById(sale.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.items).toHaveLength(2);
    expect(retrieved!.items[0].name).toBe('Product A');
    expect(retrieved!.items[0].quantity).toBe(3);
    expect(retrieved!.items[0].unitPrice.amountMinor).toBe(250);
    expect(retrieved!.items[0].lineTotal.amountMinor).toBe(750);
    expect(retrieved!.items[1].name).toBe('Product B');
    expect(retrieved!.items[1].quantity).toBe(1);
    expect(retrieved!.items[1].unitPrice.amountMinor).toBe(5000);
    expect(retrieved!.items[1].lineTotal.amountMinor).toBe(5000);
    expect(retrieved!.totalAmount.amountMinor).toBe(5750);
  });

  it('preserves optional customerId reference', async () => {
    const business = await ctx.businessRepository.create({
      name: 'Test Business',
      currency: 'THB',
    });
    const customer = await ctx.customerRepository.create({
      businessId: business.id,
      name: 'John Doe',
    });

    const sale = await ctx.saleRepository.create({
      businessId: business.id,
      customerId: customer.id,
      date: '2026-01-15T10:30:00.000Z',
      items: [],
      totalAmount: { amountMinor: 0, currency: 'THB' },
      paymentStatus: 'pending',
    });

    const retrieved = await ctx.saleRepository.getById(sale.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.customerId).toBe(customer.id);
  });

  it('preserves sale without a customer (optional customerId)', async () => {
    const business = await ctx.businessRepository.create({
      name: 'Test Business',
      currency: 'THB',
    });

    const sale = await ctx.saleRepository.create({
      businessId: business.id,
      date: '2026-01-15T10:30:00.000Z',
      items: [],
      totalAmount: { amountMinor: 0, currency: 'THB' },
      paymentStatus: 'pending',
    });

    const retrieved = await ctx.saleRepository.getById(sale.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.customerId).toBeUndefined();
  });
});
