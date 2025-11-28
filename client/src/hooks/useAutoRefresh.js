import { useEffect, useRef, useCallback } from 'react';

export const useAutoRefresh = (callback, interval = 30000, enabled = true) => {
  const savedCallback = useRef(callback);
  const intervalRef = useRef(null);

  // Update ref when callback changes
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      savedCallback.current();
    }, interval);
  }, [interval]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refresh = useCallback(() => {
    savedCallback.current();
  }, []);

  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }

    return () => stop();
  }, [enabled, start, stop]);

  return { start, stop, refresh };
};

export default useAutoRefresh;
