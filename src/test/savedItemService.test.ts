import { describe, expect, it, vi } from 'vitest';
import { SavedItemService } from '@/services/items/SavedItemService';
import { ValidationError } from '@/services/common/errors';
import type { SavedItemRepository } from '@/types/repositories/savedItemRepository';

const input = { name: 'Consultation', kind: 'saved' as const, scope: 'personal' as const };
function repo(): SavedItemRepository { return { getById: vi.fn(), getAll: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), getByScope: vi.fn(), getByKind: vi.fn(), getByCategoryId: vi.fn() }; }

describe('SavedItemService', () => {
  it('validates and creates saved items', async () => { const r = repo(); vi.mocked(r.create).mockResolvedValue({ ...input, id: '1' as never, createdAt: '', updatedAt: '' }); await new SavedItemService(r).create(input); expect(r.create).toHaveBeenCalledWith(input); });
  it('rejects blank names', async () => { await expect(new SavedItemService(repo()).create({ ...input, name: ' ' })).rejects.toBeInstanceOf(ValidationError); });
  it('validates money', async () => { await expect(new SavedItemService(repo()).create({ ...input, amount: { amountMinor: 1.2, currency: 'USD' } })).rejects.toBeInstanceOf(ValidationError); });
});
