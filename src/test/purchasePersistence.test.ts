import { describe, it, expect, afterEach } from 'vitest';
import { BizFlowDB } from '@/db/database';
import { createTestContext } from '@/test/helpers';

const ctx = createTestContext();

afterEach(async () => {
  await ctx.db.transaction('rw', [ctx.db.purchases, ctx.db.businesses, ctx.db.inventoryItems], async () => {
    await ctx.db.purchases.clear();
    await ctx.db.businesses.clear();
    await ctx.db.inventoryItems.clear();
  });
});

describe('Purchase persistence', () => {
  it('persists Purchase records with integer minor-unit totals', async () => {
    const business = await ctx.businessRepository.create({ name: 'Test Business', currency: 'USD' });

    const purchase = await ctx.purchaseRepository.create({
      businessId: business.id,
      date: '2026-01-15',
      items: [
        {
          inventoryItemId: 'item-1' as never,
          name: 'Product A',
          quantity: 3,
          unitCost: { amountMinor: 250, currency: 'USD' },
          lineTotal: { amountMinor: 750, currency: 'USD' },
        },
        {
          inventoryItemId: 'item-2' as never,
          name: 'Product B',
          quantity: 1,
          unitCost: { amountMinor: 5000, currency: 'USD' },
          lineTotal: { amountMinor: 5000, currency: 'USD' },
        },
      ],
      totalAmount: { amountMinor: 5750, currency: 'USD' },
    });

    const retrieved = await ctx.purchaseRepository.getById(purchase.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.items).toHaveLength(2);
    expect(retrieved!.totalAmount.amountMinor).toBe(5750);
    expect(retrieved!.totalAmount.currency).toBe('USD');
  });

  it('creates v3 purchases table without changing v1 schema declarations', async () => {
    const database = new BizFlowDB(`BizFlowDB_purchase_v3_test_${Date.now()}`);
    expect(database.tables.map((table: { name: string }) => table.name)).toContain('purchases');
    expect(database.tables.map((table: { name: string }) => table.name)).not.toContain('suppliers');
    database.close();
  });
});
