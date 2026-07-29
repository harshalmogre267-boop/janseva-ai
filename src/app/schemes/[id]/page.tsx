'use client';

import { use } from 'react';
import { useState } from 'react';
import Navbar from '@/components/navbar';
import Chatbot from '@/components/chatbot';
import EligibilityMeter from '@/components/eligibility-meter';
import Footer from '@/components/footer';
import { mockSchemes, calculateEligibilityScore, schemeCategories } from '@/lib/mock-data';
import { useAuth } from '@/contexts/auth-context';
import {
  ArrowLeft, Bookmark, Share2, ExternalLink, FileText, CheckCircle2,
  XCircle, Calendar, MapPin, Users, IndianRupee, GraduationCap, Clock,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export default function SchemeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [now] = useState(() => Date.now());
  const scheme = mockSchemes.find((s) => s.id === id);
  const [bookmarked, setBookmarked] = useState(false);

  // Use a blank profile as fallback so criteria show as unchecked
  const activeUser = user || {
    id: '', phone: '', name: '', email: '', dateOfBirth: '2000-01-01',
    gender: 'male' as const, category: 'general' as const, state: '',
    district: '', annualIncome: 0, occupation: '', educationLevel: 'none' as const,
    isDisabled: false, isMinority: false, isBpl: false, isFarmer: false,
    isStudent: false, preferredLanguage: 'en',
  };

  if (!scheme) {
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🔍</p>
          <h1 className="text-2xl font-bold text-white mb-2">Scheme Not Found</h1>
          <Link href="/schemes" className="text-saffron-400 hover:text-saffron-300">← Back to Schemes</Link>
        </div>
      </div>
    );
  }

  const eligibilityScore = user ? calculateEligibilityScore(scheme, activeUser) : 0;
  const categoryInfo = schemeCategories.find((c) => c.id === scheme.category);
  const daysLeft = scheme.deadline
    ? Math.max(0, Math.ceil((new Date(scheme.deadline).getTime() - now) / (1000 * 60 * 60 * 24)))
    : null;

  // Eligibility breakdown
  const criteria = [
    {
      label: 'Age Requirement',
      met: scheme.minAge === null && scheme.maxAge === null ? true :
        (() => {
          const age = new Date().getFullYear() - new Date(activeUser.dateOfBirth).getFullYear();
          return (scheme.minAge === null || age >= scheme.minAge) && (scheme.maxAge === null || age <= scheme.maxAge);
        })(),
      detail: scheme.minAge || scheme.maxAge ? `${scheme.minAge || 'Any'} - ${scheme.maxAge || 'Any'} years` : 'No age restriction',
      icon: Users,
    },
    {
      label: 'Income Criteria',
      met: scheme.maxIncome === null || activeUser.annualIncome <= scheme.maxIncome,
      detail: scheme.maxIncome ? `Max ₹${(scheme.maxIncome / 100000).toFixed(1)} Lakh/year` : 'No income limit',
      icon: IndianRupee,
    },
    {
      label: 'Category',
      met: scheme.targetCategories.length === 0 || scheme.targetCategories.includes(activeUser.category),
      detail: scheme.targetCategories.length > 0 ? scheme.targetCategories.map((c) => c.toUpperCase()).join(', ') : 'Open to all categories',
      icon: Users,
    },
    {
      label: 'Education',
      met: scheme.targetEducation.length === 0 || scheme.targetEducation.includes(activeUser.educationLevel),
      detail: scheme.targetEducation.length > 0 ? scheme.targetEducation.map((e) => e.charAt(0).toUpperCase() + e.slice(1)).join(', ') : 'Open to all education levels',
      icon: GraduationCap,
    },
    {
      label: 'Gender',
      met: scheme.targetGender === 'all' || scheme.targetGender === activeUser.gender,
      detail: scheme.targetGender === 'all' ? 'All genders' : scheme.targetGender,
      icon: Users,
    },
  ];

  if (scheme.requiresBpl) {
    criteria.push({ label: 'BPL Status', met: activeUser.isBpl, detail: 'BPL certificate required', icon: FileText });
  }
  if (scheme.requiresFarmer) {
    criteria.push({ label: 'Farmer Status', met: activeUser.isFarmer, detail: 'Must be a farmer', icon: FileText });
  }
  if (scheme.requiresStudent) {
    criteria.push({ label: 'Student Status', met: activeUser.isStudent, detail: 'Must be a student', icon: GraduationCap });
  }

  return (
    <div className="min-h-screen mesh-gradient">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        {/* Back Button */}
        <Link href="/schemes" className="inline-flex items-center gap-1.5 text-sm text-surface-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Schemes
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: `linear-gradient(90deg, ${categoryInfo?.color}, transparent)` }}
              />

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: `${categoryInfo?.color}15` }}
                  >
                    {categoryInfo?.icon}
                  </span>
                  <span
                    className="text-xs font-medium px-3 py-1 rounded-full"
                    style={{ color: categoryInfo?.color, background: `${categoryInfo?.color}12` }}
                  >
                    {categoryInfo?.label}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-navy-500/20 text-navy-300 capitalize">
                    {scheme.schemeType} scheme
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBookmarked(!bookmarked)}
                    className={`p-2.5 rounded-xl transition-all ${
                      bookmarked ? 'bg-saffron-500/15 text-saffron-400' : 'bg-white/5 text-surface-400 hover:text-white'
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-2.5 rounded-xl bg-white/5 text-surface-400 hover:text-white transition-all">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white font-[family-name:var(--font-display)] mb-2">
                {scheme.name}
              </h1>
              <p className="text-sm text-surface-400 mb-4">{scheme.ministry}</p>
              <p className="text-surface-300 leading-relaxed">{scheme.description}</p>

              {/* Benefits */}
              <div className="mt-5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-emerald-400 mb-1">💰 Benefits</h3>
                <p className="text-sm text-emerald-300">{scheme.benefits}</p>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-3 mt-5">
                <span className="flex items-center gap-1.5 text-xs text-surface-400 bg-white/5 px-3 py-1.5 rounded-lg">
                  <MapPin className="w-3.5 h-3.5" /> {scheme.targetState || 'All India'}
                </span>
                {daysLeft !== null && (
                  <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg ${
                    daysLeft < 30 ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-surface-400'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    {daysLeft} days left to apply
                  </span>
                )}
                {scheme.deadline && (
                  <span className="flex items-center gap-1.5 text-xs text-surface-400 bg-white/5 px-3 py-1.5 rounded-lg">
                    <Calendar className="w-3.5 h-3.5" />
                    Deadline: {new Date(scheme.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>

            {/* Eligibility Breakdown */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white font-[family-name:var(--font-display)] mb-4">
                📋 Eligibility Criteria Check
              </h2>
              <div className="space-y-3">
                {criteria.map((c, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${
                    c.met ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-red-500/5 border border-red-500/10'
                  }`}>
                    {c.met ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${c.met ? 'text-emerald-300' : 'text-red-300'}`}>{c.label}</p>
                      <p className="text-xs text-surface-400">{c.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents Required */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white font-[family-name:var(--font-display)] mb-4">
                📄 Required Documents
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {scheme.documentsRequired.map((doc, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 bg-white/5 rounded-lg">
                    <FileText className="w-4 h-4 text-saffron-400 shrink-0" />
                    <span className="text-sm text-surface-300">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Eligibility Score */}
            <div className="glass-card rounded-2xl p-6 text-center">
              <h3 className="text-sm font-semibold text-white mb-4">Your Eligibility Score</h3>
              <EligibilityMeter score={eligibilityScore} />
              <p className="text-xs text-surface-400 mt-3">
                {criteria.filter((c) => c.met).length} of {criteria.length} criteria matched
              </p>
            </div>

            {/* Apply CTA */}
            <div className="glass-card rounded-2xl p-6">
              <a
                href={scheme.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-saffron-500 to-saffron-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-saffron-500/25 transition-all"
              >
                Apply Now <ExternalLink className="w-4 h-4" />
              </a>
              {daysLeft !== null && daysLeft < 30 && (
                <div className="flex items-center gap-2 mt-3 p-2.5 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-xs text-red-300">Deadline approaching! Only {daysLeft} days left.</p>
                </div>
              )}
            </div>

            {/* Helpline */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-2">Need Help?</h3>
              <p className="text-xs text-surface-400 mb-3">Contact the scheme helpline or use our AI chatbot for instant guidance.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-surface-300">
                  <span>📞</span> Helpline: 1800-XXX-XXXX
                </div>
                <div className="flex items-center gap-2 text-xs text-surface-300">
                  <span>🌐</span> {scheme.applicationUrl}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <Chatbot />
    </div>
  );
}

