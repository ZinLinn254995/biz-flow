import { describe, expect, it, vi } from 'vitest';
import { QuickAddService } from '@/services/items/QuickAddService';
import { SavedItemService } from '@/services/items/SavedItemService';
import type { SavedItem } from '@/types/domain/savedItem';
import type { SavedItemRepository } from '@/types/repositories/savedItemRepository';

const item: SavedItem = {
  id: 'saved-1' as never,
  name: 'Consultation',
  kind: 'saved',
  scope: 'personal',
  categoryId: 'category-1' as never,
  amount: { amountMinor: 2500, currency: 'USD' },
  favoriteOrder: 0,
  createdAt: '2026-09-15T00:00:00.000Z',
  updatedAt: '2026-09-15T00:00:00.000Z',
};

function repository(): SavedItemRepository {
  return {
    getById: vi.fn().mockResolvedValue(item),
    getAll: vi.fn().mockResolvedValue([item]),
    create: vi.fn(),
    update: vi.fn().mockImplementation(async (_id, changes) => ({ ...item, ...changes })),
    remove: vi.fn(),
    getByScope: vi.fn(),
    getByKind: vi.fn(),
    getByCategoryId: vi.fn(),
    getFavorites: vi.fn().mockResolvedValue([item]),
    setFavorite: vi.fn(),
  };
}

describe('QuickAddService', () => {
  it('prepares reusable input without persistence metadata', async () => {
    const quickAdd = new QuickAddService(new SavedItemService(repository()));
    await expect(quickAdd.prepare(item.id)).resolves.toEqual({
      name: item.name,
      kind: item.kind,
      scope: item.scope,
      categoryId: item.categoryId,
      amount: item.amount,
    });
  });

  it('returns favorites through the saved-item service', async () => {
    const quickAdd = new QuickAddService(new SavedItemService(repository()));
    await expect(quickAdd.getFavorites()).resolves.toEqual([item]);
  });

  it('does not create a financial record', async () => {
    const repo = repository();
    const quickAdd = new QuickAddService(new SavedItemService(repo));
    await quickAdd.prepare(item.id);
    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.update).not.toHaveBeenCalled();
  });
});
