'use client';

import { motion } from 'framer-motion';

export interface CircularScoreProps {
  score: number;
  /** Progress colour (from the health band). */
  color: string;
  size?: number;
  label?: string;
}

/** Animated circular score gauge (0–100). Purely presentational — the score comes from the backend. */
export function CircularScore({ score, color, size = 200, label }: CircularScoreProps) {
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`Score ${clamped} out of 100`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold tracking-tight text-foreground"
          style={{ color }}
        >
          {Math.round(clamped)}
        </motion.span>
        {label && <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}
