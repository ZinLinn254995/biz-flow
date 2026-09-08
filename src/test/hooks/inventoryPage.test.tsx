// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ServiceProvider } from '@/hooks/common/ServiceProvider';
import InventoryPage from '@/pages/InventoryPage';
import { InventoryService } from '@/services/inventory/InventoryService';
import { BusinessService } from '@/services/business/BusinessService';
import type { ServiceContainer } from '@/services/container';
import type { InventoryRepository } from '@/types/repositories/inventoryRepository';
import type { BusinessRepository } from '@/types/repositories/businessRepository';
import type { InventoryItem } from '@/types/domain/inventory';
import type { Business } from '@/types/domain/business';
import type { EntityId } from '@/types/common/base';

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

function createMockBusinessRepo(): BusinessRepository {
  return {
    getById: vi.fn(),
    getAll: vi.fn().mockResolvedValue([]),
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

const sampleItem: InventoryItem = {
  id: 'item-1' as EntityId,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  businessId: 'biz-1' as EntityId,
  name: 'Coffee Beans',
  sku: 'CB-001',
  quantity: 50,
  unit: 'kg',
  costPrice: { amountMinor: 1000, currency: 'USD' },
  salePrice: { amountMinor: 2000, currency: 'USD' },
  reorderThreshold: 10,
  stockStatus: 'in_stock',
};

function createContainer(
  invRepo: InventoryRepository,
  bizRepo: BusinessRepository,
): ServiceContainer {
  return {
    businessService: new BusinessService(bizRepo),
    inventoryService: new InventoryService(invRepo),
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

function renderInventoryPage(container: ServiceContainer) {
  return render(
    <MemoryRouter>
      <ServiceProvider services={container}>
        <InventoryPage />
      </ServiceProvider>
    </MemoryRouter>,
  );
}

describe('InventoryPage', () => {
  it('shows loading state initially', () => {
    const invRepo = createMockInventoryRepo();
    invRepo.getAll = vi.fn().mockReturnValue(new Promise(() => {}));
    const bizRepo = createMockBusinessRepo();
    const container = createContainer(invRepo, bizRepo);

    renderInventoryPage(container);

    expect(screen.getByText('Loading inventory…')).toBeDefined();
  });

  it('shows empty state when no items exist', async () => {
    const invRepo = createMockInventoryRepo();
    const bizRepo = createMockBusinessRepo();
    const container = createContainer(invRepo, bizRepo);

    renderInventoryPage(container);

    await waitFor(() => expect(screen.getByText('No inventory items')).toBeDefined());
  });

  it('renders inventory list when data is loaded', async () => {
    const invRepo = createMockInventoryRepo();
    invRepo.getAll = vi.fn().mockResolvedValue([sampleItem]);
    const bizRepo = createMockBusinessRepo();
    bizRepo.getAll = vi.fn().mockResolvedValue([sampleBusiness]);
    const container = createContainer(invRepo, bizRepo);

    renderInventoryPage(container);

    await waitFor(() => expect(screen.getByText('Coffee Beans')).toBeDefined());
    expect(screen.getByText('SKU: CB-001')).toBeDefined();
    expect(screen.getByText('50 kg')).toBeDefined();
    expect(screen.getByText('USD 10.00')).toBeDefined();
    expect(screen.getByText('USD 20.00')).toBeDefined();
    expect(screen.getAllByText('In Stock').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Test Shop').length).toBeGreaterThan(0);
  });

  it('shows error state when loading fails', async () => {
    const invRepo = createMockInventoryRepo();
    invRepo.getAll = vi.fn().mockRejectedValue(new Error('DB error'));
    const bizRepo = createMockBusinessRepo();
    const container = createContainer(invRepo, bizRepo);

    renderInventoryPage(container);

    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeDefined());
    expect(screen.getByText('Retry')).toBeDefined();
  });
});

describe('InventoryPage — create', () => {
  it('opens create form and creates an item', async () => {
    const invRepo = createMockInventoryRepo();
    invRepo.create = vi.fn().mockResolvedValue(sampleItem);
    const bizRepo = createMockBusinessRepo();
    bizRepo.getAll = vi.fn().mockResolvedValue([sampleBusiness]);
    const container = createContainer(invRepo, bizRepo);

    renderInventoryPage(container);

    await waitFor(() => expect(screen.getByText('No inventory items')).toBeDefined());

    fireEvent.click(screen.getAllByText('Add Item')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Item Name/), { target: { value: 'Coffee Beans' } });
    fireEvent.change(within(dialog).getByLabelText(/Business/), { target: { value: 'biz-1' } });
    fireEvent.change(within(dialog).getByLabelText(/Quantity/), { target: { value: '50' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Item' }));

    await waitFor(() => expect(invRepo.create).toHaveBeenCalled());
  });

  it('shows validation error for empty name', async () => {
    const invRepo = createMockInventoryRepo();
    const bizRepo = createMockBusinessRepo();
    bizRepo.getAll = vi.fn().mockResolvedValue([sampleBusiness]);
    const container = createContainer(invRepo, bizRepo);

    renderInventoryPage(container);

    await waitFor(() => expect(screen.getByText('No inventory items')).toBeDefined());

    fireEvent.click(screen.getAllByText('Add Item')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Item' }));

    await waitFor(() => expect(screen.getByText('Item name is required.')).toBeDefined());
  });

  it('shows validation error when no business is selected', async () => {
    const invRepo = createMockInventoryRepo();
    const bizRepo = createMockBusinessRepo();
    bizRepo.getAll = vi.fn().mockResolvedValue([sampleBusiness]);
    const container = createContainer(invRepo, bizRepo);

    renderInventoryPage(container);

    await waitFor(() => expect(screen.getByText('No inventory items')).toBeDefined());

    fireEvent.click(screen.getAllByText('Add Item')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Item Name/), { target: { value: 'Test Item' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Item' }));

    await waitFor(() => expect(screen.getByText('Please select a business.')).toBeDefined());
  });

  it('shows service error on create failure', async () => {
    const invRepo = createMockInventoryRepo();
    invRepo.create = vi.fn().mockRejectedValue(new Error('Create failed'));
    const bizRepo = createMockBusinessRepo();
    bizRepo.getAll = vi.fn().mockResolvedValue([sampleBusiness]);
    const container = createContainer(invRepo, bizRepo);

    renderInventoryPage(container);

    await waitFor(() => expect(screen.getByText('No inventory items')).toBeDefined());

    fireEvent.click(screen.getAllByText('Add Item')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Business/), { target: { value: 'biz-1' } });
    fireEvent.change(within(dialog).getByLabelText(/Item Name/), { target: { value: 'Coffee Beans' } });
    fireEvent.change(within(dialog).getByLabelText(/Quantity/), { target: { value: '50' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Item' }));

    await waitFor(() => expect(screen.getByText('Create failed')).toBeDefined());
  });
});

describe('InventoryPage — update', () => {
  it('opens edit form and updates an item', async () => {
    const invRepo = createMockInventoryRepo();
    invRepo.getAll = vi.fn().mockResolvedValue([sampleItem]);
    invRepo.update = vi.fn().mockResolvedValue({ ...sampleItem, name: 'Updated Beans' });
    const bizRepo = createMockBusinessRepo();
    bizRepo.getAll = vi.fn().mockResolvedValue([sampleBusiness]);
    const container = createContainer(invRepo, bizRepo);

    renderInventoryPage(container);

    await waitFor(() => expect(screen.getByText('Coffee Beans')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Edit Coffee Beans'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByLabelText(/Item Name/)).toHaveValue('Coffee Beans');

    fireEvent.change(within(dialog).getByLabelText(/Item Name/), { target: { value: 'Updated Beans' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(invRepo.update).toHaveBeenCalled());
  });
});

describe('InventoryPage — delete', () => {
  it('shows delete confirmation dialog', async () => {
    const invRepo = createMockInventoryRepo();
    invRepo.getAll = vi.fn().mockResolvedValue([sampleItem]);
    const bizRepo = createMockBusinessRepo();
    bizRepo.getAll = vi.fn().mockResolvedValue([sampleBusiness]);
    const container = createContainer(invRepo, bizRepo);

    renderInventoryPage(container);

    await waitFor(() => expect(screen.getByText('Coffee Beans')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete Coffee Beans'));
    await waitFor(() => expect(screen.getByText('Delete Inventory Item')).toBeDefined());
    expect(screen.getByText(/Are you sure you want to delete/)).toBeDefined();
  });

  it('deletes an item after confirmation', async () => {
    const invRepo = createMockInventoryRepo();
    invRepo.getAll = vi.fn().mockResolvedValue([sampleItem]);
    invRepo.remove = vi.fn().mockResolvedValue(undefined);
    const bizRepo = createMockBusinessRepo();
    bizRepo.getAll = vi.fn().mockResolvedValue([sampleBusiness]);
    const container = createContainer(invRepo, bizRepo);

    renderInventoryPage(container);

    await waitFor(() => expect(screen.getByText('Coffee Beans')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete Coffee Beans'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(invRepo.remove).toHaveBeenCalledWith('item-1'));
  });

  it('cancel does not delete', async () => {
    const invRepo = createMockInventoryRepo();
    invRepo.getAll = vi.fn().mockResolvedValue([sampleItem]);
    const bizRepo = createMockBusinessRepo();
    bizRepo.getAll = vi.fn().mockResolvedValue([sampleBusiness]);
    const container = createContainer(invRepo, bizRepo);

    renderInventoryPage(container);

    await waitFor(() => expect(screen.getByText('Coffee Beans')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete Coffee Beans'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(invRepo.remove).not.toHaveBeenCalled();
  });

  it('shows error on delete failure', async () => {
    const invRepo = createMockInventoryRepo();
    invRepo.getAll = vi.fn().mockResolvedValue([sampleItem]);
    invRepo.remove = vi.fn().mockRejectedValue(new Error('Delete failed'));
    const bizRepo = createMockBusinessRepo();
    bizRepo.getAll = vi.fn().mockResolvedValue([sampleBusiness]);
    const container = createContainer(invRepo, bizRepo);

    renderInventoryPage(container);

    await waitFor(() => expect(screen.getByText('Coffee Beans')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete Coffee Beans'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.getByText('Delete failed')).toBeDefined());
  });
});

describe('InventoryPage — refresh after mutation', () => {
  it('refreshes list after create', async () => {
    let callCount = 0;
    const invRepo = createMockInventoryRepo();
    invRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? [] : [sampleItem];
    });
    invRepo.create = vi.fn().mockResolvedValue(sampleItem);
    const bizRepo = createMockBusinessRepo();
    bizRepo.getAll = vi.fn().mockResolvedValue([sampleBusiness]);
    const container = createContainer(invRepo, bizRepo);

    renderInventoryPage(container);

    await waitFor(() => expect(screen.getByText('No inventory items')).toBeDefined());

    fireEvent.click(screen.getAllByText('Add Item')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Business/), { target: { value: 'biz-1' } });
    fireEvent.change(within(dialog).getByLabelText(/Item Name/), { target: { value: 'Coffee Beans' } });
    fireEvent.change(within(dialog).getByLabelText(/Quantity/), { target: { value: '50' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Item' }));

    await waitFor(() => expect(screen.getByText('Coffee Beans')).toBeDefined());
    expect(callCount).toBe(2);
  });

  it('refreshes list after delete', async () => {
    let callCount = 0;
    const invRepo = createMockInventoryRepo();
    invRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? [sampleItem] : [];
    });
    invRepo.remove = vi.fn().mockResolvedValue(undefined);
    const bizRepo = createMockBusinessRepo();
    bizRepo.getAll = vi.fn().mockResolvedValue([sampleBusiness]);
    const container = createContainer(invRepo, bizRepo);

    renderInventoryPage(container);

    await waitFor(() => expect(screen.getByText('Coffee Beans')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete Coffee Beans'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.getByText('No inventory items')).toBeDefined());
    expect(callCount).toBe(2);
  });
});

describe('InventoryPage — business filtering', () => {
  it('filters inventory by selected business', async () => {
    const invRepo = createMockInventoryRepo();
    invRepo.getAll = vi.fn().mockResolvedValue([sampleItem]);
    invRepo.getByBusinessId = vi.fn().mockResolvedValue([sampleItem]);
    const bizRepo = createMockBusinessRepo();
    bizRepo.getAll = vi.fn().mockResolvedValue([sampleBusiness]);
    const container = createContainer(invRepo, bizRepo);

    renderInventoryPage(container);

    await waitFor(() => expect(screen.getByText('Coffee Beans')).toBeDefined());
    expect(invRepo.getAll).toHaveBeenCalled();
    expect(invRepo.getByBusinessId).not.toHaveBeenCalled();

    const filterSelect = screen.getByLabelText('Filter by business');
    fireEvent.change(filterSelect, { target: { value: 'biz-1' } });

    await waitFor(() => expect(invRepo.getByBusinessId).toHaveBeenCalledWith('biz-1'));
  });
});
