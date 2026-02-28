import { atom } from 'jotai';
import type { QuizSubmitResponse } from '@/lib/api';

export const selectedQuizIdAtom = atom<string | null>(null);
export const quizSubmitResultAtom = atom<QuizSubmitResponse | null>(null);
