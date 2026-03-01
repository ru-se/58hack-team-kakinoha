import type { BaselineAnswers } from '@/features/diagnosis/types';
import type {
  SubmitGameRequest,
  SubmitGameResponse,
  VoiceRespondRequest,
  VoiceRespondResponse,
} from '@/features/games/types';
import type { ResultResponse } from '@/features/result/types';

// 環境変数が読み込めない場合でも強制的に '/api' を使うようにして undefined を防ぐ
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

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
  // API_BASE に /api が入るため、パスから /api を削除
  const res = await fetch(`${API_BASE}/register`, {
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
  // API_BASE に /api が入るため、パスから /api を削除
  const res = await fetch(`${API_BASE}/games/submit`, {
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
  // API_BASE に /api が入るため、パスから /api を削除
  const res = await fetch(`${API_BASE}/voice/respond`, {
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
  // API_BASE に /api が入るため、パスから /api を削除
  const res = await fetch(`${API_BASE}/results/${userId}`, {
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

export async function getQuizList(
  userId: string
): Promise<{ quizzes: ApiQuiz[] }> {
  // 元々 /api が入っていなかったので、そのまま API_BASE を連結
  const res = await fetch(`${API_BASE}/quizzes?user_id=${userId}`, {
    method: 'GET',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error || 'クイズの取得に失敗しました');
  }

  return res.json();
}

export interface ApiQuestion {
  id: string;
  quiz_id: string;
  order_num: number;
  question_text: string;
  options: string[];
  correct_index: number;
  explanation?: string;
}

export async function getQuizQuestions(
  quizId: string
): Promise<{ questions: ApiQuestion[] }> {
  const res = await fetch(`${API_BASE}/quizzes/${quizId}/questions`, {
    method: 'GET',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error || '問題の取得に失敗しました');
  }

  return res.json();
}

export interface QuizSubmitRequest {
  user_id: string;
  self_evaluation_level: number;
  answers: Record<string, number>;
}

export interface QuizSubmitResponse {
  actual_score: number;
  gap: number;
  feedback_message: string;
  chimera_parameters: {
    lucky: number;
    happy: number;
    nice: number;
    cute: number;
    cool: number;
  };
  rival_parameters: {
    lucky: number;
    happy: number;
    nice: number;
    cute: number;
    cool: number;
  };
  earned_points: number;
  total_exp: Record<string, number>;
}

export async function submitQuizAnswers(
  quizId: string,
  body: QuizSubmitRequest
): Promise<QuizSubmitResponse> {
  const res = await fetch(`${API_BASE}/quizzes/${quizId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error || '解答の送信に失敗しました');
  }

  return res.json();
}
