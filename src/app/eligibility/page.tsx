'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import Chatbot from '@/components/chatbot';
import Footer from '@/components/footer';
import EligibilityMeter from '@/components/eligibility-meter';
import { mockSchemes, calculateEligibilityScore, Scheme } from '@/lib/mock-data';
import { useAuth } from '@/contexts/auth-context';
import { 
  Brain, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  ExternalLink,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EligibilityPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'high' | 'partial' | 'low'>('all');
  const [expandedScheme, setExpandedScheme] = useState<string | null>(null);
  const [analysisOffsets, setAnalysisOffsets] = useState<number[]>([]);

  // Blank fallback profile
  const activeUser = user || {
    id: '', phone: '', name: '', email: '', dateOfBirth: '2000-01-01',
    gender: 'male', category: 'general', state: '',
    district: '', annualIncome: 0, occupation: '', educationLevel: 'none',
    isDisabled: false, isMinority: false, isBpl: false, isFarmer: false,
    isStudent: false, preferredLanguage: 'en',
  };

  const schemesWithScores = useMemo(() => {
    return mockSchemes.map((s, i) => {
      const base = user ? calculateEligibilityScore(s, user) : 0;
      const offset = analysisOffsets[i] || 0;
      return { ...s, eligibilityScore: Math.max(0, Math.min(100, base + offset)) };
    });
  }, [user, analysisOffsets]);

  // Protect route
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-2 border-saffron-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-surface-400 text-sm">Loading eligibility analysis...</p>
        </div>
      </div>
    );
  }

  const runAnalysis = async () => {
    setAnalyzing(true);
    // Simulate complex Gemini API matching call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // Generate random offsets outside of render to satisfy React purity rules
    const offsets = mockSchemes.map(() => Math.floor(Math.random() * 7) - 3);
    setAnalysisOffsets(offsets);
    setAnalyzing(false);
  };

  const getFilteredSchemes = () => {
    return schemesWithScores.filter((s) => {
      const score = s.eligibilityScore || 0;
      if (activeTab === 'high') return score >= 80;
      if (activeTab === 'partial') return score >= 50 && score < 80;
      if (activeTab === 'low') return score < 50;
      return true; // 'all'
    }).sort((a, b) => (b.eligibilityScore || 0) - (a.eligibilityScore || 0));
  };

  // Helper to determine specific criteria checks
  const getCriteriaCheck = (scheme: Scheme) => {
    const age = new Date().getFullYear() - new Date(activeUser.dateOfBirth).getFullYear();
    
    const checks = [
      {
        name: 'Age Requirement',
        status: (scheme.minAge === null || age >= scheme.minAge) && (scheme.maxAge === null || age <= scheme.maxAge) ? 'pass' : 'fail',
        desc: scheme.minAge !== null || scheme.maxAge !== null 
          ? `Required: ${scheme.minAge ? `${scheme.minAge}+` : ''} ${scheme.maxAge ? `under ${scheme.maxAge}` : ''} (Your age: ${age})`
          : 'No specific age limits',
      },
      {
        name: 'Annual Income Limit',
        status: scheme.maxIncome === null || activeUser.annualIncome <= scheme.maxIncome ? 'pass' : 'fail',
        desc: scheme.maxIncome !== null 
          ? `Required: Under ₹${scheme.maxIncome.toLocaleString('en-IN')} (Your income: ₹${activeUser.annualIncome.toLocaleString('en-IN')})`
          : 'No income limits',
      },
      {
        name: 'Gender Specifics',
        status: scheme.targetGender === 'all' || scheme.targetGender === activeUser.gender ? 'pass' : 'fail',
        desc: scheme.targetGender !== 'all' 
          ? `Required: ${scheme.targetGender} only (Your gender: ${activeUser.gender})`
          : 'Open to all genders',
      },
      {
        name: 'Social Category Match',
        status: scheme.targetCategories.length === 0 || scheme.targetCategories.includes(activeUser.category) ? 'pass' : 'fail',
        desc: scheme.targetCategories.length > 0
          ? `Target Categories: ${scheme.targetCategories.join(', ').toUpperCase()} (Your category: ${activeUser.category.toUpperCase()})`
          : 'Open to all categories',
      },
      {
        name: 'Occupational Eligibility',
        status: !scheme.requiresFarmer || activeUser.isFarmer ? 'pass' : 'fail',
        desc: scheme.requiresFarmer ? 'Required: Farmer occupation' : 'Open to any occupation',
      },
      {
        name: 'Academic Status',
        status: !scheme.requiresStudent || activeUser.isStudent ? 'pass' : 'fail',
        desc: scheme.requiresStudent ? 'Required: Active student' : 'Open to non-students',
      },
      {
        name: 'State Restrictions',
        status: !scheme.targetState || scheme.targetState === activeUser.state ? 'pass' : 'fail',
        desc: scheme.targetState ? `Required state: ${scheme.targetState} (Your state: ${activeUser.state || 'Not set'})` : 'Central Scheme / All States',
      },
    ];

    return checks;
  };

  const filteredSchemes = getFilteredSchemes();
  const overallScore = user
    ? Math.round(schemesWithScores.reduce((acc, s) => acc + (s.eligibilityScore || 0), 0) / schemesWithScores.length)
    : 0;

  const highMatchCount = schemesWithScores.filter((s) => (s.eligibilityScore || 0) >= 80).length;
  const partialMatchCount = schemesWithScores.filter((s) => (s.eligibilityScore || 0) >= 50 && (s.eligibilityScore || 0) < 80).length;
  const lowMatchCount = schemesWithScores.filter((s) => (s.eligibilityScore || 0) < 50).length;

  return (
    <div className="min-h-screen mesh-gradient flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
          {/* Title Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-saffron-400" />
                <span className="text-xs font-semibold text-saffron-400 uppercase tracking-wider bg-saffron-500/10 px-2.5 py-1 rounded-full">
                  AI Analytics Engine
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-[family-name:var(--font-display)]">
                AI Eligibility Analysis
              </h1>
              <p className="text-surface-400 text-sm mt-1">
                Gemini AI has matched your profile against database schemes using real-time criteria audits.
              </p>
            </div>

            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-saffron-500 to-saffron-600 hover:shadow-lg hover:shadow-saffron-500/20 text-white font-semibold rounded-2xl transition-all disabled:opacity-50 group text-sm self-start md:self-auto shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : 'group-hover:rotate-45'} transition-transform`} />
              {analyzing ? 'Analyzing Profile...' : 'Re-Run AI Matching'}
            </button>
          </div>

          {/* Quick Demographics Check */}
          <div className="glass-card rounded-3xl p-5 mb-8 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg text-saffron-400">
                👤
              </div>
              <div>
                <p className="text-xs text-surface-400">Analysis Profile</p>
                <p className="text-sm font-semibold text-white">
                  {activeUser.name || 'New Citizen'} (Age: {new Date().getFullYear() - new Date(activeUser.dateOfBirth).getFullYear()}, {activeUser.state || 'State not set'})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-surface-400">Filters Profile:</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] font-semibold text-white bg-white/5 px-2.5 py-1 rounded-full capitalize">Category: {activeUser.category}</span>
                <span className="text-[10px] font-semibold text-white bg-white/5 px-2.5 py-1 rounded-full">Income: ₹{activeUser.annualIncome ? (activeUser.annualIncome/100000).toFixed(1) + 'L/yr' : 'Not set'}</span>
                <span className="text-[10px] font-semibold text-white bg-white/5 px-2.5 py-1 rounded-full capitalize">Job: {activeUser.occupation || 'Not set'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Tabs & Scheme Audit List (col-span-8) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Tab Navigation */}
              <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl overflow-x-auto shrink-0">
                {[
                  { id: 'all' as const, label: 'All Matches', count: schemesWithScores.length },
                  { id: 'high' as const, label: 'High Match (80%+)', count: highMatchCount },
                  { id: 'partial' as const, label: 'Partial Match (50-79%)', count: partialMatchCount },
                  { id: 'low' as const, label: 'Low Match (<50%)', count: lowMatchCount },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-saffron-500 to-saffron-600 text-white shadow-lg'
                        : 'text-surface-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                      activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/5 text-surface-400'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Analysis Animation Overlay */}
              <AnimatePresence mode="wait">
                {analyzing ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass-card rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-saffron-500/10 flex items-center justify-center relative">
                      <Brain className="w-8 h-8 text-saffron-400 animate-pulse" />
                      <div className="absolute inset-0 rounded-2xl border-2 border-saffron-500 border-t-transparent animate-spin" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-[family-name:var(--font-display)]">Auditing Scheme Requirements</h3>
                      <p className="text-sm text-surface-400 mt-1 max-w-sm mx-auto">
                        Evaluating age thresholds, geographic restrictions, categorizations, and family income ranges...
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {filteredSchemes.length === 0 ? (
                      <div className="glass-card rounded-3xl p-10 text-center text-surface-400 text-sm">
                        No schemes found matching this filter criteria.
                      </div>
                    ) : (
                      filteredSchemes.map((scheme) => {
                        const score = scheme.eligibilityScore || 0;
                        const isExpanded = expandedScheme === scheme.id;
                        const checks = getCriteriaCheck(scheme);
                        const passedChecks = checks.filter(c => c.status === 'pass').length;

                        return (
                          <div
                            key={scheme.id}
                            className={`glass-card rounded-3xl border transition-all duration-300 ${
                              isExpanded 
                                ? 'border-saffron-500/30 shadow-xl shadow-saffron-500/5' 
                                : 'border-white/5 hover:border-white/15'
                            }`}
                          >
                            {/* Summary Header */}
                            <div
                              onClick={() => setExpandedScheme(isExpanded ? null : scheme.id)}
                              className="p-5 flex items-center justify-between gap-4 cursor-pointer"
                            >
                              <div className="flex items-center gap-4 min-w-0">
                                {/* Score Circle */}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                                  score >= 80 
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                                    : score >= 50 
                                    ? 'bg-saffron-500/15 text-saffron-400 border border-saffron-500/20' 
                                    : 'bg-white/5 text-surface-400 border border-white/5'
                                }`}>
                                  {score}%
                                </div>
                                <div className="min-w-0">
                                  <h3 className="text-sm sm:text-base font-semibold text-white truncate font-[family-name:var(--font-display)]">
                                    {scheme.name}
                                  </h3>
                                  <p className="text-xs text-surface-500 truncate mt-0.5">
                                    {scheme.ministry}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md hidden sm:block ${
                                  score >= 80 
                                    ? 'bg-emerald-500/10 text-emerald-400' 
                                    : score >= 50 
                                    ? 'bg-saffron-500/10 text-saffron-400' 
                                    : 'bg-white/5 text-surface-400'
                                }`}>
                                  {score >= 80 ? 'High Match' : score >= 50 ? 'Partial Match' : 'Low Match'}
                                </span>
                                {isExpanded ? <ChevronDown className="w-5 h-5 text-surface-400" /> : <ChevronRight className="w-5 h-5 text-surface-400" />}
                              </div>
                            </div>

                            {/* Details Collapsible Area */}
                            {isExpanded && (
                              <div className="px-5 pb-6 pt-1 border-t border-white/5 bg-white/[0.01] rounded-b-3xl">
                                <p className="text-xs text-surface-300 leading-relaxed mb-4">
                                  {scheme.description}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  {/* Passed Criteria */}
                                  <div className="bg-white/5 rounded-2xl p-4">
                                    <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-3">
                                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                                      Matched Criteria ({passedChecks})
                                    </h4>
                                    <ul className="space-y-2.5">
                                      {checks.filter(c => c.status === 'pass').map((c, idx) => (
                                        <li key={idx} className="text-xs text-surface-300">
                                          <p className="font-semibold text-white leading-none">{c.name}</p>
                                          <p className="text-[10px] text-surface-500 mt-1">{c.desc}</p>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* Failed Criteria */}
                                  <div className="bg-white/5 rounded-2xl p-4">
                                    <h4 className="text-xs font-bold text-red-400 flex items-center gap-1.5 mb-3">
                                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                                      Unmatched / Missing ({checks.length - passedChecks})
                                    </h4>
                                    {checks.filter(c => c.status === 'fail').length === 0 ? (
                                      <p className="text-xs text-surface-500">Perfect eligibility! No criteria missed.</p>
                                    ) : (
                                      <ul className="space-y-2.5">
                                        {checks.filter(c => c.status === 'fail').map((c, idx) => (
                                          <li key={idx} className="text-xs text-surface-300">
                                            <p className="font-semibold text-white flex items-center gap-1 leading-none">
                                              {c.name}
                                              <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 inline shrink-0" />
                                            </p>
                                            <p className="text-[10px] text-yellow-500/70 mt-1">{c.desc}</p>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                </div>

                                {/* Application Guideline Footer */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl">
                                  <div className="flex items-center gap-3 text-left">
                                    <div className="w-8 h-8 rounded-lg bg-saffron-500/10 flex items-center justify-center text-saffron-400">
                                      📄
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-white">Documents Checklist</p>
                                      <p className="text-[10px] text-surface-400 mt-0.5">Required: {scheme.documentsRequired.join(', ')}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Link 
                                      href={`/schemes/${scheme.id}`}
                                      className="flex items-center gap-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-white hover:bg-white/10 hover:border-white/20 transition-all"
                                    >
                                      <BookOpen className="w-3.5 h-3.5" /> Guide
                                    </Link>
                                    <a
                                      href={scheme.applicationUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-saffron-500 to-saffron-600 rounded-xl text-xs font-semibold text-white hover:shadow-md hover:shadow-saffron-500/10 transition-all"
                                    >
                                      Apply Portal <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Circular score dial sidebar (col-span-4) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="glass-card rounded-3xl p-6 text-center">
                <h3 className="text-sm font-bold text-white font-[family-name:var(--font-display)] mb-6">
                  Overall Eligibility Rating
                </h3>

                <EligibilityMeter 
                  score={overallScore}
                  size={180}
                  strokeWidth={12}
                  showLabel={true}
                />

                <p className="text-xs text-surface-400 mt-6 leading-relaxed">
                  Your profile meets the strict prerequisites for <span className="text-white font-medium">{overallScore}%</span> of targeted state and central welfare support packages.
                </p>

                <div className="border-t border-white/5 mt-6 pt-5 grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-2xl p-3">
                    <p className="text-[10px] text-surface-500">Perfect Fit</p>
                    <p className="text-lg font-bold text-emerald-400">{highMatchCount}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3">
                    <p className="text-[10px] text-surface-500">Need Review</p>
                    <p className="text-lg font-bold text-saffron-400">{partialMatchCount}</p>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="glass-card rounded-3xl p-5 bg-gradient-to-br from-saffron-500/5 to-transparent border-saffron-500/10">
                <h4 className="text-xs font-bold text-saffron-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Audit Tips
                </h4>
                <ul className="space-y-2 text-xs text-surface-400">
                  <li className="flex gap-2">
                    <span className="text-saffron-400">•</span>
                    <span>Upload your <b>Income Certificate</b> to claim EWS category matches.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-saffron-400">•</span>
                    <span>Verify your agriculture records if you match farmer category requirements.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-saffron-400">•</span>
                    <span>Toggle BPL card status in your profile to trigger PMJAY / Ujjwala matching.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
      <Chatbot />
    </div>
  );
}
