import { useState, useMemo, useCallback } from 'react';

export interface FilterState<T> {
  filtered: T[];
  search: string;
  setSearch: (v: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

export function useSearchFilter<T>(
  data: T[] | undefined,
  searchFn: (item: T, query: string) => boolean,
  extraFilters?: (item: T) => boolean,
): FilterState<T> {
  const [search, setSearch] = useState('');
  const [extraActive, setExtraActive] = useState(false);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.filter((item) => {
      if (q && !searchFn(item, q)) return false;
      if (extraFilters && !extraFilters(item)) return false;
      return true;
    });
  }, [data, search, searchFn, extraFilters]);

  const clearFilters = useCallback(() => {
    setSearch('');
    setExtraActive(false);
  }, []);

  const hasActiveFilters = search.trim() !== '' || extraActive;

  return { filtered, search, setSearch, clearFilters, hasActiveFilters };
}

export function useDateRangeFilter<T>(
  data: T[] | undefined,
  getDate: (item: T) => string,
): {
  startDate: string;
  endDate: string;
  setStartDate: (v: string) => void;
  setEndDate: (v: string) => void;
  filtered: T[];
  clearDateRange: () => void;
  hasDateRange: boolean;
} {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!startDate && !endDate) return data;
    return data.filter((item) => {
      const itemDate = getDate(item);
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      return true;
    });
  }, [data, startDate, endDate, getDate]);

  const clearDateRange = useCallback(() => {
    setStartDate('');
    setEndDate('');
  }, []);

  const hasDateRange = startDate !== '' || endDate !== '';

  return { startDate, endDate, setStartDate, setEndDate, filtered, clearDateRange, hasDateRange };
}

export function useSort<T>(
  data: T[] | undefined,
  defaultKey: string | null,
  compareFn: (a: T, b: T, key: string, direction: 'asc' | 'desc') => number,
): {
  sortKey: string | null;
  sortDirection: 'asc' | 'desc';
  setSortKey: (key: string | null) => void;
  toggleSortDirection: () => void;
  sorted: T[];
} {
  const [sortKey, setSortKey] = useState<string | null>(defaultKey);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sorted = useMemo(() => {
    if (!data || !sortKey) return data ?? [];
    const copy = [...data];
    copy.sort((a, b) => compareFn(a, b, sortKey, sortDirection));
    return copy;
  }, [data, sortKey, sortDirection, compareFn]);

  const toggleSortDirection = useCallback(() => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  return { sortKey, sortDirection, setSortKey, toggleSortDirection, sorted };
}
