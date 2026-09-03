import type { CategoryRepository } from '@/types/repositories/categoryRepository';
import type { Category } from '@/types/domain/category';
import type { CategoryScope } from '@/types/common/enums';
import type { EntityId } from '@/types/common/base';
import { requireNonEmptyString, trimToNull } from '@/services/common';

export class CategoryService {
  constructor(private readonly repository: CategoryRepository) {}

  async getCategoryById(id: EntityId): Promise<Category | null> {
    return this.repository.getById(id);
  }

  async getAllCategories(): Promise<Category[]> {
    return this.repository.getAll();
  }

  async getCategoriesByScope(scope: CategoryScope): Promise<Category[]> {
    return this.repository.getByScope(scope);
  }

  async createCategory(input: {
    name: string;
    scope: CategoryScope;
    direction?: Category['direction'];
    parentId?: string;
    color?: string;
  }): Promise<Category> {
    const name = requireNonEmptyString(input.name, 'name');
    const color = trimToNull(input.color) ?? undefined;
    const parentId = trimToNull(input.parentId) ?? undefined;

    return this.repository.create({ ...input, name, color, parentId });
  }

  async updateCategory(id: EntityId, changes: Partial<Category>): Promise<Category> {
    if (changes.name !== undefined) {
      requireNonEmptyString(changes.name, 'name');
    }
    if (changes.color !== undefined) {
      changes.color = trimToNull(changes.color) ?? undefined;
    }
    return this.repository.update(id, changes);
  }

  async deleteCategory(id: EntityId): Promise<void> {
    return this.repository.remove(id);
  }
}
