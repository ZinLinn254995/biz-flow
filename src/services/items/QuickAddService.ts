import type { EntityId } from '@/types/common';
import type { SavedItem, SavedItemInput } from '@/types/domain/savedItem';
import { SavedItemService } from '@/services/items/SavedItemService';

/** Prepares reusable input without creating a financial record or changing stock. */
export class QuickAddService {
  constructor(private readonly savedItemService: SavedItemService) {}

  async prepare(savedItemId: EntityId): Promise<SavedItemInput> {
    const item = await this.savedItemService.getById(savedItemId);
    if (!item) throw new Error(`Saved item not found: ${savedItemId}`);
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, favoriteOrder: _favoriteOrder, ...input } = item;
    return input;
  }

  async getFavorites(): Promise<SavedItem[]> {
    return this.savedItemService.getFavorites();
  }
}
