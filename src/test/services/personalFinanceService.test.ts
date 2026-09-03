import { describe, it, expect, vi } from 'vitest';
import { PersonalIncomeService } from '@/services/personalFinance/PersonalIncomeService';
import { PersonalExpenseService } from '@/services/personalFinance/PersonalExpenseService';
import { ValidationError } from '@/services/common/errors';
import type { PersonalIncomeRepository } from '@/types/repositories/personalIncomeRepository';
import type { PersonalExpenseRepository } from '@/types/repositories/personalExpenseRepository';
import type { EntityId } from '@/types/common/base';

function createMockIncomeRepo(): PersonalIncomeRepository {
  return {
    getById: vi.fn(),
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
}

function createMockExpenseRepo(): PersonalExpenseRepository {
  return {
    getById: vi.fn(),
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
}

describe('PersonalIncomeService', () => {
  const validInput = {
    source: 'Freelance',
    date: '2026-01-15T00:00:00.000Z',
    amount: { amountMinor: 50000, currency: 'THB' },
  };

  it('create validates and delegates', async () => {
    const repo = createMockIncomeRepo();
    (repo.create as ReturnType<typeof vi.fn>).mockResolvedValue({ ...validInput, id: 'x' as EntityId, createdAt: '', updatedAt: '' });
    const service = new PersonalIncomeService(repo);

    await service.create(validInput);
    expect(repo.create).toHaveBeenCalled();
  });

  it('create rejects empty source', async () => {
    const repo = createMockIncomeRepo();
    const service = new PersonalIncomeService(repo);

    await expect(service.create({ ...validInput, source: '' })).rejects.toThrow(ValidationError);
  });

  it('create rejects negative amount', async () => {
    const repo = createMockIncomeRepo();
    const service = new PersonalIncomeService(repo);

    await expect(service.create({ ...validInput, amount: { amountMinor: -1, currency: 'THB' } })).rejects.toThrow(ValidationError);
  });

  it('update delegates to repository', async () => {
    const repo = createMockIncomeRepo();
    (repo.update as ReturnType<typeof vi.fn>).mockResolvedValue({ ...validInput, id: 'x' as EntityId, createdAt: '', updatedAt: '' });
    const service = new PersonalIncomeService(repo);

    await service.update('id' as EntityId, { source: 'Updated' });
    expect(repo.update).toHaveBeenCalled();
  });

  it('delete delegates to repository', async () => {
    const repo = createMockIncomeRepo();
    (repo.remove as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    const service = new PersonalIncomeService(repo);

    await service.delete('id' as EntityId);
    expect(repo.remove).toHaveBeenCalledWith('id');
  });

  it('repository errors propagate', async () => {
    const repo = createMockIncomeRepo();
    (repo.getAll as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB error'));
    const service = new PersonalIncomeService(repo);

    await expect(service.getAll()).rejects.toThrow('DB error');
  });
});

describe('PersonalExpenseService', () => {
  const validInput = {
    title: 'Groceries',
    date: '2026-01-15T00:00:00.000Z',
    amount: { amountMinor: 1500, currency: 'THB' },
  };

  it('create validates and delegates', async () => {
    const repo = createMockExpenseRepo();
    (repo.create as ReturnType<typeof vi.fn>).mockResolvedValue({ ...validInput, id: 'x' as EntityId, createdAt: '', updatedAt: '' });
    const service = new PersonalExpenseService(repo);

    await service.create(validInput);
    expect(repo.create).toHaveBeenCalled();
  });

  it('create rejects empty title', async () => {
    const repo = createMockExpenseRepo();
    const service = new PersonalExpenseService(repo);

    await expect(service.create({ ...validInput, title: '' })).rejects.toThrow(ValidationError);
  });

  it('create rejects negative amount', async () => {
    const repo = createMockExpenseRepo();
    const service = new PersonalExpenseService(repo);

    await expect(service.create({ ...validInput, amount: { amountMinor: -1, currency: 'THB' } })).rejects.toThrow(ValidationError);
  });

  it('delete delegates to repository', async () => {
    const repo = createMockExpenseRepo();
    (repo.remove as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    const service = new PersonalExpenseService(repo);

    await service.delete('id' as EntityId);
    expect(repo.remove).toHaveBeenCalledWith('id');
  });

  it('repository errors propagate', async () => {
    const repo = createMockExpenseRepo();
    (repo.getById as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB error'));
    const service = new PersonalExpenseService(repo);

    await expect(service.getById('x' as EntityId)).rejects.toThrow('DB error');
  });
});
