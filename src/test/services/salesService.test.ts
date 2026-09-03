import { describe, it, expect, vi } from 'vitest';
import { SalesService } from '@/services/sales/SalesService';
import { ValidationError } from '@/services/common/errors';
import type { SaleRepository } from '@/types/repositories/saleRepository';
import type { EntityId } from '@/types/common/base';

function createMockRepo(): SaleRepository {
  return {
    getById: vi.fn(),
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    getByBusinessId: vi.fn(),
  };
}

const validSaleInput = {
  businessId: 'biz-1' as EntityId,
  date: '2026-01-01T00:00:00.000Z',
  items: [
    {
      inventoryItemId: 'inv-1' as EntityId,
      name: 'Product A',
      quantity: 2,
      unitPrice: { amountMinor: 500, currency: 'USD' },
      lineTotal: { amountMinor: 1000, currency: 'USD' },
    },
  ],
  totalAmount: { amountMinor: 1000, currency: 'USD' },
  paymentStatus: 'paid' as const,
};

describe('SalesService', () => {
  it('createSale validates and delegates', async () => {
    const repo = createMockRepo();
    (repo.create as ReturnType<typeof vi.fn>).mockResolvedValue({ ...validSaleInput, id: 'x' as EntityId, createdAt: '', updatedAt: '' });
    const service = new SalesService(repo);

    await service.createSale(validSaleInput);
    expect(repo.create).toHaveBeenCalled();
  });

  it('createSale rejects empty businessId', async () => {
    const repo = createMockRepo();
    const service = new SalesService(repo);

    await expect(service.createSale({ ...validSaleInput, businessId: '' as EntityId })).rejects.toThrow(ValidationError);
  });

  it('createSale rejects empty date', async () => {
    const repo = createMockRepo();
    const service = new SalesService(repo);

    await expect(service.createSale({ ...validSaleInput, date: '' })).rejects.toThrow(ValidationError);
  });

  it('createSale rejects negative totalAmount', async () => {
    const repo = createMockRepo();
    const service = new SalesService(repo);

    await expect(service.createSale({ ...validSaleInput, totalAmount: { amountMinor: -1, currency: 'USD' } })).rejects.toThrow(ValidationError);
  });

  it('createSale rejects item with negative quantity', async () => {
    const repo = createMockRepo();
    const service = new SalesService(repo);

    const badInput = {
      ...validSaleInput,
      items: [{ ...validSaleInput.items[0], quantity: -1 }],
    };
    await expect(service.createSale(badInput)).rejects.toThrow(ValidationError);
  });

  it('getSalesByBusinessId delegates to repository', async () => {
    const repo = createMockRepo();
    (repo.getByBusinessId as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const service = new SalesService(repo);

    await service.getSalesByBusinessId('biz-1' as EntityId);
    expect(repo.getByBusinessId).toHaveBeenCalledWith('biz-1');
  });

  it('deleteSale delegates to repository', async () => {
    const repo = createMockRepo();
    (repo.remove as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    const service = new SalesService(repo);

    await service.deleteSale('id' as EntityId);
    expect(repo.remove).toHaveBeenCalledWith('id');
  });

  it('repository errors propagate', async () => {
    const repo = createMockRepo();
    (repo.create as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB error'));
    const service = new SalesService(repo);

    await expect(service.createSale(validSaleInput)).rejects.toThrow('DB error');
  });
});
