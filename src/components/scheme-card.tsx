'use client';

import { schemeCategories } from '@/lib/mock-data';
import type { Scheme } from '@/lib/mock-data';
import Link from 'next/link';
import { Bookmark, ArrowRight, Clock, MapPin, Users } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useTranslation } from '@/contexts/translation-context';

interface SchemeCardProps {
  scheme: Scheme;
  eligibilityScore?: number;
  isBookmarked?: boolean;
  onBookmark?: (id: string) => void;
}

export default function SchemeCard({ scheme, eligibilityScore, isBookmarked = false, onBookmark }: SchemeCardProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const { language } = useTranslation();
  const categoryInfo = schemeCategories.find(c => c.id === scheme.category);
  const score = eligibilityScore ?? 0;
  const [now] = useState(() => Date.now());

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (s >= 50) return 'text-saffron-400 bg-saffron-500/10 border-saffron-500/20';
    return 'text-surface-400 bg-surface-500/10 border-surface-500/20';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'High Match';
    if (s >= 50) return 'Partial Match';
    return 'Low Match';
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarked(!bookmarked);
    onBookmark?.(scheme.id);
  };

  const daysLeft = useMemo(() => {
    if (!scheme.deadline) return null;
    return Math.max(0, Math.ceil((new Date(scheme.deadline).getTime() - now) / (1000 * 60 * 60 * 24)));
  }, [scheme.deadline, now]);

  return (
    <Link href={`/schemes/${scheme.id}`}>
      <div className="glass-card rounded-2xl p-5 h-full flex flex-col group relative overflow-hidden">
        {/* Gradient accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
          style={{
            background: `linear-gradient(90deg, ${categoryInfo?.color || '#f97316'}, transparent)`,
          }}
        />

        {/* Top row: Category + Bookmark */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              style={{ background: `${categoryInfo?.color}15` }}
            >
              {categoryInfo?.icon || '📋'}
            </span>
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{
                color: categoryInfo?.color,
                background: `${categoryInfo?.color}12`,
              }}
            >
              {categoryInfo?.label || scheme.category}
            </span>
          </div>
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-lg transition-all ${
              bookmarked
                ? 'text-saffron-400 bg-saffron-500/10'
                : 'text-surface-500 hover:text-saffron-400 hover:bg-white/5'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Scheme Name */}
        <h3 className="text-white font-semibold text-base mb-2 group-hover:text-saffron-300 transition-colors line-clamp-2 font-[family-name:var(--font-display)]">
          {language === 'hi' && scheme.nameHi ? scheme.nameHi : scheme.name}
        </h3>

        {/* Description */}
        <p className="text-surface-400 text-sm leading-relaxed mb-4 line-clamp-2 flex-grow">
          {scheme.description}
        </p>

        {/* Benefits */}
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-3 py-2 mb-4">
          <p className="text-emerald-400 text-xs font-medium line-clamp-1">
            💰 {scheme.benefits}
          </p>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-2 mb-4 text-xs text-surface-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {scheme.targetState || 'All India'}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {scheme.targetGender === 'all' ? 'All' : scheme.targetGender === 'male' ? 'Men' : 'Women'}
          </span>
          {daysLeft !== null && (
            <span className={`flex items-center gap-1 ${daysLeft < 30 ? 'text-red-400' : ''}`}>
              <Clock className="w-3 h-3" />
              {daysLeft} days left
            </span>
          )}
        </div>

        {/* Bottom: Eligibility + Apply */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          {score > 0 ? (
            <div className={`flex items-center gap-2 text-xs font-medium px-2.5 py-1.5 rounded-lg border ${getScoreColor(score)}`}>
              <div className="relative w-5 h-5">
                <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2" />
                  <circle
                    cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeDasharray={`${(score / 100) * 50.2} 50.2`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              {score}% — {getScoreLabel(score)}
            </div>
          ) : (
            <span className="text-xs text-surface-500">Check eligibility</span>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(scheme.applicationUrl, '_blank');
              }}
              className="flex items-center gap-0.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              Apply ↗
            </button>
            <span className="flex items-center gap-1 text-xs text-saffron-400 font-medium group-hover:gap-2 transition-all">
              Details <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
