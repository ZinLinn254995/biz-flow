import type { EntityId } from '@/types/common';
import type { SavedItem, SavedItemInput } from '@/types/domain/savedItem';
import type { SavedItemRepository } from '@/types/repositories/savedItemRepository';
import { requireNonEmptyString, validateMoney } from '@/services/common/validation';

export class SavedItemService {
  constructor(private readonly repository: SavedItemRepository) {}

  async create(input: SavedItemInput): Promise<SavedItem> {
    const name = requireNonEmptyString(input.name, 'name');
    if (input.amount) validateMoney(input.amount, 'amount');
    return this.repository.create({ ...input, name });
  }

  getAll(): Promise<SavedItem[]> { return this.repository.getAll(); }
  getByScope(scope: SavedItem['scope']): Promise<SavedItem[]> { return this.repository.getByScope(scope); }
  getByKind(kind: SavedItem['kind']): Promise<SavedItem[]> { return this.repository.getByKind(kind); }
  getByCategoryId(categoryId: EntityId): Promise<SavedItem[]> { return this.repository.getByCategoryId(categoryId); }
  update(id: EntityId, changes: Partial<SavedItem>): Promise<SavedItem> {
    if (changes.name !== undefined) changes.name = requireNonEmptyString(changes.name, 'name');
    if (changes.amount) validateMoney(changes.amount, 'amount');
    return this.repository.update(id, changes);
  }
  remove(id: EntityId): Promise<void> { return this.repository.remove(id); }
}
