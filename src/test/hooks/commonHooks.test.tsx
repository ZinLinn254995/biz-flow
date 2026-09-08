// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ServiceProvider, useServiceContainer } from '@/hooks/common/ServiceProvider';
import { useAsync } from '@/hooks/common/useAsync';
import { useMutation } from '@/hooks/common/useMutation';
import type { ServiceContainer } from '@/services/container';
import { BusinessService } from '@/services/business/BusinessService';
import type { BusinessRepository } from '@/types/repositories/businessRepository';
import type { Business } from '@/types/domain/business';
import type { EntityId } from '@/types/common/base';

function createMockBusinessRepo(): BusinessRepository {
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

function createMockContainer(repo?: Partial<BusinessRepository>): ServiceContainer {
  const businessRepo = { ...createMockBusinessRepo(), ...repo } as BusinessRepository;
  const businessService = new BusinessService(businessRepo);
  return {
    businessService,
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

describe('useAsync', () => {
  it('starts in loading state and resolves with data', async () => {
    const container = createMockContainer({
      getAll: vi.fn().mockResolvedValue([sampleBusiness]),
    });

    const { result } = renderHook(
      () => {
        const { businessService } = useServiceContainer();
        return useAsync<Business[]>(() => businessService.getAllBusinesses());
      },
      { wrapper: wrapper(container) },
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([sampleBusiness]);
    expect(result.current.error).toBeNull();
  });

  it('exposes error on failure', async () => {
    const container = createMockContainer({
      getAll: vi.fn().mockRejectedValue(new Error('Fetch failed')),
    });

    const { result } = renderHook(
      () => {
        const { businessService } = useServiceContainer();
        return useAsync<Business[]>(() => businessService.getAllBusinesses());
      },
      { wrapper: wrapper(container) },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Fetch failed');
    expect(result.current.data).toBeNull();
  });

  it('refresh re-fetches data', async () => {
    let callCount = 0;
    const container = createMockContainer({
      getAll: vi.fn().mockImplementation(async () => {
        callCount++;
        return [sampleBusiness];
      }),
    });

    const { result } = renderHook(
      () => {
        const { businessService } = useServiceContainer();
        return useAsync<Business[]>(() => businessService.getAllBusinesses());
      },
      { wrapper: wrapper(container) },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(callCount).toBe(1);

    act(() => result.current.refresh());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(callCount).toBe(2);
  });
});

describe('useMutation', () => {
  it('starts idle and mutates successfully', async () => {
    const container = createMockContainer({
      create: vi.fn().mockResolvedValue(sampleBusiness),
    });

    const { result } = renderHook(
      () => {
        const { businessService } = useServiceContainer();
        return useMutation<
          [input: { name: string; currency: string }],
          Business
        >((input) => businessService.createBusiness(input));
      },
      { wrapper: wrapper(container) },
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();

    let created: Business | undefined;
    await act(async () => {
      created = await result.current.mutate({ name: 'New', currency: 'USD' });
    });

    expect(created).toEqual(sampleBusiness);
    expect(result.current.data).toEqual(sampleBusiness);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('exposes error on mutation failure', async () => {
    const container = createMockContainer({
      create: vi.fn().mockRejectedValue(new Error('Create failed')),
    });

    const { result } = renderHook(
      () => {
        const { businessService } = useServiceContainer();
        return useMutation<
          [input: { name: string; currency: string }],
          Business
        >((input) => businessService.createBusiness(input));
      },
      { wrapper: wrapper(container) },
    );

    let thrown: unknown = null;
    await act(async () => {
      try {
        await result.current.mutate({ name: 'New', currency: 'USD' });
      } catch (err) {
        thrown = err;
      }
    });

    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).message).toBe('Create failed');
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Create failed');
    expect(result.current.isLoading).toBe(false);
  });

  it('reset clears error and data', async () => {
    const container = createMockContainer({
      create: vi.fn().mockResolvedValue(sampleBusiness),
    });

    const { result } = renderHook(
      () => {
        const { businessService } = useServiceContainer();
        return useMutation<
          [input: { name: string; currency: string }],
          Business
        >((input) => businessService.createBusiness(input));
      },
      { wrapper: wrapper(container) },
    );

    await act(async () => {
      await result.current.mutate({ name: 'New', currency: 'USD' });
    });
    expect(result.current.data).not.toBeNull();

    act(() => result.current.reset());
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
