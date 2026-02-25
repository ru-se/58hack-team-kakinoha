'use client';

import { useCallback, useRef } from 'react';

/**
 * useAudioMetrics の計測結果
 *
 * 音声入力1ターン分のメトリクスを返す。
 * - reactionTimeMs : 録音開始 → 最初に声が検出されるまでの時間
 * - speechDurationMs : 声が出ていた区間の合計時間
 * - silenceDurationMs : 声が途切れていた区間の合計時間
 * - volumeDb : 録音全体の平均音量（dB 換算）
 */
export interface AudioMetricsResult {
  reactionTimeMs: number;
  speechDurationMs: number;
  silenceDurationMs: number;
  volumeDb: number;
}

// RMS がこの値以上なら「発話中」、未満なら「沈黙」と判定する
const VOLUME_THRESHOLD = 0.01;
// dB 換算の基準値（0 dBFS = 1.0）
const REF_DB = 1;

/** RMS 値をデシベルに変換する */
function toDb(value: number): number {
  if (value <= 0) return -100;
  return 20 * Math.log10(value / REF_DB);
}

/**
 * Web Audio API を使って音声入力のメトリクスをリアルタイム計測するフック。
 *
 * 使い方:
 *   1. startRecording() でマイク取得 & 計測開始
 *   2. 内部の requestAnimationFrame ループで毎フレーム音量を監視
 *   3. stopRecording() で計測停止 & AudioMetricsResult を返却
 */
export function useAudioMetrics() {
  // --- Web Audio API のリソース ---
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // --- ループ制御 ---
  const animationIdRef = useRef<number>(0);

  // --- 計測用タイムスタンプ ---
  const startTimeRef = useRef<number>(0); // 録音開始時刻
  const firstSpeechTimeRef = useRef<number | null>(null); // 最初に声を検出した時刻
  const segmentStartRef = useRef<number>(0); // 現在の「発話 or 沈黙」区間の開始時刻

  // --- 計測結果の蓄積 ---
  const speechDurationsRef = useRef<number[]>([]); // 発話区間ごとの長さ（ms）
  const silenceDurationsRef = useRef<number[]>([]); // 沈黙区間ごとの長さ（ms）
  const volumeSumRef = useRef(0); // RMS 値の累計（平均算出用）
  const volumeCountRef = useRef(0); // RMS サンプル数

  // --- 発話/沈黙の現在状態 ---
  const isSpeechRef = useRef(false);

  // --- AnalyserNode から波形を受け取るバッファ ---
  const dataArrayRef = useRef<Uint8Array | null>(null);

  /**
   * マイクを取得し、AudioContext → AnalyserNode を接続して計測を開始する。
   * @returns マイク取得に成功したら true、失敗（権限拒否等）なら false
   */
  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      // マイク入力のストリームを取得
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // AudioContext を作成し、マイク → AnalyserNode を接続
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);
      analyserRef.current = analyser;

      // 波形データを受け取るバッファを用意
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;

      // 計測状態をリセット
      startTimeRef.current = performance.now();
      firstSpeechTimeRef.current = null;
      speechDurationsRef.current = [];
      silenceDurationsRef.current = [];
      volumeSumRef.current = 0;
      volumeCountRef.current = 0;
      isSpeechRef.current = false;
      segmentStartRef.current = startTimeRef.current;

      /**
       * 毎フレーム実行される計測ループ。
       * 波形データから RMS（実効値）を算出し、閾値と比較して
       * 「発話中」か「沈黙中」かを判定。区間が切り替わるたびに
       * その区間の長さを記録する。
       */
      const tick = () => {
        const analyser = analyserRef.current;
        const dataArray = dataArrayRef.current;
        if (!analyser || !dataArray) return;

        // 時間領域の波形データを取得（各サンプルは 0〜255、128 が無音）
        analyser.getByteTimeDomainData(dataArray as Uint8Array<ArrayBuffer>);

        // RMS（Root Mean Square）を算出して音量を数値化
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const n = (dataArray[i] - 128) / 128; // -1.0 〜 1.0 に正規化
          sum += n * n;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const now = performance.now();
        const elapsed = now - segmentStartRef.current;

        // 平均音量の算出用に RMS を累積
        volumeSumRef.current += rms;
        volumeCountRef.current += 1;

        if (rms >= VOLUME_THRESHOLD) {
          // --- 発話を検出 ---
          if (firstSpeechTimeRef.current === null) {
            // 最初の発話 → reactionTimeMs の算出に使う
            firstSpeechTimeRef.current = now;
          }
          if (!isSpeechRef.current) {
            // 沈黙→発話に切り替わった: 直前の沈黙区間の長さを記録
            isSpeechRef.current = true;
            silenceDurationsRef.current.push(elapsed);
            segmentStartRef.current = now;
          }
        } else {
          // --- 沈黙を検出 ---
          if (isSpeechRef.current) {
            // 発話→沈黙に切り替わった: 直前の発話区間の長さを記録
            isSpeechRef.current = false;
            speechDurationsRef.current.push(elapsed);
            segmentStartRef.current = now;
          }
        }

        animationIdRef.current = requestAnimationFrame(tick);
      };

      // 計測ループを開始
      animationIdRef.current = requestAnimationFrame(tick);
      return true;
    } catch {
      return false;
    }
  }, []);

  /**
   * 計測を停止し、蓄積したデータから AudioMetricsResult を組み立てて返す。
   * マイクストリーム・AudioContext のリソースも解放する。
   */
  const stopRecording = useCallback((): AudioMetricsResult | null => {
    // 計測ループを停止
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = 0;
    }

    // 最後の区間（stop 時点でまだ記録されていない）を確定
    const now = performance.now();
    const segmentElapsed = now - segmentStartRef.current;
    if (isSpeechRef.current) {
      speechDurationsRef.current.push(segmentElapsed);
    } else {
      silenceDurationsRef.current.push(segmentElapsed);
    }

    // 各メトリクスを算出
    const reactionTimeMs =
      firstSpeechTimeRef.current !== null
        ? firstSpeechTimeRef.current - startTimeRef.current
        : 0;
    const speechDurationMs = speechDurationsRef.current.reduce(
      (a, b) => a + b,
      0
    );
    const silenceDurationMs = silenceDurationsRef.current.reduce(
      (a, b) => a + b,
      0
    );
    const avgRms =
      volumeCountRef.current > 0
        ? volumeSumRef.current / volumeCountRef.current
        : 0;
    const volumeDb = toDb(avgRms);

    // リソース解放: マイクストリーム停止
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    // リソース解放: AudioContext を閉じる
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    dataArrayRef.current = null;

    return {
      reactionTimeMs: Math.round(reactionTimeMs),
      speechDurationMs: Math.round(speechDurationMs),
      silenceDurationMs: Math.round(silenceDurationMs),
      volumeDb: Math.round(volumeDb * 10) / 10,
    };
  }, []);

  return { startRecording, stopRecording };
}
