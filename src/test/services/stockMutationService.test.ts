import { describe, expect, it, vi } from 'vitest';
import { StockMutationService } from '@/services/inventory/StockMutationService';
import type { InventoryItem } from '@/types/domain/inventory';
import type { EntityId } from '@/types/common/base';
import type { InventoryRepository } from '@/types/repositories/inventoryRepository';
import type { StockMovementRepository } from '@/types/repositories/stockMovementRepository';
import type { StockMovement } from '@/types/domain/stockMovement';
import type { TransactionRunner } from '@/services/common/transaction';

function item(quantity: number): InventoryItem {
  return {
    id: 'inv-1' as EntityId,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    businessId: 'biz-1' as EntityId,
    name: 'Widget',
    quantity,
    unit: 'pcs',
    costPrice: { amountMinor: 1000, currency: 'USD' },
    salePrice: { amountMinor: 2000, currency: 'USD' },
    stockStatus: quantity > 0 ? 'in_stock' : 'out_of_stock',
  };
}

function setup(quantity = 10) {
  let current = item(quantity);
  const inventory = {
    getById: vi.fn(async () => current),
    update: vi.fn(async (_id: EntityId, changes: Partial<InventoryItem>) => {
      current = { ...current, ...changes };
      return current;
    }),
  } as unknown as InventoryRepository;
  const movement = {
    create: vi.fn(async (value: Omit<StockMovement, 'id' | 'createdAt' | 'updatedAt'>) => value as StockMovement),
  } as unknown as StockMovementRepository;
  const transaction: TransactionRunner = { run: async (work) => work() };
  return { service: new StockMutationService(inventory, movement, transaction), inventory, movement };
}

describe('StockMutationService', () => {
  it('aggregates deltas and records one movement per item', async () => {
    const { service, inventory, movement } = setup();

    await service.apply([
      { inventoryItemId: 'inv-1' as EntityId, delta: -2 },
      { inventoryItemId: 'inv-1' as EntityId, delta: 1 },
    ], 'sale-1' as EntityId, 'sale');

    expect((await inventory.getById('inv-1' as EntityId))?.quantity).toBe(9);
    expect(movement.create).toHaveBeenCalledWith(expect.objectContaining({ delta: -1, kind: 'sale', operationId: 'sale-1' }));
  });

  it('rejects a mutation that would create negative stock before updating', async () => {
    const { service, inventory, movement } = setup(2);

    await expect(service.apply([{ inventoryItemId: 'inv-1' as EntityId, delta: -3 }], 'sale-2' as EntityId, 'sale')).rejects.toThrow();
    expect(inventory.update).not.toHaveBeenCalled();
    expect(movement.create).not.toHaveBeenCalled();
  });

  it('updates stock status using the reorder threshold', async () => {
    const { service, inventory } = setup(5);
    const current = await inventory.getById('inv-1' as EntityId);
    if (current) current.reorderThreshold = 5;

    await service.apply([{ inventoryItemId: 'inv-1' as EntityId, delta: -1 }], 'sale-3' as EntityId, 'sale');

    expect(inventory.update).toHaveBeenCalledWith('inv-1', { quantity: 4, stockStatus: 'low_stock' });
  });
});
