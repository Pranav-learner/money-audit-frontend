'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCompactCurrency, formatCurrency } from '@/shared/utils/format';
import { getCategoryColor } from '@/shared/utils/category-color';

export interface XYPoint {
  label: string;
  value: number;
}
export interface NamedValue {
  name: string;
  value: number;
}

const axisTick = { fontSize: 11, fill: 'var(--muted-foreground)' };
const gridColor = 'color-mix(in oklch, var(--muted-foreground) 18%, transparent)';

const tooltipStyle = {
  background: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  color: 'var(--popover-foreground)',
  fontSize: '12px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
} as const;

/** Vertical bar chart of monetary values (weekly/monthly spending). */
export function MoneyBarChart({ data, color = 'var(--primary)' }: { data: XYPoint[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barSize={26}>
        <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
        <YAxis tick={axisTick} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => formatCompactCurrency(Number(v))} />
        <Tooltip
          cursor={{ fill: gridColor }}
          contentStyle={tooltipStyle}
          formatter={(value) => [formatCurrency(Number(value)), 'Amount']}
        />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Smooth area chart of a monetary trend (savings / monthly trend). */
export function MoneyAreaChart({ data, color = 'var(--primary)' }: { data: XYPoint[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="moneyAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
        <YAxis tick={axisTick} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => formatCompactCurrency(Number(v))} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill="url(#moneyAreaFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Donut chart of category distribution, coloured by stable category colours. */
export function CategoryPieChart({ data }: { data: NamedValue[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2} stroke="none">
          {data.map((entry) => (
            <Cell key={entry.name} fill={getCategoryColor(entry.name)} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [formatCurrency(Number(value)), String(name)]} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          wrapperStyle={{ fontSize: '12px', color: 'var(--muted-foreground)' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
