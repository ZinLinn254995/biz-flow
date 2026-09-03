// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ServiceProvider } from '@/hooks/common/ServiceProvider';
import {
  usePersonalIncomeRecords,
  usePersonalExpenses,
  useCreatePersonalIncome,
  useCreatePersonalExpense,
} from '@/hooks/personalFinance';
import { PersonalIncomeService } from '@/services/personalFinance/PersonalIncomeService';
import { PersonalExpenseService } from '@/services/personalFinance/PersonalExpenseService';
import type { ServiceContainer } from '@/services/container';
import type { PersonalIncomeRepository } from '@/types/repositories/personalIncomeRepository';
import type { PersonalExpenseRepository } from '@/types/repositories/personalExpenseRepository';
import type { PersonalIncome, PersonalExpense } from '@/types/domain/personalFinance';
import type { EntityId } from '@/types/common/base';

const sampleIncome: PersonalIncome = {
  id: 'inc-1' as EntityId,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  source: 'Salary',
  date: '2026-01-15',
  amount: { amountMinor: 500000, currency: 'USD' },
};

const sampleExpense: PersonalExpense = {
  id: 'exp-1' as EntityId,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  title: 'Groceries',
  date: '2026-01-10',
  amount: { amountMinor: 15000, currency: 'USD' },
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

describe('usePersonalIncomeRecords', () => {
  it('loads income records via service', async () => {
    const mockRepo = {
      getById: vi.fn(),
      getAll: vi.fn().mockResolvedValue([sampleIncome]),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    } as unknown as PersonalIncomeRepository;
    const container = createContainer({
      personalIncomeService: new PersonalIncomeService(mockRepo),
    });

    const { result } = renderHook(() => usePersonalIncomeRecords(), {
      wrapper: wrapper(container),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([sampleIncome]);
    expect(mockRepo.getAll).toHaveBeenCalled();
  });

  it('exposes error on failure', async () => {
    const mockRepo = {
      getById: vi.fn(),
      getAll: vi.fn().mockRejectedValue(new Error('Read error')),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    } as unknown as PersonalIncomeRepository;
    const container = createContainer({
      personalIncomeService: new PersonalIncomeService(mockRepo),
    });

    const { result } = renderHook(() => usePersonalIncomeRecords(), {
      wrapper: wrapper(container),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error?.message).toBe('Read error');
  });
});

describe('useCreatePersonalIncome', () => {
  it('calls service.create and returns result', async () => {
    const mockRepo = {
      getById: vi.fn(),
      getAll: vi.fn(),
      create: vi.fn().mockResolvedValue(sampleIncome),
      update: vi.fn(),
      remove: vi.fn(),
    } as unknown as PersonalIncomeRepository;
    const container = createContainer({
      personalIncomeService: new PersonalIncomeService(mockRepo),
    });

    const { result } = renderHook(() => useCreatePersonalIncome(), {
      wrapper: wrapper(container),
    });

    let created: PersonalIncome | undefined;
    await act(async () => {
      created = await result.current.mutate({
        source: 'Salary',
        date: '2026-01-15',
        amount: { amountMinor: 500000, currency: 'USD' },
      });
    });

    expect(created).toEqual(sampleIncome);
    expect(mockRepo.create).toHaveBeenCalled();
  });

  it('exposes error on validation failure', async () => {
    const mockRepo = {
      getById: vi.fn(),
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    } as unknown as PersonalIncomeRepository;
    const container = createContainer({
      personalIncomeService: new PersonalIncomeService(mockRepo),
    });

    const { result } = renderHook(() => useCreatePersonalIncome(), {
      wrapper: wrapper(container),
    });

    let thrown: unknown = null;
    await act(async () => {
      try {
        await result.current.mutate({
          source: '',
          date: '2026-01-15',
          amount: { amountMinor: 500000, currency: 'USD' },
        });
      } catch (err) {
        thrown = err;
      }
    });

    expect(thrown).toBeInstanceOf(Error);
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe('usePersonalExpenses', () => {
  it('loads expense records via service', async () => {
    const mockRepo = {
      getById: vi.fn(),
      getAll: vi.fn().mockResolvedValue([sampleExpense]),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    } as unknown as PersonalExpenseRepository;
    const container = createContainer({
      personalExpenseService: new PersonalExpenseService(mockRepo),
    });

    const { result } = renderHook(() => usePersonalExpenses(), {
      wrapper: wrapper(container),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([sampleExpense]);
    expect(mockRepo.getAll).toHaveBeenCalled();
  });
});

describe('useCreatePersonalExpense', () => {
  it('calls service.create and returns result', async () => {
    const mockRepo = {
      getById: vi.fn(),
      getAll: vi.fn(),
      create: vi.fn().mockResolvedValue(sampleExpense),
      update: vi.fn(),
      remove: vi.fn(),
    } as unknown as PersonalExpenseRepository;
    const container = createContainer({
      personalExpenseService: new PersonalExpenseService(mockRepo),
    });

    const { result } = renderHook(() => useCreatePersonalExpense(), {
      wrapper: wrapper(container),
    });

    let created: PersonalExpense | undefined;
    await act(async () => {
      created = await result.current.mutate({
        title: 'Groceries',
        date: '2026-01-10',
        amount: { amountMinor: 15000, currency: 'USD' },
      });
    });

    expect(created).toEqual(sampleExpense);
    expect(mockRepo.create).toHaveBeenCalled();
  });
});
