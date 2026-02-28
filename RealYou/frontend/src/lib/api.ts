import type { BaselineAnswers } from '@/features/diagnosis/types';
import type {
  SubmitGameRequest,
  SubmitGameResponse,
  VoiceRespondRequest,
  VoiceRespondResponse,
} from '@/features/games/types';
import type { ResultResponse } from '@/features/result/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type RegisterRequest = {
  mbti: string | null;
  baseline_answers: BaselineAnswers;
};

type RegisterResponse = {
  user_id: string;
  status: 'success';
};

export async function postRegister(
  body: RegisterRequest
): Promise<RegisterResponse> {
  const res = await fetch(`${API_BASE}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'データ送信に失敗しました');
  }

  return res.json();
}

export async function submitGame(
  body: SubmitGameRequest
): Promise<SubmitGameResponse> {
  const res = await fetch(`${API_BASE}/api/games/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'ゲームデータの送信に失敗しました');
  }

  return res.json();
}

// Game 2 サポート担当の返答をAIで生成する。返答内容は演出用で、性格判定のスコア計算には使用しない。
export async function postVoiceRespond(
  body: VoiceRespondRequest
): Promise<VoiceRespondResponse> {
  const res = await fetch(`${API_BASE}/api/voice/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'AI返答の生成に失敗しました');
  }

  return res.json();
}

export async function getResult(userId: string): Promise<ResultResponse> {
  const res = await fetch(`${API_BASE}/api/results/${userId}`, {
    method: 'GET',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || '結果の取得に失敗しました');
  }

  return res.json();
}

export interface ApiQuiz {
  quiz_id: string;
  title: string;
  genres: Record<string, number>;
  max_points: number;
  answered: boolean;
  created_at: string;
}

export async function getQuizList(userId: string): Promise<{ quizzes: ApiQuiz[] }> {
  const res = await fetch(`${API_BASE}/api/quizzes?user_id=${userId}`, {
    method: 'GET',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error || 'クイズの取得に失敗しました');
  }

  return res.json();
}
