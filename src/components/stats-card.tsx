'use client';

import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  color: string;
  delay?: number;
}

export default function StatsCard({ title, value, suffix = '', prefix = '', icon: Icon, trend, color, delay = 0 }: StatsCardProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const timeout = setTimeout(() => {
      const duration = 1500;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isVisible, value, delay]);

  const formatNumber = (num: number) => {
    if (num >= 10000) return (num / 1000).toFixed(1) + 'K';
    if (num >= 1000) return num.toLocaleString();
    return num.toString();
  };

  return (
    <div ref={ref} className="glass-card rounded-2xl p-5 relative overflow-hidden group">
      {/* Background accent */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-500"
        style={{ background: color }}
      />

      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-lg ${
              trend.isPositive
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-red-400 bg-red-500/10'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
          </span>
        )}
      </div>

      <p className="text-surface-400 text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold text-white font-[family-name:var(--font-display)]">
        {prefix}{formatNumber(count)}{suffix}
      </p>
    </div>
  );
}
