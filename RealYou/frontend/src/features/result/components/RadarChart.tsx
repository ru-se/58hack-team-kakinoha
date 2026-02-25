'use client';

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { DiagnosisScores } from '../types';

const AXIS_ORDER = [
  { key: 'caution', label: '慎重さ' },
  { key: 'calmness', label: '冷静さ' },
  { key: 'logic', label: '論理性' },
  { key: 'cooperativeness', label: '協調性' },
  { key: 'positivity', label: '積極性' },
] as const;

function toChartData(
  baseline: DiagnosisScores,
  measured: DiagnosisScores
): { subject: string; self: number; measured: number }[] {
  return AXIS_ORDER.map(({ key, label }) => ({
    subject: label,
    self: baseline[key],
    measured: measured[key],
  }));
}

type RadarChartProps = {
  baselineScores: DiagnosisScores;
  measuredScores: DiagnosisScores;
  className?: string;
};

export default function RadarChart({
  baselineScores,
  measuredScores,
  className = '',
}: RadarChartProps) {
  const data = toChartData(baselineScores, measuredScores);

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300} minHeight={220}>
        <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="110%">
          <PolarGrid strokeDasharray="3 3" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
          <Radar
            name="自己申告"
            dataKey="self"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
            strokeDasharray="4 4"
          />
          <Radar
            name="実測値"
            dataKey="measured"
            stroke="#ec4899"
            fill="#ec4899"
            fillOpacity={0.3}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
                  <p className="font-medium text-gray-800">{d.subject}</p>
                  <p className="text-sm text-blue-600">自己申告: {d.self}</p>
                  <p className="text-sm text-pink-500">実測値: {d.measured}</p>
                </div>
              );
            }}
          />
          <Legend />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
