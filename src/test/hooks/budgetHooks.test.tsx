// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ServiceProvider } from '@/hooks/common/ServiceProvider';
import { useBudgets, useCreateBudget } from '@/hooks/budgets';
import { BudgetService } from '@/services/budgets/BudgetService';
import type { ServiceContainer } from '@/services/container';
import type { BudgetRepository } from '@/types/repositories/budgetRepository';
import type { Budget } from '@/types/domain/budget';
import type { EntityId } from '@/types/common/base';

const sampleBudget: Budget = {
  id: 'bud-1' as EntityId,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  categoryId: 'cat-1' as EntityId,
  limit: { amountMinor: 100000, currency: 'USD' },
  period: 'monthly',
  startDate: '2026-01-01',
  endDate: '2026-01-31',
};

function createContainer(overrides: Partial<ServiceContainer> = {}): ServiceContainer {
  return {
    businessService: {} as never,
    inventoryService: {} as never,
    salesService: {} as never,
    customerService: {} as never,
    businessExpenseService: {} as never,
    personalIncomeService: {} as never,
    personalExpenseService: {} as never,
    categoryService: {} as never,
    budgetService: {} as never,
    accountService: {} as never,
    ...overrides,
  };
}

function wrapper(container: ServiceContainer) {
  return ({ children }: { children: ReactNode }) => (
    <ServiceProvider services={container}>{children}</ServiceProvider>
  );
}

describe('useBudgets', () => {
  it('loads budgets via service', async () => {
    const mockRepo = {
      getById: vi.fn(),
      getAll: vi.fn().mockResolvedValue([sampleBudget]),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    } as unknown as BudgetRepository;
    const container = createContainer({
      budgetService: new BudgetService(mockRepo),
    });

    const { result } = renderHook(() => useBudgets(), {
      wrapper: wrapper(container),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([sampleBudget]);
    expect(mockRepo.getAll).toHaveBeenCalled();
  });

  it('exposes error on failure', async () => {
    const mockRepo = {
      getById: vi.fn(),
      getAll: vi.fn().mockRejectedValue(new Error('Budget read error')),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    } as unknown as BudgetRepository;
    const container = createContainer({
      budgetService: new BudgetService(mockRepo),
    });

    const { result } = renderHook(() => useBudgets(), {
      wrapper: wrapper(container),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error?.message).toBe('Budget read error');
  });
});

describe('useCreateBudget', () => {
  it('calls service.createBudget and returns result', async () => {
    const mockRepo = {
      getById: vi.fn(),
      getAll: vi.fn(),
      create: vi.fn().mockResolvedValue(sampleBudget),
      update: vi.fn(),
      remove: vi.fn(),
    } as unknown as BudgetRepository;
    const container = createContainer({
      budgetService: new BudgetService(mockRepo),
    });

    const { result } = renderHook(() => useCreateBudget(), {
      wrapper: wrapper(container),
    });

    let created: Budget | undefined;
    await act(async () => {
      created = await result.current.mutate({
        categoryId: 'cat-1' as EntityId,
        limit: { amountMinor: 100000, currency: 'USD' },
        period: 'monthly',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      });
    });

    expect(created).toEqual(sampleBudget);
    expect(mockRepo.create).toHaveBeenCalled();
  });
});
