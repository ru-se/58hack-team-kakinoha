import DiagnosisFlow from '@/features/diagnosis/components/DiagnosisFlow';

const diagnosisBackgroundStyle = {
  backgroundColor: '#f0f380',
  backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2px)',
  backgroundSize: '20px 20px',
};

export default function DiagnosisPage() {
  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center p-4"
      style={diagnosisBackgroundStyle}
    >
      <div className="flex w-full max-w-5xl flex-1 flex-col items-center justify-center">
        <DiagnosisFlow />
      </div>
    </div>
  );
}
