'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Generic polling hook for API data.
 * Fetches on mount and then every `interval` ms.
 * Stops polling when component unmounts.
 */
export function useApi(fetcher, interval = 3000) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const result = await fetcher();
      if (mountedRef.current) {
        setData(result);
        setError(null);
        setLoading(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
        setLoading(false);
      }
    }
  }, [fetcher]);

  useEffect(() => {
    mountedRef.current = true;
    refresh();

    if (interval > 0) {
      const id = setInterval(refresh, interval);
      return () => {
        mountedRef.current = false;
        clearInterval(id);
      };
    }

    return () => { mountedRef.current = false; };
  }, [refresh, interval]);

  return { data, error, loading, refresh };
}
