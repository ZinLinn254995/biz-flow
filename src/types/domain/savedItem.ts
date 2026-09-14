import type { BaseEntity, EntityId, Money } from '@/types/common';

export type SavedItemKind = 'saved' | 'quick';

export interface SavedItem extends BaseEntity {
  name: string;
  kind: SavedItemKind;
  categoryId?: EntityId;
  businessId?: EntityId;
  scope: 'business' | 'personal';
  unit?: string;
  amount?: Money;
  note?: string;
  /** Lower values appear first; absent means the item is not favorited. */
  favoriteOrder?: number;
}

export type SavedItemInput = Omit<SavedItem, 'id' | 'createdAt' | 'updatedAt'>;
