'use client';

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import type { Metric } from '../types';

type MetricsBarChartProps = {
  metrics: Metric[];
  userBarColor?: string;
  averageBarColor?: string;
  className?: string;
};

export default function MetricsBarChart({
  metrics,
  userBarColor = '#eab308', // スクショの黄金色
  averageBarColor = '#d1d5db',
  className = '',
}: MetricsBarChartProps) {
  return (
    <div className={`${className} w-full h-full`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={metrics}
          layout="vertical"
          margin={{ top: 10, right: 40, left: 40, bottom: 20 }}
          barGap={2} // バー同士の隙間を詰める
        >
          {/* 縦の点線：グリッド */}
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="#e5e7eb"
          />

          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={120}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#000', fontSize: 13, fontWeight: 900 }}
          />

          <Tooltip
            cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
            contentStyle={{
              borderRadius: '12px',
              border: '4px solid #000',
              fontWeight: '900',
            }}
          />

          {/* あなた：太くて黒枠があるメインバー */}
          <Bar
            dataKey="user"
            name="あなた"
            barSize={24}
            radius={[0, 10, 10, 0]}
            stroke="#000"
            strokeWidth={2.5}
          >
            {metrics.map((_, i) => (
              <Cell key={`user-${i}`} fill={userBarColor} />
            ))}
          </Bar>

          <Bar dataKey="average" name="平均" barSize={12} radius={[0, 6, 6, 0]}>
            {metrics.map((_, i) => (
              <Cell key={`avg-${i}`} fill={averageBarColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
