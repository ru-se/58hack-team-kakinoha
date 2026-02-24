'use client';

import { useCallback, useRef, useState } from 'react';

// Web Speech API は標準の型定義に含まれないため宣言
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export function useSpeechRecognition(options: {
  onResult: (text: string) => void;
  onInterim?: (text: string) => void;
  lang?: string;
}) {
  const { onResult, onInterim, lang = 'ja-JP' } = options;
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const accumulatedRef = useRef('');

  const SpeechRecognitionClass =
    typeof window !== 'undefined'
      ? (window.SpeechRecognition ?? window.webkitSpeechRecognition)
      : undefined;

  const isSupported = !!SpeechRecognitionClass;

  const start = useCallback(() => {
    if (!SpeechRecognitionClass) return;
    if (recognitionRef.current) return;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? '';
        if (result.isFinal) {
          accumulatedRef.current += text;
        } else {
          interim += text;
        }
      }
      if (interim) {
        setInterimText(interim);
        onInterim?.(interim);
      }
    };

    recognition.onend = () => {
      if (!recognitionRef.current) return;
      const final = accumulatedRef.current.trim();
      onResult(final);
      accumulatedRef.current = '';
      setIsListening(false);
      setInterimText('');
      recognitionRef.current = null;
    };

    // onerror の後に必ず onend が発火するため、ここでは onResult を呼ばない。
    // onend 側で一括処理することで二重呼び出しを防ぐ。
    recognition.onerror = () => {};

    accumulatedRef.current = '';
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [SpeechRecognitionClass, lang, onResult, onInterim]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  /** onResult を呼ばずに認識を強制終了する（クリーンアップ用） */
  const abort = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onresult = null;
      recognitionRef.current.abort();
      recognitionRef.current = null;
      accumulatedRef.current = '';
      setIsListening(false);
      setInterimText('');
    }
  }, []);

  return {
    start,
    stop,
    abort,
    isListening,
    interimText,
    isSupported,
  };
}
