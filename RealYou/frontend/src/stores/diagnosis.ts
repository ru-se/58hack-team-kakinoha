import { atom } from 'jotai';
import type { QuestionKey } from '@/features/diagnosis/types';

export const mbtiAtom = atom<string | null>(null);

export const baselineAnswersAtom = atom<Partial<Record<QuestionKey, string>>>(
  {}
);

export const diagnosisStepAtom = atom<'mbti' | 'quiz'>('mbti');
