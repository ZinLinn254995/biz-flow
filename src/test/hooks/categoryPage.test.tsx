// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ServiceProvider } from '@/hooks/common/ServiceProvider';
import CategoriesPage from '@/pages/CategoriesPage';
import { CategoryService } from '@/services/categories/CategoryService';
import type { ServiceContainer } from '@/services/container';
import type { CategoryRepository } from '@/types/repositories/categoryRepository';
import type { Category } from '@/types/domain/category';
import type { EntityId } from '@/types/common/base';

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

const sampleCategories: Category[] = [
  {
    id: 'cat-1' as EntityId,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name: 'Office Supplies',
    scope: 'business',
    direction: 'expense',
  },
  {
    id: 'cat-2' as EntityId,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name: 'Sales Revenue',
    scope: 'business',
    direction: 'income',
  },
  {
    id: 'cat-3' as EntityId,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name: 'Groceries',
    scope: 'personal',
    direction: 'expense',
  },
  {
    id: 'cat-4' as EntityId,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    name: 'Salary',
    scope: 'personal',
    direction: 'income',
  },
];

function createContainer(catRepo: CategoryRepository): ServiceContainer {
  return {
    categoryService: new CategoryService(catRepo),
    businessService: {} as never,
    inventoryService: {} as never,
    salesService: {} as never,
    customerService: {} as never,
    businessExpenseService: {} as never,
    personalIncomeService: {} as never,
    personalExpenseService: {} as never,
    budgetService: {} as never,
    accountService: {} as never,
  };
}

function renderPage(container: ServiceContainer) {
  return render(
    <MemoryRouter>
      <ServiceProvider services={container}>
        <CategoriesPage />
      </ServiceProvider>
    </MemoryRouter>,
  );
}

function setupMocks(categories: Category[] = []) {
  const catRepo = createMockCategoryRepo();
  catRepo.getAll = vi.fn().mockResolvedValue(categories);
  const container = createContainer(catRepo);
  return { catRepo, container };
}

describe('CategoriesPage — loading and error', () => {
  it('shows loading state initially', () => {
    const catRepo = createMockCategoryRepo();
    catRepo.getAll = vi.fn().mockReturnValue(new Promise(() => {}));
    const container = createContainer(catRepo);

    renderPage(container);

    expect(screen.getByText('Loading categories…')).toBeDefined();
  });

  it('shows error state when loading fails', async () => {
    const catRepo = createMockCategoryRepo();
    catRepo.getAll = vi.fn().mockRejectedValue(new Error('DB error'));
    const container = createContainer(catRepo);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeDefined());
    expect(screen.getByText('Retry')).toBeDefined();
  });

  it('retry triggers reload', async () => {
    let callCount = 0;
    const catRepo = createMockCategoryRepo();
    catRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) throw new Error('DB error');
      return sampleCategories;
    });
    const container = createContainer(catRepo);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeDefined());
    fireEvent.click(screen.getByText('Retry'));

    await waitFor(() => expect(screen.getByText('Office Supplies')).toBeDefined());
  });
});

describe('CategoriesPage — empty state', () => {
  it('shows empty state when no categories exist', async () => {
    const { container } = setupMocks([]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('No categories yet')).toBeDefined());
  });

  it('shows filtered empty state when filters return no results', async () => {
    const { container } = setupMocks([
      { id: 'cat-1' as EntityId, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', name: 'Office', scope: 'business', direction: 'expense' },
    ]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Office')).toBeDefined());

    fireEvent.change(screen.getByLabelText('Filter by scope'), { target: { value: 'personal' } });

    await waitFor(() => expect(screen.getByText('No categories match your filters')).toBeDefined());
  });

  it('clear filters button resets the list', async () => {
    const { container } = setupMocks([
      { id: 'cat-1' as EntityId, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', name: 'Office', scope: 'business', direction: 'expense' },
    ]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Office')).toBeDefined());

    fireEvent.change(screen.getByLabelText('Filter by scope'), { target: { value: 'personal' } });
    await waitFor(() => expect(screen.getByText('No categories match your filters')).toBeDefined());

    fireEvent.click(screen.getByText('Clear Filters'));
    await waitFor(() => expect(screen.getByText('Office')).toBeDefined());
  });
});

describe('CategoriesPage — list rendering', () => {
  it('renders all categories', async () => {
    const { container } = setupMocks(sampleCategories);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Office Supplies')).toBeDefined());
    expect(screen.getByText('Sales Revenue')).toBeDefined();
    expect(screen.getByText('Groceries')).toBeDefined();
    expect(screen.getByText('Salary')).toBeDefined();
  });

  it('renders business scope badge', async () => {
    const { container } = setupMocks(sampleCategories);

    renderPage(container);

    await waitFor(() => expect(screen.getAllByText('Business').length).toBeGreaterThan(0));
  });

  it('renders personal scope badge', async () => {
    const { container } = setupMocks(sampleCategories);

    renderPage(container);

    await waitFor(() => expect(screen.getAllByText('Personal').length).toBeGreaterThan(0));
  });

  it('renders income direction badge', async () => {
    const { container } = setupMocks(sampleCategories);

    renderPage(container);

    await waitFor(() => expect(screen.getAllByText('Income').length).toBeGreaterThan(0));
  });

  it('renders expense direction badge', async () => {
    const { container } = setupMocks(sampleCategories);

    renderPage(container);

    await waitFor(() => expect(screen.getAllByText('Expense').length).toBeGreaterThan(0));
  });

  it('renders accessible edit buttons', async () => {
    const { container } = setupMocks(sampleCategories);

    renderPage(container);

    await waitFor(() => expect(screen.getByLabelText('Edit category Office Supplies')).toBeDefined());
  });

  it('renders accessible delete buttons', async () => {
    const { container } = setupMocks(sampleCategories);

    renderPage(container);

    await waitFor(() => expect(screen.getByLabelText('Delete category Office Supplies')).toBeDefined());
  });
});

describe('CategoriesPage — filtering', () => {
  it('filters by business scope', async () => {
    const { container } = setupMocks(sampleCategories);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Office Supplies')).toBeDefined());

    fireEvent.change(screen.getByLabelText('Filter by scope'), { target: { value: 'business' } });

    await waitFor(() => expect(screen.getByText('Office Supplies')).toBeDefined());
    expect(screen.getByText('Sales Revenue')).toBeDefined();
    expect(screen.queryByText('Groceries')).toBeNull();
    expect(screen.queryByText('Salary')).toBeNull();
  });

  it('filters by personal scope', async () => {
    const { container } = setupMocks(sampleCategories);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Office Supplies')).toBeDefined());

    fireEvent.change(screen.getByLabelText('Filter by scope'), { target: { value: 'personal' } });

    await waitFor(() => expect(screen.getByText('Groceries')).toBeDefined());
    expect(screen.getByText('Salary')).toBeDefined();
    expect(screen.queryByText('Office Supplies')).toBeNull();
  });

  it('filters by income direction', async () => {
    const { container } = setupMocks(sampleCategories);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Office Supplies')).toBeDefined());

    fireEvent.change(screen.getByLabelText('Filter by direction'), { target: { value: 'income' } });

    await waitFor(() => expect(screen.getByText('Sales Revenue')).toBeDefined());
    expect(screen.getByText('Salary')).toBeDefined();
    expect(screen.queryByText('Office Supplies')).toBeNull();
    expect(screen.queryByText('Groceries')).toBeNull();
  });

  it('filters by expense direction', async () => {
    const { container } = setupMocks(sampleCategories);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Office Supplies')).toBeDefined());

    fireEvent.change(screen.getByLabelText('Filter by direction'), { target: { value: 'expense' } });

    await waitFor(() => expect(screen.getByText('Office Supplies')).toBeDefined());
    expect(screen.getByText('Groceries')).toBeDefined();
    expect(screen.queryByText('Sales Revenue')).toBeNull();
    expect(screen.queryByText('Salary')).toBeNull();
  });

  it('combines scope and direction filters', async () => {
    const { container } = setupMocks(sampleCategories);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Office Supplies')).toBeDefined());

    fireEvent.change(screen.getByLabelText('Filter by scope'), { target: { value: 'business' } });
    fireEvent.change(screen.getByLabelText('Filter by direction'), { target: { value: 'income' } });

    await waitFor(() => expect(screen.getByText('Sales Revenue')).toBeDefined());
    expect(screen.queryByText('Office Supplies')).toBeNull();
    expect(screen.queryByText('Groceries')).toBeNull();
    expect(screen.queryByText('Salary')).toBeNull();
  });
});

describe('CategoriesPage — create', () => {
  it('opens create form', async () => {
    const { container } = setupMocks([]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('No categories yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Category')[0]);

    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
  });

  it('shows validation error for empty name', async () => {
    const { container } = setupMocks([]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('No categories yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Category')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Category' }));

    await waitFor(() => expect(screen.getByText('Category name is required.')).toBeDefined());
  });

  it('creates a category successfully', async () => {
    const { catRepo, container } = setupMocks([]);
    catRepo.create = vi.fn().mockResolvedValue(sampleCategories[0]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('No categories yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Category')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'Office Supplies' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Category' }));

    await waitFor(() => expect(catRepo.create).toHaveBeenCalled());
  });

  it('shows service error on create failure', async () => {
    const { catRepo, container } = setupMocks([]);
    catRepo.create = vi.fn().mockRejectedValue(new Error('Create failed'));

    renderPage(container);

    await waitFor(() => expect(screen.getByText('No categories yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Category')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'Test Category' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Category' }));

    await waitFor(() => expect(screen.getByText('Create failed')).toBeDefined());
  });

  it('refreshes list after create', async () => {
    let callCount = 0;
    const { catRepo, container } = setupMocks([]);
    catRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? [] : [sampleCategories[0]];
    });
    catRepo.create = vi.fn().mockResolvedValue(sampleCategories[0]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('No categories yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Category')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'Office Supplies' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Category' }));

    await waitFor(() => expect(screen.getByText('Office Supplies')).toBeDefined());
    expect(callCount).toBe(2);
  });
});

describe('CategoriesPage — edit', () => {
  it('opens edit form with pre-populated values', async () => {
    const { container } = setupMocks([sampleCategories[0]]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Office Supplies')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Edit category Office Supplies'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByLabelText(/Name/)).toHaveValue('Office Supplies');
  });

  it('updates category successfully', async () => {
    const { catRepo, container } = setupMocks([sampleCategories[0]]);
    catRepo.update = vi.fn().mockResolvedValue({ ...sampleCategories[0], name: 'Updated Name' });

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Office Supplies')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Edit category Office Supplies'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'Updated Name' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(catRepo.update).toHaveBeenCalled());
  });

  it('shows service error on update failure', async () => {
    const { catRepo, container } = setupMocks([sampleCategories[0]]);
    catRepo.update = vi.fn().mockRejectedValue(new Error('Update failed'));

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Office Supplies')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Edit category Office Supplies'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'Updated' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(screen.getByText('Update failed')).toBeDefined());
  });

  it('refreshes list after update', async () => {
    let callCount = 0;
    const { catRepo, container } = setupMocks([sampleCategories[0]]);
    catRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return [{ ...sampleCategories[0], name: callCount === 1 ? 'Office Supplies' : 'Updated Name' }];
    });
    catRepo.update = vi.fn().mockResolvedValue({ ...sampleCategories[0], name: 'Updated Name' });

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Office Supplies')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Edit category Office Supplies'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'Updated Name' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(screen.getByText('Updated Name')).toBeDefined());
    expect(callCount).toBe(2);
  });
});

describe('CategoriesPage — delete', () => {
  it('opens delete confirmation dialog', async () => {
    const { container } = setupMocks([sampleCategories[0]]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Office Supplies')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete category Office Supplies'));
    await waitFor(() => expect(screen.getByText('Delete Category')).toBeDefined());
    expect(screen.getByText(/Are you sure you want to delete/)).toBeDefined();
  });

  it('cancel does not delete', async () => {
    const { catRepo, container } = setupMocks([sampleCategories[0]]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Office Supplies')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete category Office Supplies'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(catRepo.remove).not.toHaveBeenCalled();
  });

  it('deletes category after confirmation', async () => {
    const { catRepo, container } = setupMocks([sampleCategories[0]]);
    catRepo.remove = vi.fn().mockResolvedValue(undefined);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Office Supplies')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete category Office Supplies'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(catRepo.remove).toHaveBeenCalledWith('cat-1'));
  });

  it('shows error on delete failure', async () => {
    const { catRepo, container } = setupMocks([sampleCategories[0]]);
    catRepo.remove = vi.fn().mockRejectedValue(new Error('Delete failed'));

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Office Supplies')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete category Office Supplies'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.getByText('Delete failed')).toBeDefined());
  });

  it('refreshes list after delete', async () => {
    let callCount = 0;
    const { catRepo, container } = setupMocks([sampleCategories[0]]);
    catRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? [sampleCategories[0]] : [];
    });
    catRepo.remove = vi.fn().mockResolvedValue(undefined);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Office Supplies')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete category Office Supplies'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.getByText('No categories yet')).toBeDefined());
    expect(callCount).toBe(2);
  });
});

describe('CategoriesPage — escape closes modal', () => {
  it('escape closes create form', async () => {
    const { container } = setupMocks([]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('No categories yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Category')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('escape closes delete dialog', async () => {
    const { container } = setupMocks([sampleCategories[0]]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Office Supplies')).toBeDefined());
    fireEvent.click(screen.getByLabelText('Delete category Office Supplies'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
