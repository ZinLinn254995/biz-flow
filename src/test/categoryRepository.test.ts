import { describe, it, expect, afterEach } from 'vitest';
import { createTestContext } from '@/test/helpers';

const ctx = createTestContext();

afterEach(async () => {
  await ctx.db.transaction('rw', ctx.db.categories, async () => {
    await ctx.db.categories.clear();
  });
});

describe('DexieCategoryRepository — getByScope', () => {
  it('returns only categories matching the given scope', async () => {
    await ctx.categoryRepository.create({
      name: 'Business Supplies',
      scope: 'business',
      direction: 'expense',
    });
    await ctx.categoryRepository.create({
      name: 'Business Travel',
      scope: 'business',
      direction: 'expense',
    });
    await ctx.categoryRepository.create({
      name: 'Personal Groceries',
      scope: 'personal',
      direction: 'expense',
    });
    await ctx.categoryRepository.create({
      name: 'Salary',
      scope: 'personal',
      direction: 'income',
    });

    const businessCategories = await ctx.categoryRepository.getByScope('business');
    expect(businessCategories).toHaveLength(2);
    expect(businessCategories.every((c) => c.scope === 'business')).toBe(true);

    const personalCategories = await ctx.categoryRepository.getByScope('personal');
    expect(personalCategories).toHaveLength(2);
    expect(personalCategories.every((c) => c.scope === 'personal')).toBe(true);
  });

  it('returns empty array when no categories match the scope', async () => {
    await ctx.categoryRepository.create({
      name: 'Business Supplies',
      scope: 'business',
    });

    const personal = await ctx.categoryRepository.getByScope('personal');
    expect(personal).toEqual([]);
  });

  it('supports full CRUD operations', async () => {
    const category = await ctx.categoryRepository.create({
      name: 'Test Category',
      scope: 'business',
      direction: 'expense',
    });

    expect(category.id).toBeTruthy();

    const retrieved = await ctx.categoryRepository.getById(category.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.name).toBe('Test Category');

    const updated = await ctx.categoryRepository.update(category.id, {
      name: 'Updated Category',
    });
    expect(updated.name).toBe('Updated Category');

    await ctx.categoryRepository.remove(category.id);
    const after = await ctx.categoryRepository.getById(category.id);
    expect(after).toBeNull();
  });
});
