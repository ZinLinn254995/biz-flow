import { useServiceContainer } from '@/hooks/common';
import { useAsync } from '@/hooks/common/useAsync';
import type { Category } from '@/types/domain/category';
import type { CategoryScope } from '@/types/common/enums';
import type { EntityId } from '@/types/common/base';

export function useCategories() {
  const { categoryService } = useServiceContainer();
  return useAsync<Category[]>(() => categoryService.getAllCategories());
}

export function useCategoriesByScope(scope: CategoryScope | null) {
  const { categoryService } = useServiceContainer();
  return useAsync<Category[]>(
    () =>
      scope ? categoryService.getCategoriesByScope(scope) : Promise.resolve([]),
    [scope],
  );
}

export function useCategory(id: EntityId | null) {
  const { categoryService } = useServiceContainer();
  return useAsync<Category | null>(
    () => (id ? categoryService.getCategoryById(id) : Promise.resolve(null)),
    [id],
  );
}
