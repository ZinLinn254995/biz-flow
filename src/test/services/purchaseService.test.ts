import { describe, it, expect, vi } from 'vitest';
import { PurchaseService } from '@/services/purchases/PurchaseService';
import type { PurchaseRepository } from '@/types/repositories/purchaseRepository';
import type { InventoryRepository } from '@/types/repositories/inventoryRepository';
import type { Purchase, PurchaseItem } from '@/types/domain/purchase';
import type { InventoryItem } from '@/types/domain/inventory';
import type { EntityId } from '@/types/common/base';

function createMockPurchaseRepo(): PurchaseRepository {
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

function mkPurchaseItem(itemId: string, qty: number): PurchaseItem {
  return {
    inventoryItemId: itemId as EntityId,
    name: `Item ${itemId}`,
    quantity: qty,
    unitCost: { amountMinor: 1500, currency: 'USD' },
    lineTotal: { amountMinor: 1500 * qty, currency: 'USD' },
  };
}

function mkPurchase(id: string, items: PurchaseItem[]): Purchase {
  return {
    id: id as EntityId,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    businessId: 'biz-1' as EntityId,
    date: '2026-01-01',
    items,
    totalAmount: { amountMinor: items.reduce((s, i) => s + i.lineTotal.amountMinor, 0), currency: 'USD' },
    notes: undefined,
  };
}

const validInput = {
  businessId: 'biz-1' as EntityId,
  date: '2026-01-01',
  items: [mkPurchaseItem('inv-1', 2)],
  totalAmount: { amountMinor: 3000, currency: 'USD' },
};

describe('PurchaseService', () => {
  it('creates a purchase and increases inventory stock', async () => {
    const invRepo = createMockInventoryRepo([mkInventoryItem('inv-1', 5)]);
    const purchaseRepo = createMockPurchaseRepo();
    (purchaseRepo.create as ReturnType<typeof vi.fn>).mockResolvedValue(mkPurchase('p1', validInput.items));

    const service = new PurchaseService(purchaseRepo, invRepo);
    await service.createPurchase(validInput);

    const updated = await invRepo.getById('inv-1' as EntityId);
    expect(updated?.quantity).toBe(7);
    expect(updated?.stockStatus).toBe('in_stock');
  });

  it('rejects mismatched total currency', async () => {
    const invRepo = createMockInventoryRepo([mkInventoryItem('inv-1', 5)]);
    const purchaseRepo = createMockPurchaseRepo();
    const service = new PurchaseService(purchaseRepo, invRepo);

    await expect(
      service.createPurchase({
        ...validInput,
        items: [mkPurchaseItem('inv-1', 2)],
        totalAmount: { amountMinor: 3000, currency: 'EUR' },
      }),
    ).rejects.toThrow(/does not match item currency/i);
  });

  it('reverses old stock and applies new stock on update', async () => {
    const invRepo = createMockInventoryRepo([mkInventoryItem('inv-1', 5)]);
    const purchaseRepo = createMockPurchaseRepo();
    const oldPurchase = mkPurchase('p1', [mkPurchaseItem('inv-1', 2)]);
    (purchaseRepo.getById as ReturnType<typeof vi.fn>).mockResolvedValue(oldPurchase);
    (purchaseRepo.update as ReturnType<typeof vi.fn>).mockResolvedValue(
      mkPurchase('p1', [mkPurchaseItem('inv-1', 3)]),
    );

    const service = new PurchaseService(purchaseRepo, invRepo);
    await service.updatePurchase('p1' as EntityId, {
      items: [mkPurchaseItem('inv-1', 3)],
      totalAmount: { amountMinor: 4500, currency: 'USD' },
    });

    const updated = await invRepo.getById('inv-1' as EntityId);
    expect(updated?.quantity).toBe(6);
  });

  it('restores inventory stock when purchase is deleted', async () => {
    const invRepo = createMockInventoryRepo([mkInventoryItem('inv-1', 5)]);
    const purchaseRepo = createMockPurchaseRepo();
    const purchase = mkPurchase('p1', [mkPurchaseItem('inv-1', 2)]);
    (purchaseRepo.getById as ReturnType<typeof vi.fn>).mockResolvedValue(purchase);
    (purchaseRepo.remove as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const service = new PurchaseService(purchaseRepo, invRepo);
    await service.deletePurchase('p1' as EntityId);

    const updated = await invRepo.getById('inv-1' as EntityId);
    expect(updated?.quantity).toBe(3);
  });
});
