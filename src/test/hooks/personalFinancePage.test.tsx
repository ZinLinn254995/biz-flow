// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ServiceProvider } from '@/hooks/common/ServiceProvider';
import PersonalFinancePage from '@/pages/PersonalFinancePage';
import { PersonalIncomeService } from '@/services/personalFinance/PersonalIncomeService';
import { PersonalExpenseService } from '@/services/personalFinance/PersonalExpenseService';
import { CategoryService } from '@/services/categories/CategoryService';
import { AccountService } from '@/services/accounts/AccountService';
import type { ServiceContainer } from '@/services/container';
import type { PersonalIncomeRepository } from '@/types/repositories/personalIncomeRepository';
import type { PersonalExpenseRepository } from '@/types/repositories/personalExpenseRepository';
import type { CategoryRepository } from '@/types/repositories/categoryRepository';
import type { AccountRepository } from '@/types/repositories/accountRepository';
import type { PersonalIncome, PersonalExpense } from '@/types/domain/personalFinance';
import type { Category } from '@/types/domain/category';
import type { Account } from '@/types/domain/account';
import type { EntityId } from '@/types/common/base';

function createMockIncomeRepo(): PersonalIncomeRepository {
  return {
    getById: vi.fn(),
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
}

function createMockExpenseRepo(): PersonalExpenseRepository {
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

function createMockAccountRepo(): AccountRepository {
  return {
    getById: vi.fn(),
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
}

const sampleIncomeCategory: Category = {
  id: 'cat-inc' as EntityId,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Salary',
  scope: 'personal',
  direction: 'income',
};

const sampleExpenseCategory: Category = {
  id: 'cat-exp' as EntityId,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Groceries',
  scope: 'personal',
  direction: 'expense',
};

const sampleAccount: Account = {
  id: 'acc-1' as EntityId,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Checking',
  type: 'bank',
  balance: { amountMinor: 50000, currency: 'USD' },
};

const sampleIncome: PersonalIncome = {
  id: 'inc-1' as EntityId,
  createdAt: '2026-01-15T00:00:00.000Z',
  updatedAt: '2026-01-15T00:00:00.000Z',
  source: 'Monthly Salary',
  date: '2026-01-15',
  amount: { amountMinor: 50000, currency: 'USD' },
  categoryId: 'cat-inc' as EntityId,
  accountId: 'acc-1' as EntityId,
  notes: 'January salary',
};

const sampleExpense: PersonalExpense = {
  id: 'exp-1' as EntityId,
  createdAt: '2026-01-16T00:00:00.000Z',
  updatedAt: '2026-01-16T00:00:00.000Z',
  title: 'Grocery Shopping',
  date: '2026-01-16',
  amount: { amountMinor: 15000, currency: 'USD' },
  categoryId: 'cat-exp' as EntityId,
  accountId: 'acc-1' as EntityId,
  notes: 'Weekly groceries',
};

function createContainer(
  incRepo: PersonalIncomeRepository,
  expRepo: PersonalExpenseRepository,
  catRepo: CategoryRepository,
  accRepo: AccountRepository,
): ServiceContainer {
  return {
    personalIncomeService: new PersonalIncomeService(incRepo),
    personalExpenseService: new PersonalExpenseService(expRepo),
    categoryService: new CategoryService(catRepo),
    accountService: new AccountService(accRepo),
    businessService: {} as never,
    inventoryService: {} as never,
    salesService: {} as never,
    customerService: {} as never,
    businessExpenseService: {} as never,
    budgetService: {} as never,
  };
}

function renderPage(container: ServiceContainer) {
  return render(
    <MemoryRouter>
      <ServiceProvider services={container}>
        <PersonalFinancePage />
      </ServiceProvider>
    </MemoryRouter>,
  );
}

function setupFullMocks() {
  const incRepo = createMockIncomeRepo();
  const expRepo = createMockExpenseRepo();
  const catRepo = createMockCategoryRepo();
  catRepo.getAll = vi.fn().mockResolvedValue([sampleIncomeCategory, sampleExpenseCategory]);
  const accRepo = createMockAccountRepo();
  accRepo.getAll = vi.fn().mockResolvedValue([sampleAccount]);
  const container = createContainer(incRepo, expRepo, catRepo, accRepo);
  return { incRepo, expRepo, catRepo, accRepo, container };
}

describe('PersonalFinancePage — rendering', () => {
  it('renders page header', async () => {
    const { container } = setupFullMocks();
    renderPage(container);
    expect(screen.getByText('Personal Finance')).toBeDefined();
  });

  it('shows income loading state', () => {
    const incRepo = createMockIncomeRepo();
    incRepo.getAll = vi.fn().mockReturnValue(new Promise(() => {}));
    const expRepo = createMockExpenseRepo();
    const catRepo = createMockCategoryRepo();
    const accRepo = createMockAccountRepo();
    const container = createContainer(incRepo, expRepo, catRepo, accRepo);

    renderPage(container);

    expect(screen.getByText('Loading personal income…')).toBeDefined();
  });

  it('shows expense loading state', () => {
    const incRepo = createMockIncomeRepo();
    const expRepo = createMockExpenseRepo();
    expRepo.getAll = vi.fn().mockReturnValue(new Promise(() => {}));
    const catRepo = createMockCategoryRepo();
    const accRepo = createMockAccountRepo();
    const container = createContainer(incRepo, expRepo, catRepo, accRepo);

    renderPage(container);

    expect(screen.getByText('Loading personal expenses…')).toBeDefined();
  });

  it('shows income empty state', async () => {
    const { container } = setupFullMocks();
    renderPage(container);
    await waitFor(() => expect(screen.getByText('No personal income yet')).toBeDefined());
  });

  it('shows expense empty state', async () => {
    const { container } = setupFullMocks();
    renderPage(container);
    await waitFor(() => expect(screen.getByText('No personal expenses yet')).toBeDefined());
  });

  it('renders income list when data is loaded', async () => {
    const { incRepo, container } = setupFullMocks();
    incRepo.getAll = vi.fn().mockResolvedValue([sampleIncome]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Monthly Salary')).toBeDefined());
    expect(screen.getByText('Jan 15, 2026')).toBeDefined();
    expect(screen.getByText('January salary')).toBeDefined();
    expect(screen.getByText('Salary')).toBeDefined();
    expect(screen.getByText('Checking')).toBeDefined();
  });

  it('renders expense list when data is loaded', async () => {
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockResolvedValue([sampleExpense]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Grocery Shopping')).toBeDefined());
    expect(screen.getByText('Jan 16, 2026')).toBeDefined();
    expect(screen.getByText('Weekly groceries')).toBeDefined();
    expect(screen.getByText('Groceries')).toBeDefined();
  });

  it('shows income error state', async () => {
    const { incRepo, container } = setupFullMocks();
    incRepo.getAll = vi.fn().mockRejectedValue(new Error('DB error'));

    renderPage(container);

    await waitFor(() => expect(screen.getByText("We couldn't load your income records.")).toBeDefined());
    expect(screen.getAllByText('Retry').length).toBeGreaterThan(0);
  });

  it('shows expense error state', async () => {
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockRejectedValue(new Error('DB error'));

    renderPage(container);

    await waitFor(() => expect(screen.getByText("We couldn't load your expense records.")).toBeDefined());
    expect(screen.getAllByText('Retry').length).toBeGreaterThan(0);
  });

  it('income retry triggers reload', async () => {
    let callCount = 0;
    const { incRepo, container } = setupFullMocks();
    incRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) throw new Error('DB error');
      return [sampleIncome];
    });

    renderPage(container);

    await waitFor(() => expect(screen.getByText("We couldn't load your income records.")).toBeDefined());
    const retryButtons = screen.getAllByText('Retry');
    fireEvent.click(retryButtons[0]);

    await waitFor(() => expect(screen.getByText('Monthly Salary')).toBeDefined());
  });

  it('expense retry triggers reload', async () => {
    let callCount = 0;
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) throw new Error('DB error');
      return [sampleExpense];
    });

    renderPage(container);

    await waitFor(() => expect(screen.getByText("We couldn't load your expense records.")).toBeDefined());
    const retryButtons = screen.getAllByText('Retry');
    fireEvent.click(retryButtons[0]);

    await waitFor(() => expect(screen.getByText('Grocery Shopping')).toBeDefined());
  });
});

describe('PersonalFinancePage — summary', () => {
  it('displays total income', async () => {
    const { incRepo, container } = setupFullMocks();
    incRepo.getAll = vi.fn().mockResolvedValue([sampleIncome]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Total Income')).toBeDefined());
    expect(screen.getAllByText('USD 500.00').length).toBeGreaterThan(0);
  });

  it('displays total expenses', async () => {
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockResolvedValue([sampleExpense]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Total Expenses')).toBeDefined());
    expect(screen.getAllByText('USD 150.00').length).toBeGreaterThan(0);
  });

  it('displays balance correctly', async () => {
    const { incRepo, expRepo, container } = setupFullMocks();
    incRepo.getAll = vi.fn().mockResolvedValue([sampleIncome]);
    expRepo.getAll = vi.fn().mockResolvedValue([sampleExpense]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Balance')).toBeDefined());
    expect(screen.getAllByText('USD 350.00').length).toBeGreaterThan(0);
  });

  it('handles multiple currencies separately', async () => {
    const { incRepo, expRepo, container } = setupFullMocks();
    incRepo.getAll = vi.fn().mockResolvedValue([
      sampleIncome,
      { ...sampleIncome, id: 'inc-2' as EntityId, amount: { amountMinor: 10000, currency: 'EUR' } },
    ]);
    expRepo.getAll = vi.fn().mockResolvedValue([
      { ...sampleExpense, amount: { amountMinor: 5000, currency: 'EUR' } },
    ]);

    renderPage(container);

    await waitFor(() => expect(screen.getAllByText('USD 500.00').length).toBeGreaterThan(0));
    expect(screen.getAllByText('EUR 100.00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('EUR 50.00').length).toBeGreaterThan(0);
  });
});

describe('PersonalFinancePage — income CRUD', () => {
  it('opens create income form and creates income', async () => {
    const { incRepo, container } = setupFullMocks();
    incRepo.create = vi.fn().mockResolvedValue(sampleIncome);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('No personal income yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Income')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Source/), { target: { value: 'Monthly Salary' } });
    fireEvent.change(within(dialog).getByLabelText(/Amount/), { target: { value: '500.00' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Income' }));

    await waitFor(() => expect(incRepo.create).toHaveBeenCalled());
  });

  it('shows validation error for empty source', async () => {
    const { container } = setupFullMocks();

    renderPage(container);
    await waitFor(() => expect(screen.getByText('No personal income yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Income')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Income' }));

    await waitFor(() => expect(screen.getByText('Income source is required.')).toBeDefined());
  });

  it('shows service error on income create failure', async () => {
    const { incRepo, container } = setupFullMocks();
    incRepo.create = vi.fn().mockRejectedValue(new Error('Create failed'));

    renderPage(container);
    await waitFor(() => expect(screen.getByText('No personal income yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Income')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Source/), { target: { value: 'Salary' } });
    fireEvent.change(within(dialog).getByLabelText(/Amount/), { target: { value: '100.00' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Income' }));

    await waitFor(() => expect(screen.getByText('Create failed')).toBeDefined());
  });

  it('opens edit income form and updates income', async () => {
    const { incRepo, container } = setupFullMocks();
    incRepo.getAll = vi.fn().mockResolvedValue([sampleIncome]);
    incRepo.update = vi.fn().mockResolvedValue({ ...sampleIncome, source: 'Updated Salary' });

    renderPage(container);
    await waitFor(() => expect(screen.getByText('Monthly Salary')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Edit Monthly Salary'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByLabelText(/Source/)).toHaveValue('Monthly Salary');
    fireEvent.change(within(dialog).getByLabelText(/Source/), { target: { value: 'Updated Salary' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(incRepo.update).toHaveBeenCalled());
  });

  it('shows service error on income update failure', async () => {
    const { incRepo, container } = setupFullMocks();
    incRepo.getAll = vi.fn().mockResolvedValue([sampleIncome]);
    incRepo.update = vi.fn().mockRejectedValue(new Error('Update failed'));

    renderPage(container);
    await waitFor(() => expect(screen.getByText('Monthly Salary')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Edit Monthly Salary'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Source/), { target: { value: 'Updated' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(screen.getByText('Update failed')).toBeDefined());
  });

  it('shows income delete confirmation', async () => {
    const { incRepo, container } = setupFullMocks();
    incRepo.getAll = vi.fn().mockResolvedValue([sampleIncome]);

    renderPage(container);
    await waitFor(() => expect(screen.getByText('Monthly Salary')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete Monthly Salary'));
    await waitFor(() => expect(screen.getByText('Delete Income')).toBeDefined());
    expect(screen.getByText(/Are you sure you want to delete/)).toBeDefined();
  });

  it('deletes income after confirmation', async () => {
    const { incRepo, container } = setupFullMocks();
    incRepo.getAll = vi.fn().mockResolvedValue([sampleIncome]);
    incRepo.remove = vi.fn().mockResolvedValue(undefined);

    renderPage(container);
    await waitFor(() => expect(screen.getByText('Monthly Salary')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete Monthly Salary'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(incRepo.remove).toHaveBeenCalledWith('inc-1'));
  });

  it('cancel income delete does nothing', async () => {
    const { incRepo, container } = setupFullMocks();
    incRepo.getAll = vi.fn().mockResolvedValue([sampleIncome]);

    renderPage(container);
    await waitFor(() => expect(screen.getByText('Monthly Salary')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete Monthly Salary'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(incRepo.remove).not.toHaveBeenCalled();
  });

  it('shows error on income delete failure', async () => {
    const { incRepo, container } = setupFullMocks();
    incRepo.getAll = vi.fn().mockResolvedValue([sampleIncome]);
    incRepo.remove = vi.fn().mockRejectedValue(new Error('Delete failed'));

    renderPage(container);
    await waitFor(() => expect(screen.getByText('Monthly Salary')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete Monthly Salary'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.getByText('Delete failed')).toBeDefined());
  });

  it('refreshes income list after create', async () => {
    let callCount = 0;
    const { incRepo, container } = setupFullMocks();
    incRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? [] : [sampleIncome];
    });
    incRepo.create = vi.fn().mockResolvedValue(sampleIncome);

    renderPage(container);
    await waitFor(() => expect(screen.getByText('No personal income yet')).toBeDefined());

    fireEvent.click(screen.getAllByText('Add Income')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Source/), { target: { value: 'Monthly Salary' } });
    fireEvent.change(within(dialog).getByLabelText(/Amount/), { target: { value: '500.00' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Income' }));

    await waitFor(() => expect(screen.getByText('Monthly Salary')).toBeDefined());
    expect(callCount).toBe(2);
  });

  it('refreshes income list after update', async () => {
    let callCount = 0;
    const { incRepo, container } = setupFullMocks();
    incRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return [{ ...sampleIncome, source: callCount === 1 ? 'Monthly Salary' : 'Updated Salary' }];
    });
    incRepo.update = vi.fn().mockResolvedValue({ ...sampleIncome, source: 'Updated Salary' });

    renderPage(container);
    await waitFor(() => expect(screen.getByText('Monthly Salary')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Edit Monthly Salary'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Source/), { target: { value: 'Updated Salary' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(screen.getByText('Updated Salary')).toBeDefined());
    expect(callCount).toBe(2);
  });

  it('refreshes income list after delete', async () => {
    let callCount = 0;
    const { incRepo, container } = setupFullMocks();
    incRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? [sampleIncome] : [];
    });
    incRepo.remove = vi.fn().mockResolvedValue(undefined);

    renderPage(container);
    await waitFor(() => expect(screen.getByText('Monthly Salary')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete Monthly Salary'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.getByText('No personal income yet')).toBeDefined());
    expect(callCount).toBe(2);
  });
});

describe('PersonalFinancePage — expense CRUD', () => {
  it('opens create expense form and creates expense', async () => {
    const { expRepo, container } = setupFullMocks();
    expRepo.create = vi.fn().mockResolvedValue(sampleExpense);

    renderPage(container);
    await waitFor(() => expect(screen.getByText('No personal expenses yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Expense')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Title/), { target: { value: 'Grocery Shopping' } });
    fireEvent.change(within(dialog).getByLabelText(/Amount/), { target: { value: '150.00' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Expense' }));

    await waitFor(() => expect(expRepo.create).toHaveBeenCalled());
  });

  it('shows validation error for empty title', async () => {
    const { container } = setupFullMocks();

    renderPage(container);
    await waitFor(() => expect(screen.getByText('No personal expenses yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Expense')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Expense' }));

    await waitFor(() => expect(screen.getByText('Expense title is required.')).toBeDefined());
  });

  it('shows service error on expense create failure', async () => {
    const { expRepo, container } = setupFullMocks();
    expRepo.create = vi.fn().mockRejectedValue(new Error('Create failed'));

    renderPage(container);
    await waitFor(() => expect(screen.getByText('No personal expenses yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Expense')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Title/), { target: { value: 'Test' } });
    fireEvent.change(within(dialog).getByLabelText(/Amount/), { target: { value: '10.00' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Expense' }));

    await waitFor(() => expect(screen.getByText('Create failed')).toBeDefined());
  });

  it('opens edit expense form and updates expense', async () => {
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockResolvedValue([sampleExpense]);
    expRepo.update = vi.fn().mockResolvedValue({ ...sampleExpense, title: 'Updated Shopping' });

    renderPage(container);
    await waitFor(() => expect(screen.getByText('Grocery Shopping')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Edit Grocery Shopping'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByLabelText(/Title/)).toHaveValue('Grocery Shopping');
    fireEvent.change(within(dialog).getByLabelText(/Title/), { target: { value: 'Updated Shopping' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(expRepo.update).toHaveBeenCalled());
  });

  it('shows service error on expense update failure', async () => {
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockResolvedValue([sampleExpense]);
    expRepo.update = vi.fn().mockRejectedValue(new Error('Update failed'));

    renderPage(container);
    await waitFor(() => expect(screen.getByText('Grocery Shopping')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Edit Grocery Shopping'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Title/), { target: { value: 'Updated' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(screen.getByText('Update failed')).toBeDefined());
  });

  it('shows expense delete confirmation', async () => {
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockResolvedValue([sampleExpense]);

    renderPage(container);
    await waitFor(() => expect(screen.getByText('Grocery Shopping')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete Grocery Shopping'));
    await waitFor(() => expect(screen.getByText('Delete Expense')).toBeDefined());
  });

  it('deletes expense after confirmation', async () => {
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockResolvedValue([sampleExpense]);
    expRepo.remove = vi.fn().mockResolvedValue(undefined);

    renderPage(container);
    await waitFor(() => expect(screen.getByText('Grocery Shopping')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete Grocery Shopping'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(expRepo.remove).toHaveBeenCalledWith('exp-1'));
  });

  it('cancel expense delete does nothing', async () => {
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockResolvedValue([sampleExpense]);

    renderPage(container);
    await waitFor(() => expect(screen.getByText('Grocery Shopping')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete Grocery Shopping'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(expRepo.remove).not.toHaveBeenCalled();
  });

  it('shows error on expense delete failure', async () => {
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockResolvedValue([sampleExpense]);
    expRepo.remove = vi.fn().mockRejectedValue(new Error('Delete failed'));

    renderPage(container);
    await waitFor(() => expect(screen.getByText('Grocery Shopping')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete Grocery Shopping'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.getByText('Delete failed')).toBeDefined());
  });

  it('refreshes expense list after create', async () => {
    let callCount = 0;
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? [] : [sampleExpense];
    });
    expRepo.create = vi.fn().mockResolvedValue(sampleExpense);

    renderPage(container);
    await waitFor(() => expect(screen.getByText('No personal expenses yet')).toBeDefined());

    fireEvent.click(screen.getAllByText('Add Expense')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Title/), { target: { value: 'Grocery Shopping' } });
    fireEvent.change(within(dialog).getByLabelText(/Amount/), { target: { value: '150.00' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Expense' }));

    await waitFor(() => expect(screen.getByText('Grocery Shopping')).toBeDefined());
    expect(callCount).toBe(2);
  });

  it('refreshes expense list after update', async () => {
    let callCount = 0;
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return [{ ...sampleExpense, title: callCount === 1 ? 'Grocery Shopping' : 'Updated Shopping' }];
    });
    expRepo.update = vi.fn().mockResolvedValue({ ...sampleExpense, title: 'Updated Shopping' });

    renderPage(container);
    await waitFor(() => expect(screen.getByText('Grocery Shopping')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Edit Grocery Shopping'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Title/), { target: { value: 'Updated Shopping' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(screen.getByText('Updated Shopping')).toBeDefined());
    expect(callCount).toBe(2);
  });

  it('refreshes expense list after delete', async () => {
    let callCount = 0;
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? [sampleExpense] : [];
    });
    expRepo.remove = vi.fn().mockResolvedValue(undefined);

    renderPage(container);
    await waitFor(() => expect(screen.getByText('Grocery Shopping')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete Grocery Shopping'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.getByText('No personal expenses yet')).toBeDefined());
    expect(callCount).toBe(2);
  });
});

describe('PersonalFinancePage — category and account integration', () => {
  it('shows category selector in income form with personal income categories', async () => {
    const { container } = setupFullMocks();

    renderPage(container);
    await waitFor(() => expect(screen.getByText('No personal income yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Income')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    const categorySelect = within(dialog).getByLabelText(/Category/);
    expect(categorySelect).toBeDefined();
    expect(within(categorySelect).getByText('Salary')).toBeDefined();
  });

  it('shows category selector in expense form with personal expense categories', async () => {
    const { container } = setupFullMocks();

    renderPage(container);
    await waitFor(() => expect(screen.getByText('No personal expenses yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Expense')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    const categorySelect = within(dialog).getByLabelText(/Category/);
    expect(categorySelect).toBeDefined();
    expect(within(categorySelect).getByText('Groceries')).toBeDefined();
  });

  it('shows account selector in income form', async () => {
    const { container } = setupFullMocks();

    renderPage(container);
    await waitFor(() => expect(screen.getByText('No personal income yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Income')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    const accountSelect = within(dialog).getByLabelText(/Account/);
    expect(accountSelect).toBeDefined();
    expect(within(accountSelect).getByText('Checking')).toBeDefined();
  });

  it('shows account selector in expense form', async () => {
    const { container } = setupFullMocks();

    renderPage(container);
    await waitFor(() => expect(screen.getByText('No personal expenses yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Expense')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    const accountSelect = within(dialog).getByLabelText(/Account/);
    expect(accountSelect).toBeDefined();
    expect(within(accountSelect).getByText('Checking')).toBeDefined();
  });

  it('displays category name on income card', async () => {
    const { incRepo, container } = setupFullMocks();
    incRepo.getAll = vi.fn().mockResolvedValue([sampleIncome]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Salary')).toBeDefined());
  });

  it('displays account name on expense card', async () => {
    const { expRepo, container } = setupFullMocks();
    expRepo.getAll = vi.fn().mockResolvedValue([sampleExpense]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Checking')).toBeDefined());
  });
});
