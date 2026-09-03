import { EntityId } from '@/types/common/base';

/**
 * Generic repository contract defining standard CRUD operations
 * for a domain entity type `T`.
 *
 * Concrete implementations (IndexedDB/Dexie in P2P2, or a future
 * cloud adapter) implement this interface. UI and feature layers
 * depend only on this contract, never on the storage technology.
 */
export interface Repository<T> {
  getById(id: EntityId): Promise<T | null>;
  getAll(): Promise<T[]>;
  create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: EntityId, changes: Partial<T>): Promise<T>;
  remove(id: EntityId): Promise<void>;
}
