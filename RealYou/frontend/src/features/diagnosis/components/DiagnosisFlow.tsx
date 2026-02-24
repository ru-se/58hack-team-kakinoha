'use client';

import { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  diagnosisStepAtom,
  mbtiAtom,
  baselineAnswersAtom,
} from '@/stores/diagnosis';
import MbtiSelect from './MbtiSelect';
import BaselineSurvey from './BaselineSurvey';

export default function DiagnosisFlow() {
  const step = useAtomValue(diagnosisStepAtom);
  const setStep = useSetAtom(diagnosisStepAtom);
  const setMbti = useSetAtom(mbtiAtom);
  const setBaselineAnswers = useSetAtom(baselineAnswersAtom);

  // ページ遷移で戻ってきた場合に前回の状態が残らないよう、マウント時にリセットする
  useEffect(() => {
    setStep('mbti');
    setMbti(null);
    setBaselineAnswers({});
  }, [setStep, setMbti, setBaselineAnswers]);

  return step === 'mbti' ? <MbtiSelect /> : <BaselineSurvey />;
}
