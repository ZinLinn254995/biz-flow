// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ServiceProvider } from '@/hooks/common/ServiceProvider';
import SalesPage from '@/pages/SalesPage';
import { SalesService } from '@/services/sales/SalesService';
import { BusinessService } from '@/services/business/BusinessService';
import { CustomerService } from '@/services/customers/CustomerService';
import { InventoryService } from '@/services/inventory/InventoryService';
import type { ServiceContainer } from '@/services/container';
import type { SaleRepository } from '@/types/repositories/saleRepository';
import type { BusinessRepository } from '@/types/repositories/businessRepository';
import type { CustomerRepository } from '@/types/repositories/customerRepository';
import type { InventoryRepository } from '@/types/repositories/inventoryRepository';
import type { Sale, SaleItem } from '@/types/domain/sale';
import type { Business } from '@/types/domain/business';
import type { Customer } from '@/types/domain/customer';
import type { InventoryItem } from '@/types/domain/inventory';
import type { EntityId } from '@/types/common/base';

function createMockSaleRepo(): SaleRepository {
  return {
    getById: vi.fn(),
    getAll: vi.fn().mockResolvedValue([]),
    getByBusinessId: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
}

function createMockBusinessRepo(): BusinessRepository {
  return {
    getById: vi.fn(),
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
}

function createMockCustomerRepo(): CustomerRepository {
  return {
    getById: vi.fn(),
    getAll: vi.fn().mockResolvedValue([]),
    getByBusinessId: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
}

function createMockInventoryRepo(): InventoryRepository {
  return {
    getById: vi.fn(),
    getAll: vi.fn().mockResolvedValue([]),
    getByBusinessId: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
}

const sampleBusiness: Business = {
  id: 'biz-1' as EntityId,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Test Shop',
  currency: 'USD',
};

const sampleCustomer: Customer = {
  id: 'cust-1' as EntityId,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  businessId: 'biz-1' as EntityId,
  name: 'John Doe',
};

const sampleInventoryItem: InventoryItem = {
  id: 'inv-1' as EntityId,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  businessId: 'biz-1' as EntityId,
  name: 'Coffee Beans',
  quantity: 50,
  unit: 'kg',
  costPrice: { amountMinor: 1000, currency: 'USD' },
  salePrice: { amountMinor: 2000, currency: 'USD' },
  stockStatus: 'in_stock',
};

const sampleSaleItem: SaleItem = {
  inventoryItemId: 'inv-1' as EntityId,
  name: 'Coffee Beans',
  quantity: 2,
  unitPrice: { amountMinor: 2000, currency: 'USD' },
  lineTotal: { amountMinor: 4000, currency: 'USD' },
};

const sampleSale: Sale = {
  id: 'sale-1' as EntityId,
  createdAt: '2026-01-15T00:00:00.000Z',
  updatedAt: '2026-01-15T00:00:00.000Z',
  businessId: 'biz-1' as EntityId,
  customerId: 'cust-1' as EntityId,
  date: '2026-01-15',
  items: [sampleSaleItem],
  totalAmount: { amountMinor: 4000, currency: 'USD' },
  paymentStatus: 'paid',
  notes: 'Test note',
};

function createContainer(
  saleRepo: SaleRepository,
  bizRepo: BusinessRepository,
  custRepo: CustomerRepository,
  invRepo: InventoryRepository,
): ServiceContainer {
  return {
    businessService: new BusinessService(bizRepo),
    inventoryService: new InventoryService(invRepo),
    salesService: new SalesService(saleRepo),
    customerService: new CustomerService(custRepo),
    businessExpenseService: {} as never,
    personalIncomeService: {} as never,
    personalExpenseService: {} as never,
    categoryService: {} as never,
    budgetService: {} as never,
    accountService: {} as never,
  };
}

function renderSalesPage(container: ServiceContainer) {
  return render(
    <MemoryRouter>
      <ServiceProvider services={container}>
        <SalesPage />
      </ServiceProvider>
    </MemoryRouter>,
  );
}

function setupFullMocks() {
  const saleRepo = createMockSaleRepo();
  const bizRepo = createMockBusinessRepo();
  bizRepo.getAll = vi.fn().mockResolvedValue([sampleBusiness]);
  const custRepo = createMockCustomerRepo();
  custRepo.getAll = vi.fn().mockResolvedValue([sampleCustomer]);
  const invRepo = createMockInventoryRepo();
  invRepo.getAll = vi.fn().mockResolvedValue([sampleInventoryItem]);
  const container = createContainer(saleRepo, bizRepo, custRepo, invRepo);
  return { saleRepo, bizRepo, custRepo, invRepo, container };
}

describe('SalesPage', () => {
  it('shows loading state initially', () => {
    const saleRepo = createMockSaleRepo();
    saleRepo.getAll = vi.fn().mockReturnValue(new Promise(() => {}));
    const bizRepo = createMockBusinessRepo();
    const custRepo = createMockCustomerRepo();
    const invRepo = createMockInventoryRepo();
    const container = createContainer(saleRepo, bizRepo, custRepo, invRepo);

    renderSalesPage(container);

    expect(screen.getByText('Loading sales…')).toBeDefined();
  });

  it('shows empty state when no sales exist', async () => {
    const { container } = setupFullMocks();

    renderSalesPage(container);

    await waitFor(() => expect(screen.getByText('No sales yet')).toBeDefined());
  });

  it('renders sales list when data is loaded', async () => {
    const { saleRepo, container } = setupFullMocks();
    saleRepo.getAll = vi.fn().mockResolvedValue([sampleSale]);

    renderSalesPage(container);

    await waitFor(() => expect(screen.getByText('Jan 15, 2026')).toBeDefined());
    expect(screen.getByText('1 item')).toBeDefined();
    expect(screen.getByText('USD 40.00')).toBeDefined();
    expect(screen.getByText('Paid')).toBeDefined();
    expect(screen.getByText('Test note')).toBeDefined();
  });

  it('shows error state when loading fails', async () => {
    const { saleRepo, container } = setupFullMocks();
    saleRepo.getAll = vi.fn().mockRejectedValue(new Error('DB error'));

    renderSalesPage(container);

    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeDefined());
    expect(screen.getByText('Retry')).toBeDefined();
  });
});

describe('SalesPage — create', () => {
  it('opens create form and creates a sale', async () => {
    const { saleRepo, container } = setupFullMocks();
    saleRepo.create = vi.fn().mockResolvedValue(sampleSale);

    renderSalesPage(container);

    await waitFor(() => expect(screen.getByText('No sales yet')).toBeDefined());

    fireEvent.click(screen.getAllByText('New Sale')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Business/), { target: { value: 'biz-1' } });
    fireEvent.click(within(dialog).getByText('Add Item'));

    const productSelects = within(dialog).getAllByLabelText(/product/i);
    fireEvent.change(productSelects[0], { target: { value: 'inv-1' } });

    fireEvent.click(within(dialog).getByRole('button', { name: 'Create Sale' }));

    await waitFor(() => expect(saleRepo.create).toHaveBeenCalled());
  });

  it('shows validation error for missing business', async () => {
    const { container } = setupFullMocks();

    renderSalesPage(container);

    await waitFor(() => expect(screen.getByText('No sales yet')).toBeDefined());

    fireEvent.click(screen.getAllByText('New Sale')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create Sale' }));

    await waitFor(() => expect(screen.getByText('Please select a business.')).toBeDefined());
  });

  it('shows validation error when no items added', async () => {
    const { container } = setupFullMocks();

    renderSalesPage(container);

    await waitFor(() => expect(screen.getByText('No sales yet')).toBeDefined());

    fireEvent.click(screen.getAllByText('New Sale')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Business/), { target: { value: 'biz-1' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create Sale' }));

    await waitFor(() => expect(screen.getByText('At least one item is required.')).toBeDefined());
  });

  it('shows service error on create failure', async () => {
    const { saleRepo, container } = setupFullMocks();
    saleRepo.create = vi.fn().mockRejectedValue(new Error('Create failed'));

    renderSalesPage(container);

    await waitFor(() => expect(screen.getByText('No sales yet')).toBeDefined());

    fireEvent.click(screen.getAllByText('New Sale')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Business/), { target: { value: 'biz-1' } });
    fireEvent.click(within(dialog).getByText('Add Item'));
    const productSelects = within(dialog).getAllByLabelText(/product/i);
    fireEvent.change(productSelects[0], { target: { value: 'inv-1' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create Sale' }));

    await waitFor(() => expect(screen.getByText('Create failed')).toBeDefined());
  });
});

describe('SalesPage — update', () => {
  it('opens edit form and updates a sale', async () => {
    const { saleRepo, container } = setupFullMocks();
    saleRepo.getAll = vi.fn().mockResolvedValue([sampleSale]);
    saleRepo.update = vi.fn().mockResolvedValue({ ...sampleSale, paymentStatus: 'pending' });

    renderSalesPage(container);

    await waitFor(() => expect(screen.getByText('Jan 15, 2026')).toBeDefined());

    fireEvent.click(screen.getByLabelText(/Edit sale/));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByLabelText(/Payment Status/)).toBeDefined();
    fireEvent.change(within(dialog).getByLabelText(/Payment Status/), { target: { value: 'pending' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(saleRepo.update).toHaveBeenCalled());
  });
});

describe('SalesPage — delete', () => {
  it('shows delete confirmation dialog', async () => {
    const { saleRepo, container } = setupFullMocks();
    saleRepo.getAll = vi.fn().mockResolvedValue([sampleSale]);

    renderSalesPage(container);

    await waitFor(() => expect(screen.getByText('Jan 15, 2026')).toBeDefined());

    fireEvent.click(screen.getByLabelText(/Delete sale/));
    await waitFor(() => expect(screen.getByText('Delete Sale')).toBeDefined());
    expect(screen.getByText(/Are you sure you want to delete/)).toBeDefined();
  });

  it('deletes a sale after confirmation', async () => {
    const { saleRepo, container } = setupFullMocks();
    saleRepo.getAll = vi.fn().mockResolvedValue([sampleSale]);
    saleRepo.remove = vi.fn().mockResolvedValue(undefined);

    renderSalesPage(container);

    await waitFor(() => expect(screen.getByText('Jan 15, 2026')).toBeDefined());

    fireEvent.click(screen.getByLabelText(/Delete sale/));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(saleRepo.remove).toHaveBeenCalledWith('sale-1'));
  });

  it('cancel does not delete', async () => {
    const { saleRepo, container } = setupFullMocks();
    saleRepo.getAll = vi.fn().mockResolvedValue([sampleSale]);

    renderSalesPage(container);

    await waitFor(() => expect(screen.getByText('Jan 15, 2026')).toBeDefined());

    fireEvent.click(screen.getByLabelText(/Delete sale/));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(saleRepo.remove).not.toHaveBeenCalled();
  });

  it('shows error on delete failure', async () => {
    const { saleRepo, container } = setupFullMocks();
    saleRepo.getAll = vi.fn().mockResolvedValue([sampleSale]);
    saleRepo.remove = vi.fn().mockRejectedValue(new Error('Delete failed'));

    renderSalesPage(container);

    await waitFor(() => expect(screen.getByText('Jan 15, 2026')).toBeDefined());

    fireEvent.click(screen.getByLabelText(/Delete sale/));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.getByText('Delete failed')).toBeDefined());
  });
});

describe('SalesPage — refresh after mutation', () => {
  it('refreshes list after create', async () => {
    let callCount = 0;
    const { saleRepo, container } = setupFullMocks();
    saleRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? [] : [sampleSale];
    });
    saleRepo.create = vi.fn().mockResolvedValue(sampleSale);

    renderSalesPage(container);

    await waitFor(() => expect(screen.getByText('No sales yet')).toBeDefined());

    fireEvent.click(screen.getAllByText('New Sale')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Business/), { target: { value: 'biz-1' } });
    fireEvent.click(within(dialog).getByText('Add Item'));
    const productSelects = within(dialog).getAllByLabelText(/product/i);
    fireEvent.change(productSelects[0], { target: { value: 'inv-1' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create Sale' }));

    await waitFor(() => expect(screen.getByText('Jan 15, 2026')).toBeDefined());
    expect(callCount).toBe(2);
  });

  it('refreshes list after delete', async () => {
    let callCount = 0;
    const { saleRepo, container } = setupFullMocks();
    saleRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? [sampleSale] : [];
    });
    saleRepo.remove = vi.fn().mockResolvedValue(undefined);

    renderSalesPage(container);

    await waitFor(() => expect(screen.getByText('Jan 15, 2026')).toBeDefined());

    fireEvent.click(screen.getByLabelText(/Delete sale/));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.getByText('No sales yet')).toBeDefined());
    expect(callCount).toBe(2);
  });
});

describe('SalesPage — business filtering', () => {
  it('filters sales by selected business', async () => {
    const { saleRepo, container } = setupFullMocks();
    saleRepo.getAll = vi.fn().mockResolvedValue([sampleSale]);
    saleRepo.getByBusinessId = vi.fn().mockResolvedValue([sampleSale]);

    renderSalesPage(container);

    await waitFor(() => expect(screen.getByText('Jan 15, 2026')).toBeDefined());
    expect(saleRepo.getAll).toHaveBeenCalled();
    expect(saleRepo.getByBusinessId).not.toHaveBeenCalled();

    const filterSelect = screen.getByLabelText('Filter by business');
    fireEvent.change(filterSelect, { target: { value: 'biz-1' } });

    await waitFor(() => expect(saleRepo.getByBusinessId).toHaveBeenCalledWith('biz-1'));
  });
});

describe('SalesPage — item editor', () => {
  it('adds and removes items', async () => {
    const { saleRepo, container } = setupFullMocks();

    renderSalesPage(container);

    await waitFor(() => expect(screen.getByText('No sales yet')).toBeDefined());

    fireEvent.click(screen.getAllByText('New Sale')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByText('Add Item'));
    expect(within(dialog).getAllByLabelText(/product/i).length).toBe(1);

    fireEvent.click(within(dialog).getByText('Add Item'));
    expect(within(dialog).getAllByLabelText(/product/i).length).toBe(2);

    const removeButtons = within(dialog).getAllByLabelText(/Remove item/);
    fireEvent.click(removeButtons[0]);
    expect(within(dialog).getAllByLabelText(/product/i).length).toBe(1);
  });

  it('selecting a product auto-fills name and price', async () => {
    const { container } = setupFullMocks();

    renderSalesPage(container);

    await waitFor(() => expect(screen.getByText('No sales yet')).toBeDefined());

    fireEvent.click(screen.getAllByText('New Sale')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Business/), { target: { value: 'biz-1' } });
    fireEvent.click(within(dialog).getByText('Add Item'));

    const productSelect = within(dialog).getByLabelText(/product/i);
    fireEvent.change(productSelect, { target: { value: 'inv-1' } });

    const priceInput = within(dialog).getByLabelText(/unit price/i);
    expect(priceInput).toHaveValue(20);
  });

  it('displays line total and grand total', async () => {
    const { container } = setupFullMocks();

    renderSalesPage(container);

    await waitFor(() => expect(screen.getByText('No sales yet')).toBeDefined());

    fireEvent.click(screen.getAllByText('New Sale')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Business/), { target: { value: 'biz-1' } });
    fireEvent.click(within(dialog).getByText('Add Item'));
    const productSelect = within(dialog).getByLabelText(/product/i);
    fireEvent.change(productSelect, { target: { value: 'inv-1' } });

    const qtyInput = within(dialog).getByLabelText(/quantity/i);
    fireEvent.change(qtyInput, { target: { value: '3' } });

    await waitFor(() => {
      expect(within(dialog).getAllByText('USD 60.00').length).toBeGreaterThan(0);
    });
  });
});

describe('SalesPage — payment status rendering', () => {
  it('renders all payment status variants', async () => {
    const { saleRepo, container } = setupFullMocks();
    const statuses: Sale['paymentStatus'][] = ['pending', 'partial', 'paid', 'refunded'];
    const sales = statuses.map((status, i) => ({
      ...sampleSale,
      id: `sale-${i}` as EntityId,
      paymentStatus: status,
      date: `2026-01-${10 + i}`,
    }));
    saleRepo.getAll = vi.fn().mockResolvedValue(sales);

    renderSalesPage(container);

    await waitFor(() => expect(screen.getByText('Pending')).toBeDefined());
    expect(screen.getByText('Partial')).toBeDefined();
    expect(screen.getByText('Paid')).toBeDefined();
    expect(screen.getByText('Refunded')).toBeDefined();
  });
});
