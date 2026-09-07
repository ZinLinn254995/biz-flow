import { describe, it, expect, vi } from 'vitest';
import { SalesService } from '@/services/sales/SalesService';
import type { SaleRepository } from '@/types/repositories/saleRepository';
import type { InventoryRepository } from '@/types/repositories/inventoryRepository';
import type { Sale, SaleItem } from '@/types/domain/sale';
import type { InventoryItem } from '@/types/domain/inventory';
import type { EntityId } from '@/types/common/base';

function createMockSaleRepo(): SaleRepository {
  return {
    getById: vi.fn(),
    getAll: vi.fn().mockResolvedValue([]),
    getByBusinessId: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
}

function createMockInventoryRepo(items: InventoryItem[] = []): InventoryRepository {
  const itemMap = new Map(items.map((i) => [i.id, i]));
  return {
    getById: vi.fn().mockImplementation(async (id: EntityId) => itemMap.get(id) ?? null),
    getAll: vi.fn().mockResolvedValue(items),
    getByBusinessId: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn().mockImplementation(async (id: EntityId, changes: Partial<InventoryItem>) => {
      const existing = itemMap.get(id);
      if (existing) {
        const updated = { ...existing, ...changes };
        itemMap.set(id, updated);
        return updated;
      }
      throw new Error('Not found');
    }),
    remove: vi.fn(),
  };
}

function mkInventoryItem(id: string, qty: number, reorderThreshold?: number): InventoryItem {
  return {
    id: id as EntityId,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    businessId: 'biz-1' as EntityId,
    name: `Item ${id}`,
    quantity: qty,
    unit: 'pcs',
    costPrice: { amountMinor: 1000, currency: 'USD' },
    salePrice: { amountMinor: 2000, currency: 'USD' },
    reorderThreshold,
    stockStatus: qty <= 0 ? 'out_of_stock' : reorderThreshold && qty <= reorderThreshold ? 'low_stock' : 'in_stock',
  };
}

function mkSaleItem(itemId: string, qty: number): SaleItem {
  return {
    inventoryItemId: itemId as EntityId,
    name: `Item ${itemId}`,
    quantity: qty,
    unitPrice: { amountMinor: 2000, currency: 'USD' },
    lineTotal: { amountMinor: 2000 * qty, currency: 'USD' },
  };
}

function mkSale(id: string, items: SaleItem[]): Sale {
  return {
    id: id as EntityId,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    businessId: 'biz-1' as EntityId,
    date: '2026-01-01',
    items,
    totalAmount: { amountMinor: items.reduce((s, i) => s + i.lineTotal.amountMinor, 0), currency: 'USD' },
    paymentStatus: 'paid',
  };
}

const validInput = {
  businessId: 'biz-1' as EntityId,
  date: '2026-01-01',
  items: [mkSaleItem('inv-1', 2)],
  totalAmount: { amountMinor: 4000, currency: 'USD' },
  paymentStatus: 'paid' as const,
};

describe('SalesService — stock deduction on create', () => {
  it('deducts stock when sale is created', async () => {
    const invRepo = createMockInventoryRepo([mkInventoryItem('inv-1', 50)]);
    const saleRepo = createMockSaleRepo();
    (saleRepo.create as ReturnType<typeof vi.fn>).mockResolvedValue(mkSale('s1', validInput.items));
    const service = new SalesService(saleRepo, invRepo);

    await service.createSale(validInput);

    const updated = await invRepo.getById('inv-1' as EntityId);
    expect(updated?.quantity).toBe(48);
  });

  it('updates stockStatus after deduction', async () => {
    const invRepo = createMockInventoryRepo([mkInventoryItem('inv-1', 5, 10)]);
    const saleRepo = createMockSaleRepo();
    (saleRepo.create as ReturnType<typeof vi.fn>).mockResolvedValue(mkSale('s1', validInput.items));
    const service = new SalesService(saleRepo, invRepo);

    await service.createSale({ ...validInput, items: [mkSaleItem('inv-1', 2)] });

    const updated = await invRepo.getById('inv-1' as EntityId);
    expect(updated?.stockStatus).toBe('low_stock');
  });

  it('sets out_of_stock when quantity reaches zero', async () => {
    const invRepo = createMockInventoryRepo([mkInventoryItem('inv-1', 2)]);
    const saleRepo = createMockSaleRepo();
    (saleRepo.create as ReturnType<typeof vi.fn>).mockResolvedValue(mkSale('s1', validInput.items));
    const service = new SalesService(saleRepo, invRepo);

    await service.createSale({ ...validInput, items: [mkSaleItem('inv-1', 2)] });

    const updated = await invRepo.getById('inv-1' as EntityId);
    expect(updated?.quantity).toBe(0);
    expect(updated?.stockStatus).toBe('out_of_stock');
  });
});

describe('SalesService — insufficient stock rejection', () => {
  it('rejects sale when stock is insufficient', async () => {
    const invRepo = createMockInventoryRepo([mkInventoryItem('inv-1', 1)]);
    const saleRepo = createMockSaleRepo();
    const service = new SalesService(saleRepo, invRepo);

    await expect(
      service.createSale({ ...validInput, items: [mkSaleItem('inv-1', 5)] }),
    ).rejects.toThrow(/Insufficient stock/);

    expect(saleRepo.create).not.toHaveBeenCalled();
  });

  it('rejects sale when inventory item not found', async () => {
    const invRepo = createMockInventoryRepo([]);
    const saleRepo = createMockSaleRepo();
    const service = new SalesService(saleRepo, invRepo);

    await expect(service.createSale(validInput)).rejects.toThrow(/not found/);
    expect(saleRepo.create).not.toHaveBeenCalled();
  });

  it('does not leave partial stock changes on rejection', async () => {
    const invRepo = createMockInventoryRepo([
      mkInventoryItem('inv-1', 10),
      mkInventoryItem('inv-2', 1),
    ]);
    const saleRepo = createMockSaleRepo();
    const service = new SalesService(saleRepo, invRepo);

    await expect(
      service.createSale({
        ...validInput,
        items: [mkSaleItem('inv-1', 3), mkSaleItem('inv-2', 5)],
      }),
    ).rejects.toThrow(/Insufficient stock/);

    // inv-1 should be deducted then restored since we process sequentially
    // Actually we deduct before createSale, so inv-1 gets deducted, then inv-2 fails
    // We need to verify inv-1 is restored
    const item1 = await invRepo.getById('inv-1' as EntityId);
    expect(item1?.quantity).toBe(10);
  });
});

describe('SalesService — sale deletion restores stock', () => {
  it('restores stock when sale is deleted', async () => {
    const invRepo = createMockInventoryRepo([mkInventoryItem('inv-1', 48)]);
    const saleRepo = createMockSaleRepo();
    const sale = mkSale('s1', [mkSaleItem('inv-1', 2)]);
    (saleRepo.getById as ReturnType<typeof vi.fn>).mockResolvedValue(sale);
    (saleRepo.remove as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    const service = new SalesService(saleRepo, invRepo);

    await service.deleteSale('s1' as EntityId);

    const updated = await invRepo.getById('inv-1' as EntityId);
    expect(updated?.quantity).toBe(50);
  });
});

describe('SalesService — sale update adjusts stock', () => {
  it('restores old stock and deducts new stock on update', async () => {
    const invRepo = createMockInventoryRepo([mkInventoryItem('inv-1', 48)]);
    const saleRepo = createMockSaleRepo();
    const oldSale = mkSale('s1', [mkSaleItem('inv-1', 2)]);
    (saleRepo.getById as ReturnType<typeof vi.fn>).mockResolvedValue(oldSale);
    (saleRepo.update as ReturnType<typeof vi.fn>).mockResolvedValue(
      mkSale('s1', [mkSaleItem('inv-1', 3)]),
    );
    const service = new SalesService(saleRepo, invRepo);

    await service.updateSale('s1' as EntityId, {
      items: [mkSaleItem('inv-1', 3)],
    });

    // Old: 48 + 2 (restored) = 50, then - 3 (new) = 47
    const updated = await invRepo.getById('inv-1' as EntityId);
    expect(updated?.quantity).toBe(47);
  });

  it('rejects update when new items exceed stock', async () => {
    const invRepo = createMockInventoryRepo([mkInventoryItem('inv-1', 48)]);
    const saleRepo = createMockSaleRepo();
    const oldSale = mkSale('s1', [mkSaleItem('inv-1', 2)]);
    (saleRepo.getById as ReturnType<typeof vi.fn>).mockResolvedValue(oldSale);
    const service = new SalesService(saleRepo, invRepo);

    await expect(
      service.updateSale('s1' as EntityId, {
        items: [mkSaleItem('inv-1', 100)],
      }),
    ).rejects.toThrow(/Insufficient stock/);

    // Stock should be restored to original
    const updated = await invRepo.getById('inv-1' as EntityId);
    expect(updated?.quantity).toBe(48);
  });
});

describe('SalesService — multiple items', () => {
  it('handles multiple SaleItems across different inventory items', async () => {
    const invRepo = createMockInventoryRepo([
      mkInventoryItem('inv-1', 50),
      mkInventoryItem('inv-2', 30),
    ]);
    const saleRepo = createMockSaleRepo();
    (saleRepo.create as ReturnType<typeof vi.fn>).mockResolvedValue(
      mkSale('s1', [mkSaleItem('inv-1', 5), mkSaleItem('inv-2', 3)]),
    );
    const service = new SalesService(saleRepo, invRepo);

    await service.createSale({
      ...validInput,
      items: [mkSaleItem('inv-1', 5), mkSaleItem('inv-2', 3)],
    });

    const item1 = await invRepo.getById('inv-1' as EntityId);
    const item2 = await invRepo.getById('inv-2' as EntityId);
    expect(item1?.quantity).toBe(45);
    expect(item2?.quantity).toBe(27);
  });

  it('aggregates quantities for same inventory item', async () => {
    const invRepo = createMockInventoryRepo([mkInventoryItem('inv-1', 50)]);
    const saleRepo = createMockSaleRepo();
    (saleRepo.create as ReturnType<typeof vi.fn>).mockResolvedValue(
      mkSale('s1', [mkSaleItem('inv-1', 3), mkSaleItem('inv-1', 4)]),
    );
    const service = new SalesService(saleRepo, invRepo);

    await service.createSale({
      ...validInput,
      items: [mkSaleItem('inv-1', 3), mkSaleItem('inv-1', 4)],
    });

    const updated = await invRepo.getById('inv-1' as EntityId);
    expect(updated?.quantity).toBe(43);
  });
});

describe('SalesService — no negative inventory', () => {
  it('never allows inventory to go negative', async () => {
    const invRepo = createMockInventoryRepo([mkInventoryItem('inv-1', 0)]);
    const saleRepo = createMockSaleRepo();
    const service = new SalesService(saleRepo, invRepo);

    await expect(
      service.createSale({ ...validInput, items: [mkSaleItem('inv-1', 1)] }),
    ).rejects.toThrow(/Insufficient stock/);

    const item = await invRepo.getById('inv-1' as EntityId);
    expect(item?.quantity).toBe(0);
  });
});

describe('SalesService — atomic stock operations (P2P19)', () => {
  function makeRunner() {
    const calls: string[] = [];
    return {
      calls,
      runner: {
        run: async <T,>(work: () => Promise<T>): Promise<T> => {
          calls.push('start');
          try {
            const result = await work();
            calls.push('commit');
            return result;
          } catch (error) {
            calls.push('rollback');
            throw error;
          }
        },
      },
    };
  }

  it('runs sale creation and stock deduction inside a single transaction', async () => {
    const saleRepo = createMockSaleRepo();
    (saleRepo.create as ReturnType<typeof vi.fn>).mockImplementation(async (s: Sale) => s);
    const invRepo = createMockInventoryRepo([mkInventoryItem('item-1', 10)]);
    const { calls, runner } = makeRunner();
    const service = new SalesService(saleRepo, invRepo, runner);

    await service.createSale({
      businessId: 'biz-1' as EntityId,
      date: '2026-01-05',
      items: [mkSaleItem('item-1', 3)],
      totalAmount: { amountMinor: 6000, currency: 'USD' },
      paymentStatus: 'paid',
    });

    expect(calls).toEqual(['start', 'commit']);
    expect((await invRepo.getById('item-1' as EntityId))?.quantity).toBe(7);
  });

  it('rolls the transaction back when sale persistence fails', async () => {
    const saleRepo = createMockSaleRepo();
    (saleRepo.create as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('write failed'));
    const invRepo = createMockInventoryRepo([mkInventoryItem('item-1', 10)]);
    const { calls, runner } = makeRunner();
    const service = new SalesService(saleRepo, invRepo, runner);

    await expect(
      service.createSale({
        businessId: 'biz-1' as EntityId,
        date: '2026-01-05',
        items: [mkSaleItem('item-1', 3)],
        totalAmount: { amountMinor: 6000, currency: 'USD' },
        paymentStatus: 'paid',
      }),
    ).rejects.toThrow('write failed');

    expect(calls).toEqual(['start', 'rollback']);
    expect((await invRepo.getById('item-1' as EntityId))?.quantity).toBe(10);
  });

  it('runs stock restoration and sale deletion inside a single transaction', async () => {
    const saleRepo = createMockSaleRepo();
    (saleRepo.getById as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'sale-1' as EntityId,
      items: [mkSaleItem('item-1', 4)],
    } as unknown as Sale);
    (saleRepo.remove as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    const invRepo = createMockInventoryRepo([mkInventoryItem('item-1', 6)]);
    const { calls, runner } = makeRunner();
    const service = new SalesService(saleRepo, invRepo, runner);

    await service.deleteSale('sale-1' as EntityId);

    expect(calls).toEqual(['start', 'commit']);
    expect((await invRepo.getById('item-1' as EntityId))?.quantity).toBe(10);
  });
});
