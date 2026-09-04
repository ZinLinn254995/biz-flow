// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ServiceProvider } from '@/hooks/common/ServiceProvider';
import CustomersPage from '@/pages/CustomersPage';
import { CustomerService } from '@/services/customers/CustomerService';
import { BusinessService } from '@/services/business/BusinessService';
import type { ServiceContainer } from '@/services/container';
import type { CustomerRepository } from '@/types/repositories/customerRepository';
import type { BusinessRepository } from '@/types/repositories/businessRepository';
import type { Customer } from '@/types/domain/customer';
import type { Business } from '@/types/domain/business';
import type { EntityId } from '@/types/common/base';

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

function createMockBusinessRepo(): BusinessRepository {
  return {
    getById: vi.fn(),
    getAll: vi.fn().mockResolvedValue([]),
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
  email: 'john@example.com',
  phone: '555-1234',
  address: '123 Main St',
  notes: 'VIP customer',
};

function createContainer(
  custRepo: CustomerRepository,
  bizRepo: BusinessRepository,
): ServiceContainer {
  return {
    businessService: new BusinessService(bizRepo),
    customerService: new CustomerService(custRepo),
    inventoryService: {} as never,
    salesService: {} as never,
    businessExpenseService: {} as never,
    personalIncomeService: {} as never,
    personalExpenseService: {} as never,
    categoryService: {} as never,
    budgetService: {} as never,
    accountService: {} as never,
  };
}

function renderCustomersPage(container: ServiceContainer) {
  return render(
    <MemoryRouter>
      <ServiceProvider services={container}>
        <CustomersPage />
      </ServiceProvider>
    </MemoryRouter>,
  );
}

function setupFullMocks() {
  const custRepo = createMockCustomerRepo();
  const bizRepo = createMockBusinessRepo();
  bizRepo.getAll = vi.fn().mockResolvedValue([sampleBusiness]);
  const container = createContainer(custRepo, bizRepo);
  return { custRepo, bizRepo, container };
}

describe('CustomersPage', () => {
  it('shows loading state initially', () => {
    const custRepo = createMockCustomerRepo();
    custRepo.getAll = vi.fn().mockReturnValue(new Promise(() => {}));
    const bizRepo = createMockBusinessRepo();
    const container = createContainer(custRepo, bizRepo);

    renderCustomersPage(container);

    expect(screen.getByText('Loading customers…')).toBeDefined();
  });

  it('shows empty state when no customers exist', async () => {
    const { container } = setupFullMocks();

    renderCustomersPage(container);

    await waitFor(() => expect(screen.getByText('No customers yet')).toBeDefined());
  });

  it('renders customer list when data is loaded', async () => {
    const { custRepo, container } = setupFullMocks();
    custRepo.getAll = vi.fn().mockResolvedValue([sampleCustomer]);

    renderCustomersPage(container);

    await waitFor(() => expect(screen.getByText('John Doe')).toBeDefined());
    expect(screen.getByText('john@example.com')).toBeDefined();
    expect(screen.getByText('555-1234')).toBeDefined();
    expect(screen.getByText('123 Main St')).toBeDefined();
    expect(screen.getByText('VIP customer')).toBeDefined();
  });

  it('shows error state when loading fails', async () => {
    const { custRepo, container } = setupFullMocks();
    custRepo.getAll = vi.fn().mockRejectedValue(new Error('DB error'));

    renderCustomersPage(container);

    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeDefined());
    expect(screen.getByText('Retry')).toBeDefined();
  });

  it('retry button triggers reload', async () => {
    let callCount = 0;
    const { custRepo, container } = setupFullMocks();
    custRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) throw new Error('DB error');
      return [sampleCustomer];
    });

    renderCustomersPage(container);

    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeDefined());
    fireEvent.click(screen.getByText('Retry'));

    await waitFor(() => expect(screen.getByText('John Doe')).toBeDefined());
  });
});

describe('CustomersPage — create', () => {
  it('opens create form and creates a customer', async () => {
    const { custRepo, container } = setupFullMocks();
    custRepo.create = vi.fn().mockResolvedValue(sampleCustomer);

    renderCustomersPage(container);

    await waitFor(() => expect(screen.getByText('No customers yet')).toBeDefined());

    fireEvent.click(screen.getAllByText('Add Customer')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Business/), { target: { value: 'biz-1' } });
    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'Jane Smith' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Customer' }));

    await waitFor(() => expect(custRepo.create).toHaveBeenCalled());
  });

  it('shows validation error for empty name', async () => {
    const { container } = setupFullMocks();

    renderCustomersPage(container);

    await waitFor(() => expect(screen.getByText('No customers yet')).toBeDefined());

    fireEvent.click(screen.getAllByText('Add Customer')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Customer' }));

    await waitFor(() => expect(screen.getByText('Customer name is required.')).toBeDefined());
  });

  it('shows validation error when no business is selected', async () => {
    const { container } = setupFullMocks();

    renderCustomersPage(container);

    await waitFor(() => expect(screen.getByText('No customers yet')).toBeDefined());

    fireEvent.click(screen.getAllByText('Add Customer')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'Jane Smith' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Customer' }));

    await waitFor(() => expect(screen.getByText('Please select a business.')).toBeDefined());
  });

  it('shows service error on create failure', async () => {
    const { custRepo, container } = setupFullMocks();
    custRepo.create = vi.fn().mockRejectedValue(new Error('Create failed'));

    renderCustomersPage(container);

    await waitFor(() => expect(screen.getByText('No customers yet')).toBeDefined());

    fireEvent.click(screen.getAllByText('Add Customer')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Business/), { target: { value: 'biz-1' } });
    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'Jane Smith' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Customer' }));

    await waitFor(() => expect(screen.getByText('Create failed')).toBeDefined());
  });
});

describe('CustomersPage — update', () => {
  it('opens edit form and updates a customer', async () => {
    const { custRepo, container } = setupFullMocks();
    custRepo.getAll = vi.fn().mockResolvedValue([sampleCustomer]);
    custRepo.update = vi.fn().mockResolvedValue({ ...sampleCustomer, name: 'Updated Name' });

    renderCustomersPage(container);

    await waitFor(() => expect(screen.getByText('John Doe')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Edit John Doe'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByLabelText(/Name/)).toHaveValue('John Doe');

    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'Updated Name' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(custRepo.update).toHaveBeenCalled());
  });
});

describe('CustomersPage — delete', () => {
  it('shows delete confirmation dialog', async () => {
    const { custRepo, container } = setupFullMocks();
    custRepo.getAll = vi.fn().mockResolvedValue([sampleCustomer]);

    renderCustomersPage(container);

    await waitFor(() => expect(screen.getByText('John Doe')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete John Doe'));
    await waitFor(() => expect(screen.getByText('Delete Customer')).toBeDefined());
    expect(screen.getByText(/Are you sure you want to delete/)).toBeDefined();
  });

  it('deletes a customer after confirmation', async () => {
    const { custRepo, container } = setupFullMocks();
    custRepo.getAll = vi.fn().mockResolvedValue([sampleCustomer]);
    custRepo.remove = vi.fn().mockResolvedValue(undefined);

    renderCustomersPage(container);

    await waitFor(() => expect(screen.getByText('John Doe')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete John Doe'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(custRepo.remove).toHaveBeenCalledWith('cust-1'));
  });

  it('cancel does not delete', async () => {
    const { custRepo, container } = setupFullMocks();
    custRepo.getAll = vi.fn().mockResolvedValue([sampleCustomer]);

    renderCustomersPage(container);

    await waitFor(() => expect(screen.getByText('John Doe')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete John Doe'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(custRepo.remove).not.toHaveBeenCalled();
  });

  it('shows error on delete failure', async () => {
    const { custRepo, container } = setupFullMocks();
    custRepo.getAll = vi.fn().mockResolvedValue([sampleCustomer]);
    custRepo.remove = vi.fn().mockRejectedValue(new Error('Delete failed'));

    renderCustomersPage(container);

    await waitFor(() => expect(screen.getByText('John Doe')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete John Doe'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.getByText('Delete failed')).toBeDefined());
  });
});

describe('CustomersPage — refresh after mutation', () => {
  it('refreshes list after create', async () => {
    let callCount = 0;
    const { custRepo, container } = setupFullMocks();
    custRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? [] : [sampleCustomer];
    });
    custRepo.create = vi.fn().mockResolvedValue(sampleCustomer);

    renderCustomersPage(container);

    await waitFor(() => expect(screen.getByText('No customers yet')).toBeDefined());

    fireEvent.click(screen.getAllByText('Add Customer')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Business/), { target: { value: 'biz-1' } });
    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'John Doe' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Customer' }));

    await waitFor(() => expect(screen.getByText('John Doe')).toBeDefined());
    expect(callCount).toBe(2);
  });

  it('refreshes list after update', async () => {
    let callCount = 0;
    const { custRepo, container } = setupFullMocks();
    custRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return [{ ...sampleCustomer, name: callCount === 1 ? 'John Doe' : 'Updated Name' }];
    });
    custRepo.update = vi.fn().mockResolvedValue({ ...sampleCustomer, name: 'Updated Name' });

    renderCustomersPage(container);

    await waitFor(() => expect(screen.getByText('John Doe')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Edit John Doe'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'Updated Name' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(screen.getByText('Updated Name')).toBeDefined());
    expect(callCount).toBe(2);
  });

  it('refreshes list after delete', async () => {
    let callCount = 0;
    const { custRepo, container } = setupFullMocks();
    custRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? [sampleCustomer] : [];
    });
    custRepo.remove = vi.fn().mockResolvedValue(undefined);

    renderCustomersPage(container);

    await waitFor(() => expect(screen.getByText('John Doe')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete John Doe'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.getByText('No customers yet')).toBeDefined());
    expect(callCount).toBe(2);
  });
});

describe('CustomersPage — business filtering', () => {
  it('filters customers by selected business', async () => {
    const { custRepo, container } = setupFullMocks();
    custRepo.getAll = vi.fn().mockResolvedValue([sampleCustomer]);
    custRepo.getByBusinessId = vi.fn().mockResolvedValue([sampleCustomer]);

    renderCustomersPage(container);

    await waitFor(() => expect(screen.getByText('John Doe')).toBeDefined());
    expect(custRepo.getAll).toHaveBeenCalled();
    expect(custRepo.getByBusinessId).not.toHaveBeenCalled();

    const filterSelect = screen.getByLabelText('Filter by business');
    fireEvent.change(filterSelect, { target: { value: 'biz-1' } });

    await waitFor(() => expect(custRepo.getByBusinessId).toHaveBeenCalledWith('biz-1'));
  });
});
