// utils/externalApi.ts

export interface ExternalApiPayload {
  user_id: string;
  presentation_text: string;
}

export function getExternalApiUrl(): string {
  // .env ファイルで VITE_EXTERNAL_API_URL を設定してください
  const url = import.meta.env.VITE_EXTERNAL_API_URL || "https://five8hack-team-kakinoha.onrender.com/api/quizzes/generate";
  return typeof url === "string" ? url.trim() : "";
}

/**
 * 会話全文を外部のバックエンドAPIに送信する
 */
export async function sendFullTranscript(
  payload: ExternalApiPayload,
): Promise<unknown> {
  const url = getExternalApiUrl();

  if (!url) {
    throw new Error(
      "External API URLが設定されていません(.envを確認してください)。",
    );
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: payload.user_id, // バックエンドのキー名に合わせて適宜変更してください
      presentation_text: payload.presentation_text,
    }),
  });

  if (!res.ok) {
    throw new Error(`External API error: ${res.status} ${await res.text()}`);
  }

  return res.json();
}
