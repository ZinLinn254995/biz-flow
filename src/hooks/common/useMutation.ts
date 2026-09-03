import { useCallback, useRef, useState } from 'react';

export interface MutationState<TArgs extends unknown[], TResult> {
  mutate: (...args: TArgs) => Promise<TResult>;
  isLoading: boolean;
  error: Error | null;
  data: TResult | null;
  reset: () => void;
}

/**
 * Generic hook for wrapping a service mutation (create/update/delete).
 * Exposes loading/error/data state and a `mutate` function that
 * components call explicitly — never automatically on mount.
 */
export function useMutation<TArgs extends unknown[], TResult>(
  mutationFn: (...args: TArgs) => Promise<TResult>,
): MutationState<TArgs, TResult> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TResult | null>(null);
  const mountedRef = useRef(true);

  const mutate = useCallback(
    async (...args: TArgs): Promise<TResult> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await mutationFn(...args);
        if (mountedRef.current) {
          setData(result);
          setIsLoading(false);
        }
        return result;
      } catch (err: unknown) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
        throw err;
      }
    },
    [mutationFn],
  );

  const reset = useCallback(() => {
    setError(null);
    setData(null);
    setIsLoading(false);
  }, []);

  return { mutate, isLoading, error, data, reset };
}
