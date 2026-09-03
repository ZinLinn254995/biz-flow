import type { Table, UpdateSpec } from 'dexie';
import type { EntityId, ISODateString } from '@/types/common/base';
import type { Repository } from '@/types/repositories/repository';

/**
 * Generates a stable, client-side unique identifier.
 * Uses the Web Crypto API when available, falling back to a
 * timestamp+random composite for older environments.
 */
function generateId(): EntityId {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID() as EntityId;
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}` as EntityId;
}

function nowISO(): ISODateString {
  return new Date().toISOString();
}

/**
 * Abstract base class providing the five standard Repository<T>
 * operations against a Dexie table. Concrete repositories extend
 * this class and pass their table in the constructor.
 *
 * `create` generates the stable id, createdAt, and updatedAt fields
 * so callers never need to supply them.
 */
export abstract class DexieRepository<T>
  implements Repository<T>
{
  protected constructor(protected readonly table: Table<T, EntityId>) {}

  async getById(id: EntityId): Promise<T | null> {
    return (await this.table.get(id)) ?? null;
  }

  async getAll(): Promise<T[]> {
    return this.table.toArray();
  }

  async create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const now = nowISO();
    const record = {
      ...entity,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    } as unknown as T;
    await this.table.add(record);
    return record;
  }

  async update(id: EntityId, changes: Partial<T>): Promise<T> {
    const updateData: UpdateSpec<T> = {
      ...changes,
      updatedAt: nowISO(),
    } as unknown as UpdateSpec<T>;
    await this.table.update(id, updateData);
    const updated = await this.table.get(id);
    if (!updated) {
      throw new Error(`Record not found: ${id}`);
    }
    return updated;
  }

  async remove(id: EntityId): Promise<void> {
    await this.table.delete(id);
  }
}
