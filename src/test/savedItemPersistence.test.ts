import Dexie from 'dexie';
import { afterEach, describe, expect, it } from 'vitest';
import { BizFlowDB } from '@/db/database';
import type { EntityId } from '@/types/common/base';
import type { InventoryItem } from '@/types/domain/inventory';
import type { Category } from '@/types/domain/category';

function createName() {
  return `BizFlowDB_saved_item_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

describe('SavedItem persistence and schema compatibility', () => {
  const databases: BizFlowDB[] = [];

  afterEach(async () => {
    await Promise.all(databases.map(async (database) => {
      const name = database.name;
      database.close();
      await Dexie.delete(name);
    }));
    databases.length = 0;
  });

  it('creates the version 2 savedItems table without changing existing tables', async () => {
    const database = new BizFlowDB(createName());
    databases.push(database);

    await database.open();

    expect(database.verno).toBe(2);
    expect(database.tables.map((table) => table.name)).toEqual(expect.arrayContaining([
      'inventoryItems', 'categories', 'savedItems',
    ]));
    expect(database.inventoryItems.schema.primKey.name).toBe('id');
    expect(database.categories.schema.primKey.name).toBe('id');
    expect(database.savedItems.schema.primKey.name).toBe('id');
  });

  it('persists SavedItem records while preserving inventory and category records', async () => {
    const database = new BizFlowDB(createName());
    databases.push(database);
    const inventoryItem: InventoryItem = {
      id: 'inventory-1' as EntityId, name: 'Stock item', businessId: 'business-1' as EntityId,
      unit: 'pcs', costPrice: { amountMinor: 500, currency: 'USD' }, salePrice: { amountMinor: 1250, currency: 'USD' },
      quantity: 4, reorderThreshold: 1, stockStatus: 'in_stock', createdAt: '2026-09-13T00:00:00.000Z', updatedAt: '2026-09-13T00:00:00.000Z',
    };
    const category: Category = {
      id: 'category-1' as EntityId, name: 'Services', scope: 'business', createdAt: '2026-09-13T00:00:00.000Z', updatedAt: '2026-09-13T00:00:00.000Z',
    };

    await database.inventoryItems.add(inventoryItem);
    await database.categories.add(category);
    const savedItem = {
      id: 'saved-1' as EntityId, name: 'Consultation', kind: 'saved' as const, scope: 'business' as const,
      categoryId: category.id, createdAt: '2026-09-13T00:00:00.000Z', updatedAt: '2026-09-13T00:00:00.000Z',
    };
    await database.savedItems.add(savedItem);
    const databaseName = database.name;
    database.close();

    const reopened = new BizFlowDB(databaseName);
    databases.push(reopened);
    expect(await reopened.savedItems.get(savedItem.id)).toEqual(savedItem);
    expect(await reopened.inventoryItems.get(inventoryItem.id)).toEqual(inventoryItem);
    expect(await reopened.categories.get(category.id)).toEqual(category);
  });
});

