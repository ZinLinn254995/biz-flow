// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ServiceProvider } from '@/hooks/common/ServiceProvider';
import DashboardPage from '@/pages/DashboardPage';
import { BusinessService } from '@/services/business/BusinessService';
import { SalesService } from '@/services/sales/SalesService';
import { BusinessExpenseService } from '@/services/businessExpenses/BusinessExpenseService';
import { InventoryService } from '@/services/inventory/InventoryService';
import { PersonalIncomeService } from '@/services/personalFinance/PersonalIncomeService';
import { PersonalExpenseService } from '@/services/personalFinance/PersonalExpenseService';
import type { ServiceContainer } from '@/services/container';
import type { BusinessRepository } from '@/types/repositories/businessRepository';
import type { SaleRepository } from '@/types/repositories/saleRepository';
import type { BusinessExpenseRepository } from '@/types/repositories/businessExpenseRepository';
import type { InventoryRepository } from '@/types/repositories/inventoryRepository';
import type { PersonalIncomeRepository } from '@/types/repositories/personalIncomeRepository';
import type { PersonalExpenseRepository } from '@/types/repositories/personalExpenseRepository';
import type { EntityId } from '@/types/common/base';

function createMockRepo(): any {
  return {
    getById: vi.fn(),
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
}

function createContainer(): ServiceContainer {
  return {
    businessService: new BusinessService(createMockRepo()),
    salesService: new SalesService(createMockRepo()),
    businessExpenseService: new BusinessExpenseService(createMockRepo()),
    inventoryService: new InventoryService(createMockRepo()),
    personalIncomeService: new PersonalIncomeService(createMockRepo()),
    personalExpenseService: new PersonalExpenseService(createMockRepo()),
    customerService: {} as never,
    categoryService: {} as never,
    budgetService: {} as never,
    accountService: {} as never,
  };
}

function renderDashboard(container: ServiceContainer) {
  return render(
    <MemoryRouter>
      <ServiceProvider services={container}>
        <DashboardPage />
      </ServiceProvider>
    </MemoryRouter>,
  );
}

describe('DashboardPage — real data', () => {
  it('renders dashboard with empty data', async () => {
    const container = createContainer();
    renderDashboard(container);

    await waitFor(() => expect(screen.getByText('Business Sales')).toBeDefined());
    expect(screen.getAllByText('No sales recorded').length).toBeGreaterThan(0);
    expect(screen.getByText('Businesses')).toBeDefined();
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
  });

  it('displays business sales totals', async () => {
    const container = createContainer();
    (container.businessService as any) = {
      getAllBusinesses: vi.fn().mockResolvedValue([
        { id: 'b1' as EntityId, createdAt: '', updatedAt: '', name: 'Shop', currency: 'USD' },
      ]),
    };
    (container.salesService as any) = {
      getAllSales: vi.fn().mockResolvedValue([
        { id: 's1' as EntityId, createdAt: '', updatedAt: '', businessId: 'b1' as EntityId, date: '2026-01-01', items: [], totalAmount: { amountMinor: 50000, currency: 'USD' }, paymentStatus: 'paid' },
      ]),
      getSaleById: vi.fn(),
      getSalesByBusinessId: vi.fn(),
      createSale: vi.fn(),
      updateSale: vi.fn(),
      deleteSale: vi.fn(),
    };

    renderDashboard(container);

    await waitFor(() => expect(screen.getAllByText('USD 500.00').length).toBeGreaterThan(0));
  });

  it('displays personal income and expense totals', async () => {
    const container = createContainer();
    (container.personalIncomeService as any) = {
      getAll: vi.fn().mockResolvedValue([
        { id: 'i1' as EntityId, createdAt: '', updatedAt: '', source: 'Salary', date: '2026-01-01', amount: { amountMinor: 100000, currency: 'USD' } },
      ]),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };
    (container.personalExpenseService as any) = {
      getAll: vi.fn().mockResolvedValue([
        { id: 'e1' as EntityId, createdAt: '', updatedAt: '', title: 'Rent', date: '2026-01-01', amount: { amountMinor: 30000, currency: 'USD' } },
      ]),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    renderDashboard(container);

    await waitFor(() => expect(screen.getAllByText('USD 1000.00').length).toBeGreaterThan(0));
    expect(screen.getAllByText('USD 300.00').length).toBeGreaterThan(0);
  });

  it('displays business count', async () => {
    const container = createContainer();
    (container.businessService as any) = {
      getAllBusinesses: vi.fn().mockResolvedValue([
        { id: 'b1' as EntityId, createdAt: '', updatedAt: '', name: 'Shop A', currency: 'USD' },
        { id: 'b2' as EntityId, createdAt: '', updatedAt: '', name: 'Shop B', currency: 'EUR' },
      ]),
    };

    renderDashboard(container);

    await waitFor(() => expect(screen.getAllByText('2').length).toBeGreaterThan(0));
  });

  it('displays low stock count', async () => {
    const container = createContainer();
    (container.inventoryService as any) = {
      getAllInventoryItems: vi.fn().mockResolvedValue([
        { id: 'i1' as EntityId, createdAt: '', updatedAt: '', businessId: 'b1' as EntityId, name: 'Item A', quantity: 0, unit: 'pcs', costPrice: { amountMinor: 100, currency: 'USD' }, salePrice: { amountMinor: 200, currency: 'USD' }, stockStatus: 'out_of_stock' },
        { id: 'i2' as EntityId, createdAt: '', updatedAt: '', businessId: 'b1' as EntityId, name: 'Item B', quantity: 5, unit: 'pcs', costPrice: { amountMinor: 100, currency: 'USD' }, salePrice: { amountMinor: 200, currency: 'USD' }, stockStatus: 'low_stock' },
        { id: 'i3' as EntityId, createdAt: '', updatedAt: '', businessId: 'b1' as EntityId, name: 'Item C', quantity: 50, unit: 'pcs', costPrice: { amountMinor: 100, currency: 'USD' }, salePrice: { amountMinor: 200, currency: 'USD' }, stockStatus: 'in_stock' },
      ]),
      getInventoryItemById: vi.fn(),
      getInventoryItemsByBusinessId: vi.fn(),
      createInventoryItem: vi.fn(),
      updateInventoryItem: vi.fn(),
      deleteInventoryItem: vi.fn(),
    };

    renderDashboard(container);

    await waitFor(() => expect(screen.getByText('Low / Out of Stock')).toBeDefined());
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
  });

  it('displays recent sales', async () => {
    const container = createContainer();
    (container.businessService as any) = {
      getAllBusinesses: vi.fn().mockResolvedValue([
        { id: 'b1' as EntityId, createdAt: '', updatedAt: '', name: 'Test Shop', currency: 'USD' },
      ]),
    };
    (container.salesService as any) = {
      getAllSales: vi.fn().mockResolvedValue([
        { id: 's1' as EntityId, createdAt: '', updatedAt: '', businessId: 'b1' as EntityId, date: '2026-01-15', items: [{ inventoryItemId: 'i1' as EntityId, name: 'Item', quantity: 1, unitPrice: { amountMinor: 100, currency: 'USD' }, lineTotal: { amountMinor: 100, currency: 'USD' } }], totalAmount: { amountMinor: 100, currency: 'USD' }, paymentStatus: 'paid' },
      ]),
      getSaleById: vi.fn(),
      getSalesByBusinessId: vi.fn(),
      createSale: vi.fn(),
      updateSale: vi.fn(),
      deleteSale: vi.fn(),
    };

    renderDashboard(container);

    await waitFor(() => expect(screen.getByText('Recent Sales')).toBeDefined());
    expect(screen.getByText('1 item(s) · paid')).toBeDefined();
  });

  it('separates multi-currency totals', async () => {
    const container = createContainer();
    (container.salesService as any) = {
      getAllSales: vi.fn().mockResolvedValue([
        { id: 's1' as EntityId, createdAt: '', updatedAt: '', businessId: 'b1' as EntityId, date: '2026-01-01', items: [], totalAmount: { amountMinor: 50000, currency: 'USD' }, paymentStatus: 'paid' },
        { id: 's2' as EntityId, createdAt: '', updatedAt: '', businessId: 'b1' as EntityId, date: '2026-01-02', items: [], totalAmount: { amountMinor: 20000, currency: 'EUR' }, paymentStatus: 'paid' },
      ]),
      getSaleById: vi.fn(),
      getSalesByBusinessId: vi.fn(),
      createSale: vi.fn(),
      updateSale: vi.fn(),
      deleteSale: vi.fn(),
    };

    renderDashboard(container);

    await waitFor(() => expect(screen.getAllByText('USD 500.00').length).toBeGreaterThan(0));
    expect(screen.getAllByText('EUR 200.00').length).toBeGreaterThan(0);
  });
});
