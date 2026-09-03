import { describe, it, expect, afterEach } from 'vitest';
import { createTestContext } from '@/test/helpers';
import { BizFlowDB } from '@/db/database';
import type { EntityId } from '@/types/common/base';

const ctx = createTestContext();

afterEach(async () => {
  if (ctx.db.isOpen()) {
    await ctx.db.transaction('rw', ctx.db.businesses, async () => {
      await ctx.db.businesses.clear();
    });
  }
});

describe('IndexedDB persistence across database reopen', () => {
  it('record survives closing and reopening the database', async () => {
    const localCtx = createTestContext();

    const business = await localCtx.businessRepository.create({
      name: 'Persistent Business',
      currency: 'USD',
    });

    const dbName = localCtx.db.name;
    localCtx.db.close();

    const reopenedDb = new BizFlowDB(dbName);
    const retrieved = await reopenedDb.businesses.get(business.id);

    expect(retrieved).not.toBeNull();
    expect(retrieved!.name).toBe('Persistent Business');
    expect(retrieved!.currency).toBe('USD');
    expect(retrieved!.id).toBe(business.id);

    reopenedDb.close();
  });

  it('multiple records survive database reopen', async () => {
    const localCtx = createTestContext();

    await localCtx.businessRepository.create({ name: 'A', currency: 'USD' });
    await localCtx.businessRepository.create({ name: 'B', currency: 'EUR' });
    await localCtx.businessRepository.create({ name: 'C', currency: 'THB' });

    const dbName = localCtx.db.name;
    localCtx.db.close();

    const reopenedDb = new BizFlowDB(dbName);
    const all = await reopenedDb.businesses.toArray();

    expect(all).toHaveLength(3);
    expect(all.map((b) => b.name).sort()).toEqual(['A', 'B', 'C']);

    reopenedDb.close();
  });
});

describe('Error behavior', () => {
  it('getById returns null for genuinely missing record', async () => {
    const result = await ctx.businessRepository.getById(
      'definitely-missing' as EntityId,
    );
    expect(result).toBeNull();
  });

  it('update throws when target record does not exist', async () => {
    await expect(
      ctx.businessRepository.update('nonexistent' as EntityId, { name: 'X' }),
    ).rejects.toThrow();
  });

  it('remove does not throw for missing record', async () => {
    await expect(
      ctx.businessRepository.remove('nonexistent' as EntityId),
    ).resolves.toBeUndefined();
  });
});
