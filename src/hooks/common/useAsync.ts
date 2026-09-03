import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export interface AsyncResult<T> extends AsyncState<T> {
  refresh: () => void;
}

/**
 * Generic hook for async data fetching from a service method.
 * Manages loading/data/error state, supports manual refresh,
 * and avoids setting state after unmount.
 */
export function useAsync<T>(
  fetcher: () => Promise<T>,
  deps: ReadonlyArray<unknown> = [],
): AsyncResult<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const [refreshKey, setRefreshKey] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ data: prev.data, isLoading: true, error: null }));

    fetcher()
      .then((data) => {
        if (!cancelled && mountedRef.current) {
          setState({ data, isLoading: false, error: null });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled && mountedRef.current) {
          setState((prev) => ({
            data: prev.data,
            isLoading: false,
            error: err instanceof Error ? err : new Error(String(err)),
          }));
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, ...deps]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return { ...state, refresh };
}
