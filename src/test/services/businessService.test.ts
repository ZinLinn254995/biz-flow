import { describe, it, expect, vi } from 'vitest';
import { BusinessService } from '@/services/business/BusinessService';
import { ValidationError } from '@/services/common/errors';
import type { BusinessRepository } from '@/types/repositories/businessRepository';
import type { Business } from '@/types/domain/business';
import type { EntityId } from '@/types/common/base';

function createMockRepo(): BusinessRepository {
  return {
    getById: vi.fn(),
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
}

const sampleBusiness: Business = {
  id: 'test-id' as EntityId,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Test',
  currency: 'USD',
};

describe('BusinessService', () => {
  it('getBusinessById delegates to repository', async () => {
    const repo = createMockRepo();
    (repo.getById as ReturnType<typeof vi.fn>).mockResolvedValue(sampleBusiness);
    const service = new BusinessService(repo);

    const result = await service.getBusinessById('test-id' as EntityId);
    expect(result).toEqual(sampleBusiness);
    expect(repo.getById).toHaveBeenCalledWith('test-id');
  });

  it('getAllBusinesses delegates to repository', async () => {
    const repo = createMockRepo();
    (repo.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([sampleBusiness]);
    const service = new BusinessService(repo);

    const result = await service.getAllBusinesses();
    expect(result).toEqual([sampleBusiness]);
    expect(repo.getAll).toHaveBeenCalled();
  });

  it('createBusiness validates and trims input', async () => {
    const repo = createMockRepo();
    (repo.create as ReturnType<typeof vi.fn>).mockResolvedValue(sampleBusiness);
    const service = new BusinessService(repo);

    await service.createBusiness({ name: '  Test  ', currency: 'USD' });
    expect(repo.create).toHaveBeenCalledWith({ name: 'Test', description: undefined, currency: 'USD' });
  });

  it('createBusiness rejects empty name', async () => {
    const repo = createMockRepo();
    const service = new BusinessService(repo);

    await expect(service.createBusiness({ name: '   ', currency: 'USD' })).rejects.toThrow(ValidationError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('createBusiness rejects empty currency', async () => {
    const repo = createMockRepo();
    const service = new BusinessService(repo);

    await expect(service.createBusiness({ name: 'Test', currency: '' })).rejects.toThrow(ValidationError);
  });

  it('updateBusiness validates name if provided', async () => {
    const repo = createMockRepo();
    (repo.update as ReturnType<typeof vi.fn>).mockResolvedValue(sampleBusiness);
    const service = new BusinessService(repo);

    await service.updateBusiness('id' as EntityId, { name: 'Updated' });
    expect(repo.update).toHaveBeenCalled();
  });

  it('updateBusiness rejects empty name', async () => {
    const repo = createMockRepo();
    const service = new BusinessService(repo);

    await expect(service.updateBusiness('id' as EntityId, { name: '  ' })).rejects.toThrow(ValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('deleteBusiness delegates to repository', async () => {
    const repo = createMockRepo();
    (repo.remove as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    const service = new BusinessService(repo);

    await service.deleteBusiness('id' as EntityId);
    expect(repo.remove).toHaveBeenCalledWith('id');
  });

  it('repository errors propagate (not swallowed)', async () => {
    const repo = createMockRepo();
    (repo.getById as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB error'));
    const service = new BusinessService(repo);

    await expect(service.getBusinessById('id' as EntityId)).rejects.toThrow('DB error');
  });
});
