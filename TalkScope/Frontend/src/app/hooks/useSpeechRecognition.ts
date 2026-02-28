import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechRecognitionReturn {
  transcript: string;
  setTranscript: (text: string) => void;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const listeningRef = useRef(false);

  // 過去のセッションで「確定」したテキストを保持し続けるためのRef
  const finalTranscriptRef = useRef('');

  // 外部（App.tsxなど）から setTranscript が呼ばれた時にRefも同期する
  const handleSetTranscript = useCallback((text: string) => {
    finalTranscriptRef.current = text;
    setTranscript(text);
  }, []);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('お使いのブラウザは音声認識をサポートしていません。Chromeなどの主要なブラウザをご利用ください。');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ja-JP';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let newlyFinalized = '';

      // 今回新しく認識された部分（resultIndex以降）だけをループする
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text: string = event.results[i][0].transcript;
        const isFinal: boolean = event.results[i].isFinal;

        if (isFinal) {
          newlyFinalized += text + '。\n';
        } else {
          interimTranscript += text;
        }
      }

      // 確定したテキストがあれば、蓄積用Refに追記する
      if (newlyFinalized) {
        finalTranscriptRef.current += newlyFinalized;
      }

      // 画面表示用には「過去の確定分 ＋ 今回の確定分 ＋ 認識途中のテキスト」をセット
      setTranscript(finalTranscriptRef.current + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setError(`音声認識エラー: ${event.error}`);
      setIsListening(false);
      listeningRef.current = false;
    };

    recognition.onend = () => {
      if (listeningRef.current) {
        try { recognition.start(); } catch (e) { }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognitionRef.current?.stop(); } catch (e) { }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !listeningRef.current) {
      setError(null);
      try {
        recognitionRef.current.start();
        listeningRef.current = true;
        setIsListening(true);
      } catch (e) {
        console.error('Failed to start recognition', e);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && listeningRef.current) {
      listeningRef.current = false;
      try { recognitionRef.current.stop(); } catch (e) { }
      setIsListening(false);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    handleSetTranscript('');
  }, [handleSetTranscript]);

  return {
    transcript,
    setTranscript: handleSetTranscript, // ラップした関数を返す
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    error,
  };
};
