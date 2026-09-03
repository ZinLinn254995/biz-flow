// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ServiceProvider } from '@/hooks/common/ServiceProvider';
import BusinessPage from '@/pages/BusinessPage';
import { BusinessService } from '@/services/business/BusinessService';
import type { ServiceContainer } from '@/services/container';
import type { BusinessRepository } from '@/types/repositories/businessRepository';
import type { Business } from '@/types/domain/business';
import type { EntityId } from '@/types/common/base';

function createMockRepo(): BusinessRepository {
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
  description: 'A test shop',
};

function createContainer(repo: BusinessRepository): ServiceContainer {
  return {
    businessService: new BusinessService(repo),
    inventoryService: {} as never,
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

function renderBusinessPage(container: ServiceContainer) {
  return render(
    <MemoryRouter>
      <ServiceProvider services={container}>
        <BusinessPage />
      </ServiceProvider>
    </MemoryRouter>,
  );
}

describe('BusinessPage', () => {
  it('shows loading state initially', () => {
    const repo = createMockRepo();
    repo.getAll = vi.fn().mockReturnValue(new Promise(() => {}));
    const container = createContainer(repo);

    renderBusinessPage(container);

    expect(screen.getByText('Loading businesses…')).toBeDefined();
  });

  it('shows empty state when no businesses exist', async () => {
    const repo = createMockRepo();
    const container = createContainer(repo);

    renderBusinessPage(container);

    await waitFor(() => expect(screen.getByText('No businesses yet')).toBeDefined());
  });

  it('renders business list when data is loaded', async () => {
    const repo = createMockRepo();
    repo.getAll = vi.fn().mockResolvedValue([sampleBusiness]);
    const container = createContainer(repo);

    renderBusinessPage(container);

    await waitFor(() => expect(screen.getByText('Test Shop')).toBeDefined());
    expect(screen.getByText('A test shop')).toBeDefined();
    expect(screen.getByText('USD')).toBeDefined();
  });

  it('shows error state when loading fails', async () => {
    const repo = createMockRepo();
    repo.getAll = vi.fn().mockRejectedValue(new Error('DB error'));
    const container = createContainer(repo);

    renderBusinessPage(container);

    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeDefined());
    expect(screen.getByText('Retry')).toBeDefined();
  });

  it('retry button triggers reload', async () => {
    let callCount = 0;
    const repo = createMockRepo();
    repo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) throw new Error('DB error');
      return [sampleBusiness];
    });
    const container = createContainer(repo);

    renderBusinessPage(container);

    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeDefined());
    fireEvent.click(screen.getByText('Retry'));

    await waitFor(() => expect(screen.getByText('Test Shop')).toBeDefined());
  });
});

describe('BusinessPage — create', () => {
  it('opens create form and creates a business', async () => {
    const repo = createMockRepo();
    repo.create = vi.fn().mockResolvedValue(sampleBusiness);
    const container = createContainer(repo);

    renderBusinessPage(container);

    await waitFor(() => expect(screen.getByText('No businesses yet')).toBeDefined());

    fireEvent.click(screen.getAllByText('Create Business')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'New Shop' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create Business' }));

    await waitFor(() => {
      expect(repo.create).toHaveBeenCalled();
    });
  });

  it('shows validation error for empty name', async () => {
    const repo = createMockRepo();
    const container = createContainer(repo);

    renderBusinessPage(container);

    await waitFor(() => expect(screen.getByText('No businesses yet')).toBeDefined());

    fireEvent.click(screen.getAllByText('Create Business')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create Business' }));

    await waitFor(() => expect(screen.getByText('Business name is required.')).toBeDefined());
  });

  it('shows service error on create failure', async () => {
    const repo = createMockRepo();
    repo.create = vi.fn().mockRejectedValue(new Error('Create failed'));
    const container = createContainer(repo);

    renderBusinessPage(container);

    await waitFor(() => expect(screen.getByText('No businesses yet')).toBeDefined());

    fireEvent.click(screen.getAllByText('Create Business')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'New Shop' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create Business' }));

    await waitFor(() => expect(screen.getByText('Create failed')).toBeDefined());
  });
});

describe('BusinessPage — update', () => {
  it('opens edit form and updates a business', async () => {
    const repo = createMockRepo();
    repo.getAll = vi.fn().mockResolvedValue([sampleBusiness]);
    repo.update = vi.fn().mockResolvedValue({ ...sampleBusiness, name: 'Updated Shop' });
    const container = createContainer(repo);

    renderBusinessPage(container);

    await waitFor(() => expect(screen.getByText('Test Shop')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Edit Test Shop'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByLabelText(/Name/)).toHaveValue('Test Shop');

    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'Updated Shop' } });
    fireEvent.click(within(dialog).getByText('Save Changes'));

    await waitFor(() => expect(repo.update).toHaveBeenCalled());
  });
});

describe('BusinessPage — delete', () => {
  it('shows delete confirmation dialog', async () => {
    const repo = createMockRepo();
    repo.getAll = vi.fn().mockResolvedValue([sampleBusiness]);
    const container = createContainer(repo);

    renderBusinessPage(container);

    await waitFor(() => expect(screen.getByText('Test Shop')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete Test Shop'));
    await waitFor(() => expect(screen.getByText('Delete Business')).toBeDefined());
    expect(screen.getByText(/Are you sure you want to delete/)).toBeDefined();
  });

  it('deletes a business after confirmation', async () => {
    const repo = createMockRepo();
    repo.getAll = vi.fn().mockResolvedValue([sampleBusiness]);
    repo.remove = vi.fn().mockResolvedValue(undefined);
    const container = createContainer(repo);

    renderBusinessPage(container);

    await waitFor(() => expect(screen.getByText('Test Shop')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete Test Shop'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(repo.remove).toHaveBeenCalledWith('biz-1'));
  });

  it('cancel does not delete', async () => {
    const repo = createMockRepo();
    repo.getAll = vi.fn().mockResolvedValue([sampleBusiness]);
    const container = createContainer(repo);

    renderBusinessPage(container);

    await waitFor(() => expect(screen.getByText('Test Shop')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete Test Shop'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(repo.remove).not.toHaveBeenCalled();
  });

  it('shows error on delete failure', async () => {
    const repo = createMockRepo();
    repo.getAll = vi.fn().mockResolvedValue([sampleBusiness]);
    repo.remove = vi.fn().mockRejectedValue(new Error('Delete failed'));
    const container = createContainer(repo);

    renderBusinessPage(container);

    await waitFor(() => expect(screen.getByText('Test Shop')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete Test Shop'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.getByText('Delete failed')).toBeDefined());
  });
});

describe('BusinessPage — refresh after mutation', () => {
  it('refreshes list after create', async () => {
    let callCount = 0;
    const repo = createMockRepo();
    repo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? [] : [sampleBusiness];
    });
    repo.create = vi.fn().mockResolvedValue(sampleBusiness);
    const container = createContainer(repo);

    renderBusinessPage(container);

    await waitFor(() => expect(screen.getByText('No businesses yet')).toBeDefined());

    fireEvent.click(screen.getAllByText('Create Business')[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'New Shop' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create Business' }));

    await waitFor(() => expect(screen.getByText('Test Shop')).toBeDefined());
    expect(callCount).toBe(2);
  });

  it('refreshes list after delete', async () => {
    let callCount = 0;
    const repo = createMockRepo();
    repo.getAll = vi.fn().mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? [sampleBusiness] : [];
    });
    repo.remove = vi.fn().mockResolvedValue(undefined);
    const container = createContainer(repo);

    renderBusinessPage(container);

    await waitFor(() => expect(screen.getByText('Test Shop')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Delete Test Shop'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.getByText('No businesses yet')).toBeDefined());
    expect(callCount).toBe(2);
  });
});
