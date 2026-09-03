import { describe, it, expect, vi } from 'vitest';
import { InventoryService } from '@/services/inventory/InventoryService';
import { ValidationError } from '@/services/common/errors';
import type { InventoryRepository } from '@/types/repositories/inventoryRepository';
import type { InventoryItem } from '@/types/domain/inventory';
import type { EntityId } from '@/types/common/base';

function createMockRepo(): InventoryRepository {
  return {
    getById: vi.fn(),
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    getByBusinessId: vi.fn(),
  };
}

const validInput = {
  businessId: 'biz-1' as EntityId,
  name: 'Widget',
  unit: 'pcs',
  quantity: 10,
  costPrice: { amountMinor: 500, currency: 'USD' },
  salePrice: { amountMinor: 1000, currency: 'USD' },
  stockStatus: 'in_stock' as const,
};

describe('InventoryService', () => {
  it('createInventoryItem validates and delegates', async () => {
    const repo = createMockRepo();
    (repo.create as ReturnType<typeof vi.fn>).mockResolvedValue({ ...validInput, id: 'x' as EntityId, createdAt: '', updatedAt: '' });
    const service = new InventoryService(repo);

    await service.createInventoryItem(validInput);
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Widget', quantity: 10 }));
  });

  it('createInventoryItem rejects empty name', async () => {
    const repo = createMockRepo();
    const service = new InventoryService(repo);

    await expect(service.createInventoryItem({ ...validInput, name: '' })).rejects.toThrow(ValidationError);
  });

  it('createInventoryItem rejects negative quantity', async () => {
    const repo = createMockRepo();
    const service = new InventoryService(repo);

    await expect(service.createInventoryItem({ ...validInput, quantity: -1 })).rejects.toThrow(ValidationError);
  });

  it('createInventoryItem rejects negative costPrice', async () => {
    const repo = createMockRepo();
    const service = new InventoryService(repo);

    await expect(service.createInventoryItem({ ...validInput, costPrice: { amountMinor: -1, currency: 'USD' } })).rejects.toThrow(ValidationError);
  });

  it('getInventoryItemsByBusinessId delegates to repository getByBusinessId', async () => {
    const repo = createMockRepo();
    (repo.getByBusinessId as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const service = new InventoryService(repo);

    await service.getInventoryItemsByBusinessId('biz-1' as EntityId);
    expect(repo.getByBusinessId).toHaveBeenCalledWith('biz-1');
  });

  it('deleteInventoryItem delegates to repository', async () => {
    const repo = createMockRepo();
    (repo.remove as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    const service = new InventoryService(repo);

    await service.deleteInventoryItem('id' as EntityId);
    expect(repo.remove).toHaveBeenCalledWith('id');
  });

  it('repository errors propagate', async () => {
    const repo = createMockRepo();
    (repo.getByBusinessId as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB error'));
    const service = new InventoryService(repo);

    await expect(service.getInventoryItemsByBusinessId('biz-1' as EntityId)).rejects.toThrow('DB error');
  });
});
