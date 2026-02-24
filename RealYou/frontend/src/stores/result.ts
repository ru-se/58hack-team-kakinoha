import { atom } from 'jotai';
import type { ResultResponse } from '@/features/result/types';

export const resultAtom = atom<ResultResponse | null>(null);
