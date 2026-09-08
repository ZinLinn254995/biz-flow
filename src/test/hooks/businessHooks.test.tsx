// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ServiceProvider } from '@/hooks/common/ServiceProvider';
import { useBusinesses, useBusiness } from '@/hooks/business';
import {
  useCreateBusiness,
  useUpdateBusiness,
  useDeleteBusiness,
} from '@/hooks/business';
import { BusinessService } from '@/services/business/BusinessService';
import type { ServiceContainer } from '@/services/container';
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
    removeCascade: vi.fn(),
  };
}

const sampleBusiness: Business = {
  id: 'biz-1' as EntityId,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Test Shop',
  currency: 'USD',
};

function createContainer(repo: BusinessRepository): ServiceContainer {
  return {
    businessService: new BusinessService(repo),
    inventoryService: {} as never,
    salesService: {} as never,
    customerService: {} as never,
    businessExpenseService: {} as never,
    personalIncomeService: {} as never,
    personalExpenseService: {} as never,
    categoryService: {} as never,
    budgetService: {} as never,
    accountService: {} as never,
  };
}

function wrapper(container: ServiceContainer) {
  return ({ children }: { children: ReactNode }) => (
    <ServiceProvider services={container}>{children}</ServiceProvider>
  );
}

describe('useBusinesses', () => {
  it('loads businesses via service', async () => {
    const repo = createMockRepo();
    repo.getAll = vi.fn().mockResolvedValue([sampleBusiness]);
    const container = createContainer(repo);

    const { result } = renderHook(() => useBusinesses(), {
      wrapper: wrapper(container),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([sampleBusiness]);
    expect(repo.getAll).toHaveBeenCalled();
  });

  it('exposes error on failure', async () => {
    const repo = createMockRepo();
    repo.getAll = vi.fn().mockRejectedValue(new Error('DB error'));
    const container = createContainer(repo);

    const { result } = renderHook(() => useBusinesses(), {
      wrapper: wrapper(container),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error?.message).toBe('DB error');
  });

  it('refresh triggers a reload', async () => {
    let callCount = 0;
    const repo = createMockRepo();
    repo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return [];
    });
    const container = createContainer(repo);

    const { result } = renderHook(() => useBusinesses(), {
      wrapper: wrapper(container),
    });

    await waitFor(() => expect(callCount).toBe(1));
    act(() => result.current.refresh());
    await waitFor(() => expect(callCount).toBe(2));
  });
});

describe('useBusiness', () => {
  it('loads a single business by id', async () => {
    const repo = createMockRepo();
    repo.getById = vi.fn().mockResolvedValue(sampleBusiness);
    const container = createContainer(repo);

    const { result } = renderHook(() => useBusiness('biz-1' as EntityId), {
      wrapper: wrapper(container),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(sampleBusiness);
    expect(repo.getById).toHaveBeenCalledWith('biz-1');
  });

  it('returns null when id is null', async () => {
    const repo = createMockRepo();
    const container = createContainer(repo);

    const { result } = renderHook(() => useBusiness(null), {
      wrapper: wrapper(container),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(repo.getById).not.toHaveBeenCalled();
  });
});

describe('useCreateBusiness', () => {
  it('calls service.createBusiness and returns result', async () => {
    const repo = createMockRepo();
    repo.create = vi.fn().mockResolvedValue(sampleBusiness);
    const container = createContainer(repo);

    const { result } = renderHook(() => useCreateBusiness(), {
      wrapper: wrapper(container),
    });

    let created: Business | undefined;
    await act(async () => {
      created = await result.current.mutate({ name: 'New', currency: 'USD' });
    });

    expect(created).toEqual(sampleBusiness);
    expect(repo.create).toHaveBeenCalled();
  });

  it('exposes error on validation failure', async () => {
    const repo = createMockRepo();
    const container = createContainer(repo);

    const { result } = renderHook(() => useCreateBusiness(), {
      wrapper: wrapper(container),
    });

    let thrown: unknown = null;
    await act(async () => {
      try {
        await result.current.mutate({ name: '', currency: 'USD' });
      } catch (err) {
        thrown = err;
      }
    });

    expect(thrown).toBeInstanceOf(Error);
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe('useUpdateBusiness', () => {
  it('calls service.updateBusiness', async () => {
    const repo = createMockRepo();
    repo.update = vi.fn().mockResolvedValue({ ...sampleBusiness, name: 'Updated' });
    const container = createContainer(repo);

    const { result } = renderHook(() => useUpdateBusiness(), {
      wrapper: wrapper(container),
    });

    await act(async () => {
      await result.current.mutate('biz-1' as EntityId, { name: 'Updated' });
    });

    expect(repo.update).toHaveBeenCalledWith('biz-1', { name: 'Updated' });
  });
});

describe('useDeleteBusiness', () => {
  it('calls service.deleteBusiness', async () => {
    const repo = createMockRepo();
    repo.removeCascade = vi.fn().mockResolvedValue(undefined);
    const container = createContainer(repo);

    const { result } = renderHook(() => useDeleteBusiness(), {
      wrapper: wrapper(container),
    });

    await act(async () => {
      await result.current.mutate('biz-1' as EntityId);
    });

    expect(repo.removeCascade).toHaveBeenCalledWith('biz-1');
  });
});
