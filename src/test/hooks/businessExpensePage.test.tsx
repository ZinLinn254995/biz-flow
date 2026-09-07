// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ServiceProvider } from '@/hooks/common/ServiceProvider';
import BusinessExpensesPage from '@/pages/BusinessExpensesPage';
import { BusinessExpenseService } from '@/services/businessExpenses/BusinessExpenseService';
import { BusinessService } from '@/services/business/BusinessService';
import { CategoryService } from '@/services/categories/CategoryService';
import type { ServiceContainer } from '@/services/container';
import type { BusinessExpenseRepository } from '@/types/repositories/businessExpenseRepository';
import type { BusinessRepository } from '@/types/repositories/businessRepository';
import type { CategoryRepository } from '@/types/repositories/categoryRepository';
import type { BusinessExpense } from '@/types/domain/businessExpense';
import type { Business } from '@/types/domain/business';
import type { Category } from '@/types/domain/category';
import type { EntityId } from '@/types/common/base';

function createMockExpenseRepo(): BusinessExpenseRepository {
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

function createMockCategoryRepo(): CategoryRepository {
  return {
    getById: vi.fn(),
    getAll: vi.fn().mockResolvedValue([]),
    getByScope: vi.fn().mockResolvedValue([]),
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

const sampleCategory: Category = {
  id: 'cat-1' as EntityId,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Office Supplies',
  scope: 'business',
  direction: 'expense',
};

const sampleExpense: BusinessExpense = {
  id: 'exp-1' as EntityId,
  createdAt: '2026-01-15T00:00:00.000Z',
  updatedAt: '2026-01-15T00:00:00.000Z',
  businessId: 'biz-1' as EntityId,
  categoryId: 'cat-1' as EntityId,
  title: 'Printer Ink',
  date: '2026-01-15',
  amount: { amountMinor: 4500, currency: 'USD' },
  notes: 'Monthly resupply',
};

function createContainer(
  expRepo: BusinessExpenseRepository,
  bizRepo: BusinessRepository,
  catRepo: CategoryRepository,
): ServiceContainer {
  return {
    businessService: new BusinessService(bizRepo),
    businessExpenseService: new BusinessExpenseService(expRepo),
    categoryService: new CategoryService(catRepo),
    inventoryService: {} as never,
    salesService: {} as never,
    customerService: {} as never,
    personalIncomeService: {} as never,
    personalExpenseService: {} as never,
    budgetService: {} as never,
    accountService: {} as never,
  };
}

function renderExpensesPage(container: ServiceContainer) {
  return render(
    <MemoryRouter>
      <ServiceProvider services={container}>
        <BusinessExpensesPage />
      </ServiceProvider>
    </MemoryRouter>,
  );
}

function setupFullMocks() {
  const expRepo = createMockExpenseRepo();
  const bizRepo = createMockBusinessRepo();
  bizRepo.getAll = vi.fn().mockResolvedValue([sampleBusiness]);
  const catRepo = createMockCategoryRepo();
  catRepo.getAll = vi.fn().mockResolvedValue([sampleCategory]);
  const container = createContainer(expRepo, bizRepo, catRepo);
  return { expRepo, bizRepo, catRepo, container };
}

describe('BusinessExpensesPage', () => {
  it('shows loading state initially', () => {
    const expRepo = createMockExpenseRepo();
    expRepo.getAll = vi.fn().mockReturnValue(new Promise(() => {}));
    const bizRepo = createMockBusinessRepo();
    const catRepo = createMockCategoryRepo();
    const container = createContainer(expRepo, bizRepo, catRepo);

    renderExpensesPage(container);

    expect(screen.getByText('Loading business expenses…')).toBeDefined();
  });

  it('shows empty state when no expenses exist', async () => {
    const { container } = setupFullMocks();

    renderExpensesPage(container);

    await waitFor(() => expect(screen.getByText('No business expenses yet')).toBeDefined());
  });

  it('renders expense list when data is loaded', async () => {
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockResolvedValue([sampleExpense]);

    renderExpensesPage(container);

    await waitFor(() => expect(screen.getByText('Printer Ink')).toBeDefined());
    expect(screen.getAllByText('USD 45.00').length).toBeGreaterThan(0);
    expect(screen.getByText('Jan 15, 2026')).toBeDefined();
    expect(screen.getByText('Monthly resupply')).toBeDefined();
    expect(screen.getByText('Office Supplies')).toBeDefined();
  });

  it('shows error state when loading fails', async () => {
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockRejectedValue(new Error('DB error'));

    renderExpensesPage(container);

    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeDefined());
    expect(screen.getByText('Retry')).toBeDefined();
  });

  it('retry button triggers reload', async () => {
    let callCount = 0;
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) throw new Error('DB error');
      return [sampleExpense];
    });

    renderExpensesPage(container);

    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeDefined());
    fireEvent.click(screen.getByText('Retry'));

    await waitFor(() => expect(screen.getByText('Printer Ink')).toBeDefined());
  });

  it('displays total expenses summary', async () => {
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockResolvedValue([
      sampleExpense,
      { ...sampleExpense, id: 'exp-2' as EntityId, amount: { amountMinor: 3000, currency: 'USD' } },
    ]);

    renderExpensesPage(container);

    await waitFor(() => expect(screen.getByText('Total Expenses:')).toBeDefined());
    expect(screen.getByText('USD 75.00')).toBeDefined();
  });
});

describe('BusinessExpensesPage — create', () => {
  it('opens create form and creates an expense', async () => {
    const { expRepo, container } = setupFullMocks();
    expRepo.create = vi.fn().mockResolvedValue(sampleExpense);

    renderExpensesPage(container);

    await waitFor(() => expect(screen.getByText('No business expenses yet')).toBeDefined());

    fireEvent.click(screen.getAllByText('Add Expense')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Business/), { target: { value: 'biz-1' } });
    fireEvent.change(within(dialog).getByLabelText(/Title/), { target: { value: 'Printer Ink' } });
    fireEvent.change(within(dialog).getByLabelText(/Amount/), { target: { value: '45.00' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Expense' }));

    await waitFor(() => expect(expRepo.create).toHaveBeenCalled());
  });

  it('shows validation error for empty title', async () => {
    const { container } = setupFullMocks();

    renderExpensesPage(container);

    await waitFor(() => expect(screen.getByText('No business expenses yet')).toBeDefined());

    fireEvent.click(screen.getAllByText('Add Expense')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Expense' }));

    await waitFor(() => expect(screen.getByText('Expense title is required.')).toBeDefined());
  });

  it('shows validation error when no business is selected', async () => {
    const { container } = setupFullMocks();

    renderExpensesPage(container);

    await waitFor(() => expect(screen.getByText('No business expenses yet')).toBeDefined());

    fireEvent.click(screen.getAllByText('Add Expense')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Title/), { target: { value: 'Test Expense' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Expense' }));

    await waitFor(() => expect(screen.getByText('Please select a business.')).toBeDefined());
  });

  it('shows service error on create failure', async () => {
    const { expRepo, container } = setupFullMocks();
    expRepo.create = vi.fn().mockRejectedValue(new Error('Create failed'));

    renderExpensesPage(container);

    await waitFor(() => expect(screen.getByText('No business expenses yet')).toBeDefined());

    fireEvent.click(screen.getAllByText('Add Expense')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Business/), { target: { value: 'biz-1' } });
    fireEvent.change(within(dialog).getByLabelText(/Title/), { target: { value: 'Test Expense' } });
    fireEvent.change(within(dialog).getByLabelText(/Amount/), { target: { value: '10.00' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Expense' }));

    await waitFor(() => expect(screen.getByText('Create failed')).toBeDefined());
  });
});

describe('BusinessExpensesPage — update', () => {
  it('opens edit form and updates an expense', async () => {
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockResolvedValue([sampleExpense]);
    expRepo.update = vi.fn().mockResolvedValue({ ...sampleExpense, title: 'Updated Title' });

    renderExpensesPage(container);

    await waitFor(() => expect(screen.getByText('Printer Ink')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Edit Printer Ink'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByLabelText(/Title/)).toHaveValue('Printer Ink');

    fireEvent.change(within(dialog).getByLabelText(/Title/), { target: { value: 'Updated Title' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(expRepo.update).toHaveBeenCalled());
  });

  it('shows service error on update failure', async () => {
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockResolvedValue([sampleExpense]);
    expRepo.update = vi.fn().mockRejectedValue(new Error('Update failed'));

    renderExpensesPage(container);

    await waitFor(() => expect(screen.getByText('Printer Ink')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Edit Printer Ink'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Title/), { target: { value: 'Updated Title' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(screen.getByText('Update failed')).toBeDefined());
  });
});

describe('BusinessExpensesPage — delete', () => {
  it('shows delete confirmation dialog', async () => {
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockResolvedValue([sampleExpense]);

    renderExpensesPage(container);

    await waitFor(() => expect(screen.getByText('Printer Ink')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete Printer Ink'));
    await waitFor(() => expect(screen.getByText('Delete Expense')).toBeDefined());
    expect(screen.getByText(/Are you sure you want to delete/)).toBeDefined();
  });

  it('deletes an expense after confirmation', async () => {
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockResolvedValue([sampleExpense]);
    expRepo.remove = vi.fn().mockResolvedValue(undefined);

    renderExpensesPage(container);

    await waitFor(() => expect(screen.getByText('Printer Ink')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete Printer Ink'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(expRepo.remove).toHaveBeenCalledWith('exp-1'));
  });

  it('cancel does not delete', async () => {
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockResolvedValue([sampleExpense]);

    renderExpensesPage(container);

    await waitFor(() => expect(screen.getByText('Printer Ink')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete Printer Ink'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(expRepo.remove).not.toHaveBeenCalled();
  });

  it('shows error on delete failure', async () => {
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockResolvedValue([sampleExpense]);
    expRepo.remove = vi.fn().mockRejectedValue(new Error('Delete failed'));

    renderExpensesPage(container);

    await waitFor(() => expect(screen.getByText('Printer Ink')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete Printer Ink'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.getByText('Delete failed')).toBeDefined());
  });
});

describe('BusinessExpensesPage — refresh after mutation', () => {
  it('refreshes list after create', async () => {
    let callCount = 0;
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? [] : [sampleExpense];
    });
    expRepo.create = vi.fn().mockResolvedValue(sampleExpense);

    renderExpensesPage(container);

    await waitFor(() => expect(screen.getByText('No business expenses yet')).toBeDefined());

    fireEvent.click(screen.getAllByText('Add Expense')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Business/), { target: { value: 'biz-1' } });
    fireEvent.change(within(dialog).getByLabelText(/Title/), { target: { value: 'Printer Ink' } });
    fireEvent.change(within(dialog).getByLabelText(/Amount/), { target: { value: '45.00' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Expense' }));

    await waitFor(() => expect(screen.getByText('Printer Ink')).toBeDefined());
    expect(callCount).toBe(2);
  });

  it('refreshes list after update', async () => {
    let callCount = 0;
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return [{ ...sampleExpense, title: callCount === 1 ? 'Printer Ink' : 'Updated Title' }];
    });
    expRepo.update = vi.fn().mockResolvedValue({ ...sampleExpense, title: 'Updated Title' });

    renderExpensesPage(container);

    await waitFor(() => expect(screen.getByText('Printer Ink')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Edit Printer Ink'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Title/), { target: { value: 'Updated Title' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(screen.getByText('Updated Title')).toBeDefined());
    expect(callCount).toBe(2);
  });

  it('refreshes list after delete', async () => {
    let callCount = 0;
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? [sampleExpense] : [];
    });
    expRepo.remove = vi.fn().mockResolvedValue(undefined);

    renderExpensesPage(container);

    await waitFor(() => expect(screen.getByText('Printer Ink')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete Printer Ink'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.getByText('No business expenses yet')).toBeDefined());
    expect(callCount).toBe(2);
  });
});

describe('BusinessExpensesPage — business filtering', () => {
  it('filters expenses by selected business', async () => {
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockResolvedValue([sampleExpense]);
    expRepo.getByBusinessId = vi.fn().mockResolvedValue([sampleExpense]);

    renderExpensesPage(container);

    await waitFor(() => expect(screen.getByText('Printer Ink')).toBeDefined());
    expect(expRepo.getAll).toHaveBeenCalled();
    expect(expRepo.getByBusinessId).not.toHaveBeenCalled();

    const filterSelect = screen.getByLabelText('Filter by business');
    fireEvent.change(filterSelect, { target: { value: 'biz-1' } });

    await waitFor(() => expect(expRepo.getByBusinessId).toHaveBeenCalledWith('biz-1'));
  });
});

describe('BusinessExpensesPage — category integration', () => {
  it('displays category name on expense card', async () => {
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockResolvedValue([sampleExpense]);

    renderExpensesPage(container);

    await waitFor(() => expect(screen.getByText('Office Supplies')).toBeDefined());
  });

  it('shows category selector in form', async () => {
    const { container } = setupFullMocks();

    renderExpensesPage(container);

    await waitFor(() => expect(screen.getByText('No business expenses yet')).toBeDefined());

    fireEvent.click(screen.getAllByText('Add Expense')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    const categorySelect = within(dialog).getByLabelText(/Category/);
    expect(categorySelect).toBeDefined();
    expect(within(categorySelect).getByText('Office Supplies')).toBeDefined();
  });
});
