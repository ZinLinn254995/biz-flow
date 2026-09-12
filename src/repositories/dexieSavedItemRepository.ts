import { db } from '@/db';
import { DexieRepository } from '@/repositories/dexieRepository';
import type { EntityId } from '@/types/common';
import type { SavedItem } from '@/types/domain/savedItem';
import type { SavedItemRepository } from '@/types/repositories/savedItemRepository';

export class DexieSavedItemRepository extends DexieRepository<SavedItem> implements SavedItemRepository {
  constructor() { super(db.savedItems); }
  getByScope(scope: SavedItem['scope']): Promise<SavedItem[]> { return this.table.where('scope').equals(scope).toArray(); }
  getByKind(kind: SavedItem['kind']): Promise<SavedItem[]> { return this.table.where('kind').equals(kind).toArray(); }
  getByCategoryId(categoryId: EntityId): Promise<SavedItem[]> { return this.table.where('categoryId').equals(categoryId).toArray(); }
}
