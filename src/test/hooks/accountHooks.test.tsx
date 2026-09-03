// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ServiceProvider } from '@/hooks/common/ServiceProvider';
import { useAccounts, useCreateAccount } from '@/hooks/accounts';
import { AccountService } from '@/services/accounts/AccountService';
import type { ServiceContainer } from '@/services/container';
import type { AccountRepository } from '@/types/repositories/accountRepository';
import type { Account } from '@/types/domain/account';
import type { EntityId } from '@/types/common/base';

const sampleAccount: Account = {
  id: 'acc-1' as EntityId,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Checking',
  type: 'bank',
  balance: { amountMinor: 250000, currency: 'USD' },
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

describe('useAccounts', () => {
  it('loads accounts via service', async () => {
    const mockRepo = {
      getById: vi.fn(),
      getAll: vi.fn().mockResolvedValue([sampleAccount]),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    } as unknown as AccountRepository;
    const container = createContainer({
      accountService: new AccountService(mockRepo),
    });

    const { result } = renderHook(() => useAccounts(), {
      wrapper: wrapper(container),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([sampleAccount]);
    expect(mockRepo.getAll).toHaveBeenCalled();
  });

  it('exposes error on failure', async () => {
    const mockRepo = {
      getById: vi.fn(),
      getAll: vi.fn().mockRejectedValue(new Error('Account read error')),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    } as unknown as AccountRepository;
    const container = createContainer({
      accountService: new AccountService(mockRepo),
    });

    const { result } = renderHook(() => useAccounts(), {
      wrapper: wrapper(container),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error?.message).toBe('Account read error');
  });
});

describe('useCreateAccount', () => {
  it('calls service.createAccount and returns result', async () => {
    const mockRepo = {
      getById: vi.fn(),
      getAll: vi.fn(),
      create: vi.fn().mockResolvedValue(sampleAccount),
      update: vi.fn(),
      remove: vi.fn(),
    } as unknown as AccountRepository;
    const container = createContainer({
      accountService: new AccountService(mockRepo),
    });

    const { result } = renderHook(() => useCreateAccount(), {
      wrapper: wrapper(container),
    });

    let created: Account | undefined;
    await act(async () => {
      created = await result.current.mutate({
        name: 'Checking',
        type: 'bank',
        balance: { amountMinor: 250000, currency: 'USD' },
      });
    });

    expect(created).toEqual(sampleAccount);
    expect(mockRepo.create).toHaveBeenCalled();
  });

  it('exposes error on validation failure', async () => {
    const mockRepo = {
      getById: vi.fn(),
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    } as unknown as AccountRepository;
    const container = createContainer({
      accountService: new AccountService(mockRepo),
    });

    const { result } = renderHook(() => useCreateAccount(), {
      wrapper: wrapper(container),
    });

    let thrown: unknown = null;
    await act(async () => {
      try {
        await result.current.mutate({
          name: '',
          type: 'bank',
          balance: { amountMinor: 250000, currency: 'USD' },
        });
      } catch (err) {
        thrown = err;
      }
    });

    expect(thrown).toBeInstanceOf(Error);
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
