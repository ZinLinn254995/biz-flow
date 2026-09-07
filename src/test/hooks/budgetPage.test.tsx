// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ServiceProvider } from '@/hooks/common/ServiceProvider';
import BudgetsPage from '@/pages/BudgetsPage';
import { BudgetService } from '@/services/budgets/BudgetService';
import { CategoryService } from '@/services/categories/CategoryService';
import type { ServiceContainer } from '@/services/container';
import type { BudgetRepository } from '@/types/repositories/budgetRepository';
import type { CategoryRepository } from '@/types/repositories/categoryRepository';
import type { Budget } from '@/types/domain/budget';
import type { Category } from '@/types/domain/category';
import type { EntityId } from '@/types/common/base';

function createMockBudgetRepo(): BudgetRepository {
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

const sampleCategory: Category = {
  id: 'cat-1' as EntityId,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Groceries',
  scope: 'personal',
  direction: 'expense',
};

const sampleBudget: Budget = {
  id: 'bud-1' as EntityId,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  categoryId: 'cat-1' as EntityId,
  limit: { amountMinor: 50000, currency: 'USD' },
  period: 'monthly',
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  notes: 'Monthly grocery budget',
};

function createContainer(budRepo: BudgetRepository, catRepo: CategoryRepository): ServiceContainer {
  return {
    budgetService: new BudgetService(budRepo),
    categoryService: new CategoryService(catRepo),
    businessService: {} as never,
    inventoryService: {} as never,
    salesService: {} as never,
    customerService: {} as never,
    businessExpenseService: {} as never,
    personalIncomeService: {} as never,
    personalExpenseService: {} as never,
    accountService: {} as never,
  };
}

function renderPage(container: ServiceContainer) {
  return render(
    <MemoryRouter>
      <ServiceProvider services={container}>
        <BudgetsPage />
      </ServiceProvider>
    </MemoryRouter>,
  );
}

function setupMocks(budgets: Budget[] = [], categories: Category[] = [sampleCategory]) {
  const budRepo = createMockBudgetRepo();
  budRepo.getAll = vi.fn().mockResolvedValue(budgets);
  const catRepo = createMockCategoryRepo();
  catRepo.getAll = vi.fn().mockResolvedValue(categories);
  const container = createContainer(budRepo, catRepo);
  return { budRepo, catRepo, container };
}

describe('BudgetsPage — loading and error', () => {
  it('shows loading state', () => {
    const budRepo = createMockBudgetRepo();
    budRepo.getAll = vi.fn().mockReturnValue(new Promise(() => {}));
    const catRepo = createMockCategoryRepo();
    const container = createContainer(budRepo, catRepo);

    renderPage(container);

    expect(screen.getByText('Loading budgets…')).toBeDefined();
  });

  it('shows error state on load failure', async () => {
    const budRepo = createMockBudgetRepo();
    budRepo.getAll = vi.fn().mockRejectedValue(new Error('DB error'));
    const catRepo = createMockCategoryRepo();
    const container = createContainer(budRepo, catRepo);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeDefined());
    expect(screen.getByText('Retry')).toBeDefined();
  });

  it('retry triggers reload', async () => {
    let callCount = 0;
    const budRepo = createMockBudgetRepo();
    budRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) throw new Error('DB error');
      return [sampleBudget];
    });
    const catRepo = createMockCategoryRepo();
    catRepo.getAll = vi.fn().mockResolvedValue([sampleCategory]);
    const container = createContainer(budRepo, catRepo);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeDefined());
    fireEvent.click(screen.getByText('Retry'));

    await waitFor(() => expect(screen.getByText('Groceries')).toBeDefined());
  });
});

describe('BudgetsPage — empty state', () => {
  it('shows empty state when no budgets exist', async () => {
    const { container } = setupMocks([]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('No budgets yet')).toBeDefined());
  });
});

describe('BudgetsPage — list rendering', () => {
  it('renders budget with category name', async () => {
    const { container } = setupMocks([sampleBudget]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Groceries')).toBeDefined());
  });

  it('renders budget limit', async () => {
    const { container } = setupMocks([sampleBudget]);

    renderPage(container);

    await waitFor(() => expect(screen.getAllByText('USD 500.00').length).toBeGreaterThan(0));
  });

  it('renders period badge', async () => {
    const { container } = setupMocks([sampleBudget]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Monthly')).toBeDefined());
  });

  it('renders date range', async () => {
    const { container } = setupMocks([sampleBudget]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText(/Jan 1, 2026/)).toBeDefined());
  });

  it('renders notes when available', async () => {
    const { container } = setupMocks([sampleBudget]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Monthly grocery budget')).toBeDefined());
  });

  it('renders accessible edit and delete buttons', async () => {
    const { container } = setupMocks([sampleBudget]);

    renderPage(container);

    await waitFor(() => expect(screen.getByLabelText('Edit budget Groceries')).toBeDefined());
    expect(screen.getByLabelText('Delete budget Groceries')).toBeDefined();
  });
});

describe('BudgetsPage — create', () => {
  it('opens create form', async () => {
    const { container } = setupMocks([]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('No budgets yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Budget')[0]);

    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
  });

  it('shows validation error for missing category', async () => {
    const { container } = setupMocks([]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('No budgets yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Budget')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Budget' }));

    await waitFor(() => expect(screen.getByText('Please select a category.')).toBeDefined());
  });

  it('creates budget successfully', async () => {
    const { budRepo, container } = setupMocks([]);
    budRepo.create = vi.fn().mockResolvedValue(sampleBudget);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('No budgets yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Budget')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Category/), { target: { value: 'cat-1' } });
    fireEvent.change(within(dialog).getByLabelText(/End Date/), { target: { value: '2026-01-31' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Budget' }));

    await waitFor(() => expect(budRepo.create).toHaveBeenCalled());
  });

  it('shows service error on create failure', async () => {
    const { budRepo, container } = setupMocks([]);
    budRepo.create = vi.fn().mockRejectedValue(new Error('Create failed'));

    renderPage(container);

    await waitFor(() => expect(screen.getByText('No budgets yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Budget')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Category/), { target: { value: 'cat-1' } });
    fireEvent.change(within(dialog).getByLabelText(/End Date/), { target: { value: '2026-01-31' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Budget' }));

    await waitFor(() => expect(screen.getByText('Create failed')).toBeDefined());
  });

  it('refreshes list after create', async () => {
    let callCount = 0;
    const { budRepo, container } = setupMocks([]);
    budRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? [] : [sampleBudget];
    });
    budRepo.create = vi.fn().mockResolvedValue(sampleBudget);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('No budgets yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Budget')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Category/), { target: { value: 'cat-1' } });
    fireEvent.change(within(dialog).getByLabelText(/End Date/), { target: { value: '2026-01-31' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Budget' }));

    await waitFor(() => expect(screen.getByText('Groceries')).toBeDefined());
    expect(callCount).toBe(2);
  });
});

describe('BudgetsPage — edit', () => {
  it('opens edit form with pre-populated values', async () => {
    const { container } = setupMocks([sampleBudget]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Groceries')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Edit budget Groceries'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByLabelText(/Category/)).toHaveValue('cat-1');
  });

  it('updates budget successfully', async () => {
    const { budRepo, container } = setupMocks([sampleBudget]);
    budRepo.update = vi.fn().mockResolvedValue({ ...sampleBudget, notes: 'Updated' });

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Groceries')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Edit budget Groceries'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(budRepo.update).toHaveBeenCalled());
  });

  it('shows service error on update failure', async () => {
    const { budRepo, container } = setupMocks([sampleBudget]);
    budRepo.update = vi.fn().mockRejectedValue(new Error('Update failed'));

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Groceries')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Edit budget Groceries'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(screen.getByText('Update failed')).toBeDefined());
  });

  it('refreshes list after update', async () => {
    let callCount = 0;
    const { budRepo, container } = setupMocks([sampleBudget]);
    budRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return [{ ...sampleBudget, notes: callCount === 1 ? 'Monthly grocery budget' : 'Updated notes' }];
    });
    budRepo.update = vi.fn().mockResolvedValue({ ...sampleBudget, notes: 'Updated notes' });

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Monthly grocery budget')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Edit budget Groceries'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(screen.getByText('Updated notes')).toBeDefined());
    expect(callCount).toBe(2);
  });
});

describe('BudgetsPage — delete', () => {
  it('opens delete confirmation', async () => {
    const { container } = setupMocks([sampleBudget]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Groceries')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete budget Groceries'));
    await waitFor(() => expect(screen.getByText('Delete Budget')).toBeDefined());
  });

  it('cancel does not delete', async () => {
    const { budRepo, container } = setupMocks([sampleBudget]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Groceries')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete budget Groceries'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(budRepo.remove).not.toHaveBeenCalled();
  });

  it('deletes budget after confirmation', async () => {
    const { budRepo, container } = setupMocks([sampleBudget]);
    budRepo.remove = vi.fn().mockResolvedValue(undefined);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Groceries')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete budget Groceries'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(budRepo.remove).toHaveBeenCalledWith('bud-1'));
  });

  it('shows error on delete failure', async () => {
    const { budRepo, container } = setupMocks([sampleBudget]);
    budRepo.remove = vi.fn().mockRejectedValue(new Error('Delete failed'));

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Groceries')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete budget Groceries'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.getByText('Delete failed')).toBeDefined());
  });

  it('refreshes list after delete', async () => {
    let callCount = 0;
    const { budRepo, container } = setupMocks([sampleBudget]);
    budRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? [sampleBudget] : [];
    });
    budRepo.remove = vi.fn().mockResolvedValue(undefined);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Groceries')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete budget Groceries'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.getByText('No budgets yet')).toBeDefined());
    expect(callCount).toBe(2);
  });
});

describe('BudgetsPage — category integration', () => {
  it('shows category selector in form', async () => {
    const { container } = setupMocks([]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('No budgets yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Budget')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    const categorySelect = within(dialog).getByLabelText(/Category/);
    expect(categorySelect).toBeDefined();
    expect(within(categorySelect).getByText('Groceries')).toBeDefined();
  });
});

describe('BudgetsPage — escape closes modal', () => {
  it('escape closes create form', async () => {
    const { container } = setupMocks([]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('No budgets yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Budget')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
