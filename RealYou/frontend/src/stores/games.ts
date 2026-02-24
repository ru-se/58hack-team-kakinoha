import { atom } from 'jotai';
import type { Game1Data } from '@/features/games/types';

export const game1DataAtom = atom<Game1Data | null>(null);
