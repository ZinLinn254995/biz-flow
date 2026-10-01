// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PurchaseForm } from '@/components/purchases/PurchaseForm';
import PurchaseDetailPage from '@/pages/PurchaseDetailPage';
import PurchasesPage from '@/pages/PurchasesPage';
import { ServiceProvider } from '@/hooks/common/ServiceProvider';
import { BusinessService } from '@/services/business/BusinessService';
import { InventoryService } from '@/services/inventory/InventoryService';
import { PurchaseService } from '@/services/purchases/PurchaseService';
import type { ServiceContainer } from '@/services/container';
import type { Business } from '@/types/domain/business';
import type { InventoryItem } from '@/types/domain/inventory';
import type { Purchase } from '@/types/domain/purchase';
import type { EntityId } from '@/types/common/base';
import type { BusinessRepository } from '@/types/repositories/businessRepository';
import type { InventoryRepository } from '@/types/repositories/inventoryRepository';
import type { PurchaseRepository } from '@/types/repositories/purchaseRepository';

const business: Business = { id: 'biz-1' as EntityId, name: 'Test Shop', currency: 'USD', createdAt: '2026-01-01', updatedAt: '2026-01-01' };
const inventoryItem: InventoryItem = {
  id: 'inv-1' as EntityId,
  businessId: business.id,
  name: 'Coffee Beans',
  quantity: 5,
  unit: 'bag',
  costPrice: { amountMinor: 1500, currency: 'USD' },
  salePrice: { amountMinor: 2500, currency: 'USD' },
  stockStatus: 'in_stock',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};
const purchase: Purchase = {
  id: 'purchase-1' as EntityId,
  businessId: business.id,
  date: '2026-01-15',
  supplierName: 'Bean Supplier',
  notes: 'Deliver on Friday',
  items: [{ inventoryItemId: inventoryItem.id, name: inventoryItem.name, quantity: 2, unitCost: { amountMinor: 1500, currency: 'USD' }, lineTotal: { amountMinor: 3000, currency: 'USD' } }],
  totalAmount: { amountMinor: 3000, currency: 'USD' },
  createdAt: '2026-01-15',
  updatedAt: '2026-01-15',
};

function createFormProps(overrides: Partial<React.ComponentProps<typeof PurchaseForm>> = {}): React.ComponentProps<typeof PurchaseForm> {
  return { open: true, purchase: null, businesses: [business], inventoryItems: [inventoryItem], isSubmitting: false, onSubmit: vi.fn(), onCancel: vi.fn(), ...overrides };
}

function createContainer(repository: PurchaseRepository): ServiceContainer {
  const businessRepository: BusinessRepository = { getById: vi.fn(), getAll: vi.fn().mockResolvedValue([business]), create: vi.fn(), update: vi.fn(), remove: vi.fn(), removeCascade: vi.fn() };
  const inventoryRepository: InventoryRepository = { getById: vi.fn(), getAll: vi.fn(), getByBusinessId: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() };
  return {
    businessService: new BusinessService(businessRepository),
    inventoryService: new InventoryService(inventoryRepository),
    salesService: {} as never,
    purchaseService: new PurchaseService(repository),
    customerService: {} as never,
    businessExpenseService: {} as never,
    personalIncomeService: {} as never,
    personalExpenseService: {} as never,
    categoryService: {} as never,
    budgetService: {} as never,
    accountService: {} as never,
  };
}

function createPurchaseRepository(overrides: Partial<PurchaseRepository> = {}): PurchaseRepository {
  return {
    getById: vi.fn().mockResolvedValue(purchase),
    getAll: vi.fn().mockResolvedValue([purchase]),
    getByBusinessId: vi.fn().mockResolvedValue([purchase]),
    create: vi.fn().mockResolvedValue(purchase),
    update: vi.fn().mockResolvedValue(purchase),
    remove: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('PurchaseForm', () => {
  it('selects inventory items, calculates totals, and submits supplier and notes', () => {
    const onSubmit = vi.fn();
    render(<PurchaseForm {...createFormProps({ onSubmit })} />);

    fireEvent.change(screen.getByRole('combobox', { name: /business/i }), { target: { value: business.id } });
    fireEvent.click(screen.getByRole('button', { name: /add item/i }));
    fireEvent.change(screen.getByLabelText('Inventory item'), { target: { value: inventoryItem.id } });
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Supplier name'), { target: { value: 'Bean Supplier' } });
    fireEvent.change(screen.getByLabelText('Notes'), { target: { value: 'Deliver on Friday' } });

    expect(screen.getByText('Line: USD 30.00')).toBeDefined();
    expect(screen.getByText('USD 30.00')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /create purchase/i }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      supplierName: 'Bean Supplier',
      notes: 'Deliver on Friday',
      totalAmount: { amountMinor: 3000, currency: 'USD' },
    }));
  });

  it('shows validation errors for missing items and invalid quantity', () => {
    render(<PurchaseForm {...createFormProps()} />);
    fireEvent.change(screen.getByRole('combobox', { name: /business/i }), { target: { value: business.id } });
    fireEvent.click(screen.getByRole('button', { name: /create purchase/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/at least one item/i);

    fireEvent.click(screen.getByRole('button', { name: /add item/i }));
    fireEvent.change(screen.getByLabelText('Inventory item'), { target: { value: inventoryItem.id } });
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /create purchase/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/positive integer/i);
  });
});

describe('PurchaseDetailPage', () => {
  it('renders purchase detail values and handles not found records', async () => {
    const repository: PurchaseRepository = { getById: vi.fn().mockResolvedValue(purchase), getAll: vi.fn(), getByBusinessId: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() };
    render(<MemoryRouter initialEntries={['/purchases/purchase-1']}><ServiceProvider services={createContainer(repository)}><Routes><Route path="/purchases/:purchaseId" element={<PurchaseDetailPage />} /></Routes></ServiceProvider></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Bean Supplier')).toBeDefined());
    expect(screen.getByText('Coffee Beans')).toBeDefined();
    expect(screen.getByText('Deliver on Friday')).toBeDefined();
    expect(screen.getAllByText('USD 30.00').length).toBeGreaterThan(0);

    const missingRepository: PurchaseRepository = { getById: vi.fn().mockResolvedValue(null), getAll: vi.fn(), getByBusinessId: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() };
    render(<MemoryRouter initialEntries={['/purchases/missing']}><ServiceProvider services={createContainer(missingRepository)}><Routes><Route path="/purchases/:purchaseId" element={<PurchaseDetailPage />} /></Routes></ServiceProvider></MemoryRouter>);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Purchase not found' })).toBeDefined());
  });
});

describe('PurchasesPage', () => {
  it('loads purchases, scopes by business, and opens edit/delete workflows', async () => {
    const repository = createPurchaseRepository();
    render(<MemoryRouter><ServiceProvider services={createContainer(repository)}><PurchasesPage /></ServiceProvider></MemoryRouter>);

    expect(screen.getByText('Loading purchases…')).toBeDefined();
    await waitFor(() => expect(screen.getByText('Bean Supplier')).toBeDefined());
    fireEvent.change(screen.getByRole('combobox', { name: /filter by business/i }), { target: { value: business.id } });
    await waitFor(() => expect(repository.getByBusinessId).toHaveBeenCalledWith(business.id));
    fireEvent.click(screen.getByRole('button', { name: /edit purchase/i }));
    expect(screen.getByRole('heading', { name: 'Edit Purchase' })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /close dialog/i }));
    fireEvent.click(screen.getByRole('button', { name: /delete purchase/i }));
    expect(screen.getByRole('heading', { name: 'Delete Purchase' })).toBeDefined();
  });

  it('renders an empty state and a retryable error state', async () => {
    const emptyRepository = createPurchaseRepository({ getAll: vi.fn().mockResolvedValue([]) });
    render(<MemoryRouter><ServiceProvider services={createContainer(emptyRepository)}><PurchasesPage /></ServiceProvider></MemoryRouter>);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'No purchases' })).toBeDefined());

    const failingRepository = createPurchaseRepository({ getAll: vi.fn().mockRejectedValue(new Error('offline')) });
    render(<MemoryRouter><ServiceProvider services={createContainer(failingRepository)}><PurchasesPage /></ServiceProvider></MemoryRouter>);
    await waitFor(() => expect(screen.getByText("We couldn't load purchases.")).toBeDefined());
    expect(screen.getByRole('button', { name: 'Retry' })).toBeDefined();
  });
});
