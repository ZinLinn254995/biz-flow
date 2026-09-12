import { describe, expect, it } from 'vitest';
import type { EntityId } from '@/types/common/base';
import type { InventoryItem } from '@/types/domain/inventory';
import { toGenericItem } from '@/services/items/itemAdapter';

const inventoryItem: InventoryItem = {
  id: 'inventory-1' as EntityId,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  businessId: 'business-1' as EntityId,
  name: 'Coffee beans',
  sku: 'COFFEE-1',
  quantity: 12,
  unit: 'bags',
  costPrice: { amountMinor: 800, currency: 'USD' },
  salePrice: { amountMinor: 1200, currency: 'USD' },
  reorderThreshold: 3,
  stockStatus: 'in_stock',
};

describe('toGenericItem', () => {
  it('projects stable identity and reusable classification', () => {
    expect(toGenericItem(inventoryItem)).toEqual({
      id: inventoryItem.id,
      createdAt: inventoryItem.createdAt,
      updatedAt: inventoryItem.updatedAt,
      name: inventoryItem.name,
      kind: 'inventory',
    });
  });

  it('does not expose inventory stock or pricing fields', () => {
    const genericItem = toGenericItem(inventoryItem);
    expect(genericItem).not.toHaveProperty('quantity');
    expect(genericItem).not.toHaveProperty('costPrice');
    expect(genericItem).not.toHaveProperty('salePrice');
    expect(genericItem).not.toHaveProperty('stockStatus');
    expect(genericItem).not.toHaveProperty('businessId');
  });
});
