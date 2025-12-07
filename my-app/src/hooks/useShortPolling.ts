// hooks/useShortPolling.ts
import { useEffect, useRef, useState, useCallback } from 'react';

interface UseShortPollingOptions<T> {
  fetchFunction: () => Promise<T>;
  interval?: number;
}

export function useShortPolling<T>(options: UseShortPollingOptions<T>) {
  const { fetchFunction, interval = 1000 } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<number | undefined>(undefined); // добавляем initialValue

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchFunction();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    fetchData();
    
    intervalRef.current = window.setInterval(fetchData, interval);

    return () => {
      if (intervalRef.current !== undefined) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, interval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}