'use client';

import { useCallback, useRef } from 'react';

function variance(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sumSq = values.reduce((acc, x) => acc + (x - mean) ** 2, 0);
  return sumSq / (values.length - 1);
}

export function useTypingMetrics() {
  const timestampsRef = useRef<number[]>([]);

  const onKeyDown = useCallback(() => {
    timestampsRef.current.push(performance.now());
  }, []);

  const getVarianceAndReset = useCallback((): number => {
    const ts = timestampsRef.current;
    const intervals: number[] = [];
    for (let i = 1; i < ts.length; i++) {
      intervals.push(ts[i] - ts[i - 1]);
    }
    timestampsRef.current = [];
    return variance(intervals);
  }, []);

  const reset = useCallback(() => {
    timestampsRef.current = [];
  }, []);

  return {
    onKeyDown,
    getVarianceAndReset,
    reset,
  };
}
