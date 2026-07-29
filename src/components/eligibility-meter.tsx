'use client';

import { useEffect, useState } from 'react';

interface EligibilityMeterProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showLabel?: boolean;
  animate?: boolean;
}

export default function EligibilityMeter({
  score,
  size = 160,
  strokeWidth = 10,
  label,
  showLabel = true,
  animate = true,
}: EligibilityMeterProps) {
  const [animatedScore, setAnimatedScore] = useState(animate ? 0 : score);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 300);
    return () => clearTimeout(timer);
  }, [score, animate]);

  const getColor = (s: number) => {
    if (s >= 80) return { stroke: '#10b981', glow: 'rgba(16,185,129,0.3)', text: 'text-emerald-400', label: 'Highly Eligible' };
    if (s >= 60) return { stroke: '#f97316', glow: 'rgba(249,115,22,0.3)', text: 'text-saffron-400', label: 'Moderately Eligible' };
    if (s >= 40) return { stroke: '#eab308', glow: 'rgba(234,179,8,0.3)', text: 'text-yellow-400', label: 'Partially Eligible' };
    return { stroke: '#64748b', glow: 'rgba(100,116,139,0.3)', text: 'text-surface-400', label: 'Low Eligibility' };
  };

  const colors = getColor(animatedScore);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-30 transition-opacity duration-1000"
          style={{ background: colors.glow }}
        />

        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />

          {/* Animated progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="meter-ring"
            style={{
              filter: `drop-shadow(0 0 6px ${colors.glow})`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold font-[family-name:var(--font-display)] ${colors.text}`}>
            {Math.round(animatedScore)}
          </span>
          <span className="text-xs text-surface-500 font-medium -mt-0.5">
            out of 100
          </span>
        </div>
      </div>

      {showLabel && (
        <div className="text-center">
          <p className={`text-sm font-semibold ${colors.text}`}>
            {label || colors.label}
          </p>
        </div>
      )}
    </div>
  );
}
