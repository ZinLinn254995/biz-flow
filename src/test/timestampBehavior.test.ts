import { describe, it, expect, afterEach } from 'vitest';
import { createTestContext } from '@/test/helpers';

const ctx = createTestContext();

afterEach(async () => {
  await ctx.db.transaction('rw', ctx.db.businesses, async () => {
    await ctx.db.businesses.clear();
  });
});

describe('Timestamp behavior', () => {
  it('create generates both createdAt and updatedAt', async () => {
    const business = await ctx.businessRepository.create({
      name: 'Timestamp Test',
      currency: 'USD',
    });

    expect(business.createdAt).toBeTruthy();
    expect(business.updatedAt).toBeTruthy();
    expect(typeof business.createdAt).toBe('string');
    expect(typeof business.updatedAt).toBe('string');
  });

  it('createdAt and updatedAt are initially equal', async () => {
    const business = await ctx.businessRepository.create({
      name: 'Timestamp Test',
      currency: 'USD',
    });

    expect(business.createdAt).toBe(business.updatedAt);
  });

  it('createdAt remains unchanged after update', async () => {
    const business = await ctx.businessRepository.create({
      name: 'Original',
      currency: 'USD',
    });

    const updated = await ctx.businessRepository.update(business.id, {
      name: 'Updated',
    });

    expect(updated.createdAt).toBe(business.createdAt);
  });

  it('updatedAt changes after update', async () => {
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

  it('timestamps are valid ISO-8601 strings', async () => {
    const business = await ctx.businessRepository.create({
      name: 'ISO Test',
      currency: 'USD',
    });

    const createdAtDate = new Date(business.createdAt);
    const updatedAtDate = new Date(business.updatedAt);

    expect(createdAtDate.getTime()).not.toBeNaN();
    expect(updatedAtDate.getTime()).not.toBeNaN();
  });
});
