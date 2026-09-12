import type { EntityId } from '@/types/common';
import type { SavedItem } from '@/types/domain/savedItem';
import type { Repository } from '@/types/repositories/repository';

export interface SavedItemRepository extends Repository<SavedItem> {
  getByScope(scope: SavedItem['scope']): Promise<SavedItem[]>;
  getByKind(kind: SavedItem['kind']): Promise<SavedItem[]>;
  getByCategoryId(categoryId: EntityId): Promise<SavedItem[]>;
}
