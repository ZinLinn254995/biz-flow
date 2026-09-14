import { useServiceContainer } from '@/hooks/common';
import { useAsync } from '@/hooks/common/useAsync';
import type { SavedItem } from '@/types/domain/savedItem';

export function useSavedItems() {
  const { savedItemService } = useServiceContainer();
  return useAsync<SavedItem[]>(() => savedItemService?.getAll() ?? Promise.resolve([]));
}

export function useFavoriteSavedItems() {
  const { quickAddService } = useServiceContainer();
  return useAsync<SavedItem[]>(() => quickAddService?.getFavorites() ?? Promise.resolve([]));
}
