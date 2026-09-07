// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ServiceProvider } from '@/hooks/common/ServiceProvider';
import AccountsPage from '@/pages/AccountsPage';
import { AccountService } from '@/services/accounts/AccountService';
import type { ServiceContainer } from '@/services/container';
import type { AccountRepository } from '@/types/repositories/accountRepository';
import type { Account } from '@/types/domain/account';
import type { EntityId } from '@/types/common/base';

function createMockAccountRepo(): AccountRepository {
  return {
    getById: vi.fn(),
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
}

const sampleAccount: Account = {
  id: 'acc-1' as EntityId,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Checking',
  type: 'bank',
  balance: { amountMinor: 50000, currency: 'USD' },
  institution: 'Bank of America',
};

function createContainer(accRepo: AccountRepository): ServiceContainer {
  return {
    accountService: new AccountService(accRepo),
    businessService: {} as never,
    inventoryService: {} as never,
    salesService: {} as never,
    customerService: {} as never,
    businessExpenseService: {} as never,
    personalIncomeService: {} as never,
    personalExpenseService: {} as never,
    categoryService: {} as never,
    budgetService: {} as never,
  };
}

function renderPage(container: ServiceContainer) {
  return render(
    <MemoryRouter>
      <ServiceProvider services={container}>
        <AccountsPage />
      </ServiceProvider>
    </MemoryRouter>,
  );
}

function setupMocks(accounts: Account[] = []) {
  const accRepo = createMockAccountRepo();
  accRepo.getAll = vi.fn().mockResolvedValue(accounts);
  const container = createContainer(accRepo);
  return { accRepo, container };
}

describe('AccountsPage — loading and error', () => {
  it('shows loading state', () => {
    const accRepo = createMockAccountRepo();
    accRepo.getAll = vi.fn().mockReturnValue(new Promise(() => {}));
    const container = createContainer(accRepo);

    renderPage(container);

    expect(screen.getByText('Loading accounts…')).toBeDefined();
  });

  it('shows error state on load failure', async () => {
    const accRepo = createMockAccountRepo();
    accRepo.getAll = vi.fn().mockRejectedValue(new Error('DB error'));
    const container = createContainer(accRepo);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeDefined());
    expect(screen.getByText('Retry')).toBeDefined();
  });

  it('retry triggers reload', async () => {
    let callCount = 0;
    const accRepo = createMockAccountRepo();
    accRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) throw new Error('DB error');
      return [sampleAccount];
    });
    const container = createContainer(accRepo);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeDefined());
    fireEvent.click(screen.getByText('Retry'));

    await waitFor(() => expect(screen.getByText('Checking')).toBeDefined());
  });
});

describe('AccountsPage — empty state', () => {
  it('shows empty state when no accounts exist', async () => {
    const { container } = setupMocks([]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('No accounts yet')).toBeDefined());
  });
});

describe('AccountsPage — list rendering', () => {
  it('renders accounts with name and balance', async () => {
    const { container } = setupMocks([sampleAccount]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Checking')).toBeDefined());
    expect(screen.getAllByText('USD 500.00').length).toBeGreaterThan(0);
  });

  it('renders account type badge', async () => {
    const { container } = setupMocks([sampleAccount]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Bank')).toBeDefined());
  });

  it('renders institution when available', async () => {
    const { container } = setupMocks([sampleAccount]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Bank of America')).toBeDefined());
  });

  it('renders accessible edit and delete buttons', async () => {
    const { container } = setupMocks([sampleAccount]);

    renderPage(container);

    await waitFor(() => expect(screen.getByLabelText('Edit account Checking')).toBeDefined());
    expect(screen.getByLabelText('Delete account Checking')).toBeDefined();
  });
});

describe('AccountsPage — create', () => {
  it('opens create form', async () => {
    const { container } = setupMocks([]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('No accounts yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Account')[0]);

    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
  });

  it('shows validation error for empty name', async () => {
    const { container } = setupMocks([]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('No accounts yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Account')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Account' }));

    await waitFor(() => expect(screen.getByText('Account name is required.')).toBeDefined());
  });

  it('creates account successfully', async () => {
    const { accRepo, container } = setupMocks([]);
    accRepo.create = vi.fn().mockResolvedValue(sampleAccount);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('No accounts yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Account')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'Checking' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Account' }));

    await waitFor(() => expect(accRepo.create).toHaveBeenCalled());
  });

  it('shows service error on create failure', async () => {
    const { accRepo, container } = setupMocks([]);
    accRepo.create = vi.fn().mockRejectedValue(new Error('Create failed'));

    renderPage(container);

    await waitFor(() => expect(screen.getByText('No accounts yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Account')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'Test' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Account' }));

    await waitFor(() => expect(screen.getByText('Create failed')).toBeDefined());
  });

  it('refreshes list after create', async () => {
    let callCount = 0;
    const { accRepo, container } = setupMocks([]);
    accRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? [] : [sampleAccount];
    });
    accRepo.create = vi.fn().mockResolvedValue(sampleAccount);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('No accounts yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Account')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'Checking' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Account' }));

    await waitFor(() => expect(screen.getByText('Checking')).toBeDefined());
    expect(callCount).toBe(2);
  });
});

describe('AccountsPage — edit', () => {
  it('opens edit form with pre-populated values', async () => {
    const { container } = setupMocks([sampleAccount]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Checking')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Edit account Checking'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByLabelText(/Name/)).toHaveValue('Checking');
  });

  it('updates account successfully', async () => {
    const { accRepo, container } = setupMocks([sampleAccount]);
    accRepo.update = vi.fn().mockResolvedValue({ ...sampleAccount, name: 'Updated' });

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Checking')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Edit account Checking'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'Updated' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(accRepo.update).toHaveBeenCalled());
  });

  it('shows service error on update failure', async () => {
    const { accRepo, container } = setupMocks([sampleAccount]);
    accRepo.update = vi.fn().mockRejectedValue(new Error('Update failed'));

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Checking')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Edit account Checking'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'Updated' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(screen.getByText('Update failed')).toBeDefined());
  });

  it('refreshes list after update', async () => {
    let callCount = 0;
    const { accRepo, container } = setupMocks([sampleAccount]);
    accRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return [{ ...sampleAccount, name: callCount === 1 ? 'Checking' : 'Updated' }];
    });
    accRepo.update = vi.fn().mockResolvedValue({ ...sampleAccount, name: 'Updated' });

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Checking')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Edit account Checking'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'Updated' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(screen.getByText('Updated')).toBeDefined());
    expect(callCount).toBe(2);
  });
});

describe('AccountsPage — delete', () => {
  it('opens delete confirmation', async () => {
    const { container } = setupMocks([sampleAccount]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Checking')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete account Checking'));
    await waitFor(() => expect(screen.getByText('Delete Account')).toBeDefined());
  });

  it('cancel does not delete', async () => {
    const { accRepo, container } = setupMocks([sampleAccount]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Checking')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete account Checking'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(accRepo.remove).not.toHaveBeenCalled();
  });

  it('deletes account after confirmation', async () => {
    const { accRepo, container } = setupMocks([sampleAccount]);
    accRepo.remove = vi.fn().mockResolvedValue(undefined);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Checking')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete account Checking'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(accRepo.remove).toHaveBeenCalledWith('acc-1'));
  });

  it('shows error on delete failure', async () => {
    const { accRepo, container } = setupMocks([sampleAccount]);
    accRepo.remove = vi.fn().mockRejectedValue(new Error('Delete failed'));

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Checking')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete account Checking'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.getByText('Delete failed')).toBeDefined());
  });

  it('refreshes list after delete', async () => {
    let callCount = 0;
    const { accRepo, container } = setupMocks([sampleAccount]);
    accRepo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? [sampleAccount] : [];
    });
    accRepo.remove = vi.fn().mockResolvedValue(undefined);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('Checking')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete account Checking'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.getByText('No accounts yet')).toBeDefined());
    expect(callCount).toBe(2);
  });
});

describe('AccountsPage — escape closes modal', () => {
  it('escape closes create form', async () => {
    const { container } = setupMocks([]);

    renderPage(container);

    await waitFor(() => expect(screen.getByText('No accounts yet')).toBeDefined());
    fireEvent.click(screen.getAllByText('Add Account')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
