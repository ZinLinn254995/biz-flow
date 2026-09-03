import { describe, it, expect, vi } from 'vitest';
import { CustomerService } from '@/services/customers/CustomerService';
import { BusinessExpenseService } from '@/services/businessExpenses/BusinessExpenseService';
import { ValidationError } from '@/services/common/errors';
import type { CustomerRepository } from '@/types/repositories/customerRepository';
import type { BusinessExpenseRepository } from '@/types/repositories/businessExpenseRepository';
import type { EntityId } from '@/types/common/base';

function createMockCustomerRepo(): CustomerRepository {
  return {
    getById: vi.fn(),
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    getByBusinessId: vi.fn(),
  };
}

function createMockExpenseRepo(): BusinessExpenseRepository {
  return {
    getById: vi.fn(),
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    getByBusinessId: vi.fn(),
  };
}

describe('CustomerService', () => {
  it('createCustomer validates and trims', async () => {
    const repo = createMockCustomerRepo();
    (repo.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'x' as EntityId, createdAt: '', updatedAt: '', businessId: 'b' as EntityId, name: 'John' });
    const service = new CustomerService(repo);

    await service.createCustomer({ businessId: 'b' as EntityId, name: '  John  ' });
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'John' }));
  });

  it('createCustomer rejects empty name', async () => {
    const repo = createMockCustomerRepo();
    const service = new CustomerService(repo);

    await expect(service.createCustomer({ businessId: 'b' as EntityId, name: '' })).rejects.toThrow(ValidationError);
  });

  it('getCustomersByBusinessId delegates to repository', async () => {
    const repo = createMockCustomerRepo();
    (repo.getByBusinessId as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const service = new CustomerService(repo);

    await service.getCustomersByBusinessId('biz-1' as EntityId);
    expect(repo.getByBusinessId).toHaveBeenCalledWith('biz-1');
  });

  it('repository errors propagate', async () => {
    const repo = createMockCustomerRepo();
    (repo.getById as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB error'));
    const service = new CustomerService(repo);

    await expect(service.getCustomerById('x' as EntityId)).rejects.toThrow('DB error');
  });
});

describe('BusinessExpenseService', () => {
  const validInput = {
    businessId: 'biz-1' as EntityId,
    title: 'Rent',
    date: '2026-01-01T00:00:00.000Z',
    amount: { amountMinor: 5000, currency: 'USD' },
  };

  it('createBusinessExpense validates and delegates', async () => {
    const repo = createMockExpenseRepo();
    (repo.create as ReturnType<typeof vi.fn>).mockResolvedValue({ ...validInput, id: 'x' as EntityId, createdAt: '', updatedAt: '' });
    const service = new BusinessExpenseService(repo);

    await service.createBusinessExpense(validInput);
    expect(repo.create).toHaveBeenCalled();
  });

  it('createBusinessExpense rejects empty title', async () => {
    const repo = createMockExpenseRepo();
    const service = new BusinessExpenseService(repo);

    await expect(service.createBusinessExpense({ ...validInput, title: '' })).rejects.toThrow(ValidationError);
  });

  it('createBusinessExpense rejects negative amount', async () => {
    const repo = createMockExpenseRepo();
    const service = new BusinessExpenseService(repo);

    await expect(service.createBusinessExpense({ ...validInput, amount: { amountMinor: -1, currency: 'USD' } })).rejects.toThrow(ValidationError);
  });

  it('getBusinessExpensesByBusinessId delegates to repository', async () => {
    const repo = createMockExpenseRepo();
    (repo.getByBusinessId as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const service = new BusinessExpenseService(repo);

    await service.getBusinessExpensesByBusinessId('biz-1' as EntityId);
    expect(repo.getByBusinessId).toHaveBeenCalledWith('biz-1');
  });

  it('repository errors propagate', async () => {
    const repo = createMockExpenseRepo();
    (repo.remove as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB error'));
    const service = new BusinessExpenseService(repo);

    await expect(service.deleteBusinessExpense('x' as EntityId)).rejects.toThrow('DB error');
  });
});
