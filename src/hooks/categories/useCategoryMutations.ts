import { useServiceContainer } from '@/hooks/common';
import { useMutation } from '@/hooks/common/useMutation';
import type { Category } from '@/types/domain/category';
import type { CategoryScope } from '@/types/common/enums';
import type { EntityId } from '@/types/common/base';

export function useCreateCategory() {
  const { categoryService } = useServiceContainer();
  return useMutation<
    [input: {
      name: string;
      scope: CategoryScope;
      direction?: Category['direction'];
      parentId?: string;
      color?: string;
    }],
    Category
  >((input) => categoryService.createCategory(input));
}

export function useUpdateCategory() {
  const { categoryService } = useServiceContainer();
  return useMutation<[id: EntityId, changes: Partial<Category>], Category>(
    (id, changes) => categoryService.updateCategory(id, changes),
  );
}

export function useDeleteCategory() {
  const { categoryService } = useServiceContainer();
  return useMutation<[id: EntityId], void>(
    (id) => categoryService.deleteCategory(id),
  );
}
