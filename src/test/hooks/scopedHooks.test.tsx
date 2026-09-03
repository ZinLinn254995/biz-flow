// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ServiceProvider } from '@/hooks/common/ServiceProvider';
import { useInventoryItemsByBusiness } from '@/hooks/inventory';
import { useSalesByBusiness } from '@/hooks/sales';
import { useCustomersByBusiness } from '@/hooks/customers';
import { useBusinessExpensesByBusiness } from '@/hooks/businessExpenses';
import { useCategoriesByScope } from '@/hooks/categories';
import { InventoryService } from '@/services/inventory/InventoryService';
import { SalesService } from '@/services/sales/SalesService';
import { CustomerService } from '@/services/customers/CustomerService';
import { BusinessExpenseService } from '@/services/businessExpenses/BusinessExpenseService';
import { CategoryService } from '@/services/categories/CategoryService';
import type { ServiceContainer } from '@/services/container';
import type { InventoryRepository } from '@/types/repositories/inventoryRepository';
import type { SaleRepository } from '@/types/repositories/saleRepository';
import type { CustomerRepository } from '@/types/repositories/customerRepository';
import type { BusinessExpenseRepository } from '@/types/repositories/businessExpenseRepository';
import type { CategoryRepository } from '@/types/repositories/categoryRepository';
import type { EntityId } from '@/types/common/base';

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

describe('business-scoped hooks delegate to service', () => {
  it('useInventoryItemsByBusiness calls inventoryService.getInventoryItemsByBusinessId', async () => {
    const mockRepo = {
      getById: vi.fn(),
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      getByBusinessId: vi.fn().mockResolvedValue([]),
    } as unknown as InventoryRepository;
    const container = createContainer({
      inventoryService: new InventoryService(mockRepo),
    });

    const { result } = renderHook(
      () => useInventoryItemsByBusiness('biz-1' as EntityId),
      { wrapper: wrapper(container) },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockRepo.getByBusinessId).toHaveBeenCalledWith('biz-1');
  });

  it('useSalesByBusiness calls salesService.getSalesByBusinessId', async () => {
    const mockRepo = {
      getById: vi.fn(),
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      getByBusinessId: vi.fn().mockResolvedValue([]),
    } as unknown as SaleRepository;
    const container = createContainer({
      salesService: new SalesService(mockRepo),
    });

    const { result } = renderHook(
      () => useSalesByBusiness('biz-1' as EntityId),
      { wrapper: wrapper(container) },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockRepo.getByBusinessId).toHaveBeenCalledWith('biz-1');
  });

  it('useCustomersByBusiness calls customerService.getCustomersByBusinessId', async () => {
    const mockRepo = {
      getById: vi.fn(),
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      getByBusinessId: vi.fn().mockResolvedValue([]),
    } as unknown as CustomerRepository;
    const container = createContainer({
      customerService: new CustomerService(mockRepo),
    });

    const { result } = renderHook(
      () => useCustomersByBusiness('biz-1' as EntityId),
      { wrapper: wrapper(container) },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockRepo.getByBusinessId).toHaveBeenCalledWith('biz-1');
  });

  it('useBusinessExpensesByBusiness calls businessExpenseService.getByBusinessId', async () => {
    const mockRepo = {
      getById: vi.fn(),
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      getByBusinessId: vi.fn().mockResolvedValue([]),
    } as unknown as BusinessExpenseRepository;
    const container = createContainer({
      businessExpenseService: new BusinessExpenseService(mockRepo),
    });

    const { result } = renderHook(
      () => useBusinessExpensesByBusiness('biz-1' as EntityId),
      { wrapper: wrapper(container) },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockRepo.getByBusinessId).toHaveBeenCalledWith('biz-1');
  });
});

describe('category scope hook delegates to service', () => {
  it('useCategoriesByScope calls categoryService.getCategoriesByScope', async () => {
    const mockRepo = {
      getById: vi.fn(),
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      getByScope: vi.fn().mockResolvedValue([]),
    } as unknown as CategoryRepository;
    const container = createContainer({
      categoryService: new CategoryService(mockRepo),
    });

    const { result } = renderHook(
      () => useCategoriesByScope('business'),
      { wrapper: wrapper(container) },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockRepo.getByScope).toHaveBeenCalledWith('business');
  });

  it('returns empty array when scope is null', async () => {
    const mockRepo = {
      getById: vi.fn(),
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      getByScope: vi.fn(),
    } as unknown as CategoryRepository;
    const container = createContainer({
      categoryService: new CategoryService(mockRepo),
    });

    const { result } = renderHook(
      () => useCategoriesByScope(null),
      { wrapper: wrapper(container) },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([]);
    expect(mockRepo.getByScope).not.toHaveBeenCalled();
  });
});
