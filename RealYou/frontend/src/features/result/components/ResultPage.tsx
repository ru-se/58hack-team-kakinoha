'use client';

import { useAtomValue } from 'jotai';
import { quizSubmitResultAtom } from '@/store/quizAtoms';
import { resultAtom } from '@/stores/result';
import { useResult } from '../hooks/useResult';
import AnalyzingView from './AnalyzingView';
import ResultReport from './ResultReport';
import QuizResultReport from './QuizResultReport';
import LoadingScreen from '@/components/common/LoadingScreen';

export default function ResultPage() {
  const quizResult = useAtomValue(quizSubmitResultAtom);

  if (quizResult !== null) {
    return <QuizResultReport data={quizResult} />;
  }

  return <FinalResultContainer />;
}

function FinalResultContainer() {
  const { status, errorMessage, retry } = useResult();
  const result = useAtomValue(resultAtom);

  if (status === 'loading') {
    return <LoadingScreen message="分析中..." />;
  }

  if (status === 'error') {
    return (
      <AnalyzingView
        status="error"
        errorMessage={errorMessage}
        onRetry={retry}
      />
    );
  }

  if (result) {
    return <ResultReport data={result} />;
  }

  return <LoadingScreen message="分析中..." />;
}
