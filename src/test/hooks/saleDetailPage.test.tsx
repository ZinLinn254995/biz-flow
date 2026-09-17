// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ServiceProvider } from '@/hooks/common/ServiceProvider';
import SaleDetailPage from '@/pages/SaleDetailPage';
import { SalesService } from '@/services/sales/SalesService';
import { BusinessService } from '@/services/business/BusinessService';
import { CustomerService } from '@/services/customers/CustomerService';
import { InventoryService } from '@/services/inventory/InventoryService';
import type { ServiceContainer } from '@/services/container';
import type { SaleRepository } from '@/types/repositories/saleRepository';
import type { BusinessRepository } from '@/types/repositories/businessRepository';
import type { CustomerRepository } from '@/types/repositories/customerRepository';
import type { InventoryRepository } from '@/types/repositories/inventoryRepository';
import type { Sale } from '@/types/domain/sale';
import type { EntityId } from '@/types/common/base';

const sale: Sale = {
  id: 'sale-1' as EntityId,
  createdAt: '2026-01-15T00:00:00.000Z',
  updatedAt: '2026-01-15T00:00:00.000Z',
  businessId: 'business-1' as EntityId,
  customerId: 'customer-1' as EntityId,
  date: '2026-01-15',
  items: [
    {
      inventoryItemId: 'item-1' as EntityId,
      name: 'Coffee Beans',
      quantity: 2,
      unitPrice: { amountMinor: 2000, currency: 'USD' },
      lineTotal: { amountMinor: 4000, currency: 'USD' },
    },
  ],
  totalAmount: { amountMinor: 4000, currency: 'USD' },
  paymentStatus: 'paid',
  notes: 'Leave at the front desk',
};

function createContainer(saleRepo: SaleRepository): ServiceContainer {
  const businessRepository: BusinessRepository = {
    getById: vi.fn(),
    getAll: vi.fn().mockResolvedValue([{ id: 'business-1', name: 'Test Shop' }]),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    removeCascade: vi.fn(),
  };
  const customerRepository: CustomerRepository = {
    getById: vi.fn().mockResolvedValue({ id: 'customer-1', name: 'Alex Doe' }),
    getAll: vi.fn(),
    getByBusinessId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
  const inventoryRepository: InventoryRepository = {
    getById: vi.fn(),
    getAll: vi.fn(),
    getByBusinessId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  return {
    businessService: new BusinessService(businessRepository),
    inventoryService: new InventoryService(inventoryRepository),
    salesService: new SalesService(saleRepo, inventoryRepository),
    customerService: new CustomerService(customerRepository),
    businessExpenseService: {} as never,
    personalIncomeService: {} as never,
    personalExpenseService: {} as never,
    categoryService: {} as never,
    budgetService: {} as never,
    accountService: {} as never,
  };
}

function renderDetail(saleRepo: SaleRepository) {
  return render(
    <MemoryRouter initialEntries={['/sales/sale-1']}>
      <ServiceProvider services={createContainer(saleRepo)}>
        <Routes>
          <Route path="/sales/:saleId" element={<SaleDetailPage />} />
        </Routes>
      </ServiceProvider>
    </MemoryRouter>,
  );
}

function createSaleRepository(result: Sale | null): SaleRepository {
  return {
    getById: vi.fn().mockResolvedValue(result),
    getAll: vi.fn(),
    getByBusinessId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
}

describe('SaleDetailPage', () => {
  it('renders a read-only receipt with related names and sale values', async () => {
    renderDetail(createSaleRepository(sale));

    expect(screen.getByText('Loading sale…')).toBeDefined();
    await waitFor(() => expect(screen.getByText('Alex Doe')).toBeDefined());
    expect(screen.getByRole('heading', { name: 'Test Shop' })).toBeDefined();
    expect(screen.getByText('Coffee Beans')).toBeDefined();
    expect(screen.getAllByText('USD 40.00')).toHaveLength(2);
    expect(screen.getByText('Leave at the front desk')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Print' })).toBeDefined();
    expect(screen.queryByRole('button', { name: /edit/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /delete/i })).toBeNull();
  });

  it('prints the receipt through the browser print API', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    renderDetail(createSaleRepository(sale));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Print' })).toBeDefined());
    fireEvent.click(screen.getByRole('button', { name: 'Print' }));

    expect(print).toHaveBeenCalledOnce();
    print.mockRestore();
  });

  it('shows a not-found state when the sale does not exist', async () => {
    renderDetail(createSaleRepository(null));

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Sale not found' })).toBeDefined());
    expect(screen.getByRole('link', { name: /back to sales/i })).toBeDefined();
  });
});