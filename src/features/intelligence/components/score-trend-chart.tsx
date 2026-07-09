'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface ScorePoint {
  label: string;
  value: number;
}

const axisTick = { fontSize: 11, fill: 'var(--muted-foreground)' };
const tooltipStyle = {
  background: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  color: 'var(--popover-foreground)',
  fontSize: '12px',
} as const;

/** Area chart for a 0–100 score trend (health score history). Non-currency Y axis. */
export function ScoreTrendChart({ data }: { data: ScorePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={axisTick} axisLine={false} tickLine={false} width={32} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value)} / 100`, 'Score']} />
        <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} fill="url(#scoreFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
