'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';
import type { ResultResponse } from '@/features/result/types';
import { resultAtom } from '@/stores/result';
import { getResult } from '@/lib/api';

const MIN_LOADING_MS = 2000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchResult(): Promise<ResultResponse> {
  const userId =
    typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
  if (!userId) throw new Error('ユーザーが見つかりません');
  return await getResult(userId);
}

export type ResultStatus = 'loading' | 'error' | 'success';

export function useResult() {
  const [status, setStatus] = useState<ResultStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const setResult = useSetAtom(resultAtom);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    Promise.all([fetchResult(), sleep(MIN_LOADING_MS)])
      .then(([data]) => {
        if (ignore) return;
        setResult(data);
        setStatus('success');
      })
      .catch((err: unknown) => {
        if (ignore) return;
        setErrorMessage(
          err instanceof Error ? err.message : '結果の取得に失敗しました'
        );
        setStatus('error');
      });

    return () => {
      ignore = true;
    };
  }, [setResult, fetchKey]);

  const retry = useCallback(() => {
    setStatus('loading');
    setErrorMessage('');
    setFetchKey((k) => k + 1);
  }, []);

  return { status, errorMessage, retry };
}
