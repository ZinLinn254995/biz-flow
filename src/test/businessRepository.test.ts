import { describe, it, expect, afterEach } from 'vitest';
import { createTestContext } from '@/test/helpers';
import type { EntityId } from '@/types/common/base';

const ctx = createTestContext();

afterEach(async () => {
  await ctx.db.transaction('rw', ctx.db.businesses, async () => {
    await ctx.db.businesses.clear();
  });
});

describe('DexieBusinessRepository', () => {
  describe('create', () => {
    it('generates a valid id, createdAt, and updatedAt', async () => {
      const business = await ctx.businessRepository.create({
        name: 'Test Business',
        currency: 'USD',
      });

      expect(business.id).toBeTruthy();
      expect(typeof business.id).toBe('string');
      expect(business.createdAt).toBeTruthy();
      expect(business.updatedAt).toBeTruthy();
      expect(business.name).toBe('Test Business');
      expect(business.currency).toBe('USD');
    });

    it('persists the record in IndexedDB', async () => {
      const business = await ctx.businessRepository.create({
        name: 'Persisted Business',
        currency: 'EUR',
      });

      const retrieved = await ctx.businessRepository.getById(business.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.name).toBe('Persisted Business');
    });
  });

  describe('getById', () => {
    it('returns the correct record', async () => {
      const business = await ctx.businessRepository.create({
        name: 'Find Me',
        currency: 'THB',
      });

      const retrieved = await ctx.businessRepository.getById(business.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe(business.id);
      expect(retrieved!.name).toBe('Find Me');
    });

    it('returns null for a missing ID', async () => {
      const missing = await ctx.businessRepository.getById(
        'nonexistent-id' as EntityId,
      );
      expect(missing).toBeNull();
    });
  });

  describe('getAll', () => {
    it('returns all persisted records', async () => {
      await ctx.businessRepository.create({ name: 'Business A', currency: 'USD' });
      await ctx.businessRepository.create({ name: 'Business B', currency: 'USD' });

      const all = await ctx.businessRepository.getAll();
      expect(all).toHaveLength(2);
    });

    it('returns empty array when no records exist', async () => {
      const all = await ctx.businessRepository.getAll();
      expect(all).toEqual([]);
    });
  });

  describe('update', () => {
    it('updates only the requested fields', async () => {
      const business = await ctx.businessRepository.create({
        name: 'Original Name',
        currency: 'USD',
      });

      const updated = await ctx.businessRepository.update(business.id, {
        name: 'Updated Name',
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.currency).toBe('USD');
    });

    it('preserves the existing ID', async () => {
      const business = await ctx.businessRepository.create({
        name: 'Original',
        currency: 'USD',
      });

      const updated = await ctx.businessRepository.update(business.id, {
        name: 'Updated',
      });

      expect(updated.id).toBe(business.id);
    });

    it('preserves createdAt', async () => {
      const business = await ctx.businessRepository.create({
        name: 'Original',
        currency: 'USD',
      });

      const updated = await ctx.businessRepository.update(business.id, {
        name: 'Updated',
      });

      expect(updated.createdAt).toBe(business.createdAt);
    });

    it('refreshes updatedAt', async () => {
      const business = await ctx.businessRepository.create({
        name: 'Original',
        currency: 'USD',
      });

      await new Promise((r) => setTimeout(r, 10));

      const updated = await ctx.businessRepository.update(business.id, {
        name: 'Updated',
      });

      expect(updated.updatedAt).not.toBe(business.updatedAt);
    });

    it('throws when the target record does not exist', async () => {
      await expect(
        ctx.businessRepository.update('missing-id' as EntityId, { name: 'X' }),
      ).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('removes the requested record', async () => {
      const business = await ctx.businessRepository.create({
        name: 'Delete Me',
        currency: 'USD',
      });

      await ctx.businessRepository.remove(business.id);

      const retrieved = await ctx.businessRepository.getById(business.id);
      expect(retrieved).toBeNull();
    });

    it('subsequent getById returns null', async () => {
      const business = await ctx.businessRepository.create({
        name: 'Delete Me',
        currency: 'USD',
      });

      await ctx.businessRepository.remove(business.id);
      const result = await ctx.businessRepository.getById(business.id);
      expect(result).toBeNull();
    });

    it('does not throw for a missing record', async () => {
      await expect(
        ctx.businessRepository.remove('nonexistent' as EntityId),
      ).resolves.toBeUndefined();
    });
  });
});
