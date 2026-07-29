'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import Chatbot from '@/components/chatbot';
import SchemeCard from '@/components/scheme-card';
import StatsCard from '@/components/stats-card';
import Footer from '@/components/footer';
import { mockSchemes, calculateEligibilityScore, schemeCategories } from '@/lib/mock-data';
import { useAuth } from '@/contexts/auth-context';
import { Users, FileText, CheckCircle2, TrendingUp, ArrowRight, Brain, Clock, UserCircle, GraduationCap, Building2, Landmark } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const activeUser = user;
  const [now] = useState(() => Date.now());

  // Protect route
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [user, loading, router]);

  const topSchemes = activeUser
    ? mockSchemes
        .filter((s) => !s.requiresStudent) // non-student schemes for general section
        .map((s) => ({ ...s, eligibilityScore: calculateEligibilityScore(s, activeUser) }))
        .filter((s) => s.eligibilityScore >= 50) // strictly show relevant schemes
        .sort((a, b) => b.eligibilityScore - a.eligibilityScore)
        .slice(0, 4)
    : mockSchemes.filter((s) => !s.requiresStudent).slice(0, 4).map((s) => ({ ...s, eligibilityScore: 0 }));

  // Student-specific schemes sorted by eligibility
  const studentSchemes = activeUser
    ? mockSchemes
        .filter((s) => s.requiresStudent)
        .map((s) => ({ ...s, eligibilityScore: calculateEligibilityScore(s, activeUser) }))
        .filter((s) => s.eligibilityScore >= 50) // strictly show relevant scholarships
        .sort((a, b) => b.eligibilityScore - a.eligibilityScore)
        .slice(0, 6)
    : [];

  const totalEligible = activeUser
    ? mockSchemes.filter((s) => calculateEligibilityScore(s, activeUser) >= 50).length
    : 0;

  const firstName = activeUser?.name?.split(' ')[0] || 'Citizen';

  if (loading) {
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-2 border-saffron-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-surface-400 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-[family-name:var(--font-display)]">
                Namaste, {firstName}! 🙏
              </h1>
              <p className="text-surface-400 mt-1">
                {activeUser?.name
                  ? "Here's your personalized scheme recommendations based on your profile"
                  : "Complete your profile to get personalized scheme recommendations"}
              </p>
            </div>
            <Link
              href="/eligibility"
              className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-saffron-500 to-saffron-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-saffron-500/25 transition-all shrink-0"
            >
              <Brain className="w-4 h-4" />
              Run AI Analysis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Profile incomplete banner */}
        {activeUser && !activeUser.name && (
          <div className="mb-6 p-4 bg-saffron-500/10 border border-saffron-500/20 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <UserCircle className="w-5 h-5 text-saffron-400 shrink-0" />
              <p className="text-sm text-saffron-300">
                <strong>Complete your profile</strong> to see schemes matched specifically for you
              </p>
            </div>
            <Link href="/profile" className="text-xs font-semibold text-saffron-400 hover:text-saffron-300 whitespace-nowrap">
              Set Up Profile →
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Eligible Schemes"
            value={totalEligible}
            icon={CheckCircle2}
            trend={{ value: 12, isPositive: true }}
            color="#10b981"
            delay={0}
          />
          <StatsCard
            title="Total Schemes"
            value={mockSchemes.length}
            suffix="+"
            icon={FileText}
            color="#3b82f6"
            delay={100}
          />
          <StatsCard
            title="Avg Match Score"
            value={activeUser
              ? Math.round(mockSchemes.reduce((acc, s) => acc + calculateEligibilityScore(s, activeUser), 0) / mockSchemes.length)
              : 0}
            suffix="%"
            icon={TrendingUp}
            trend={{ value: 5, isPositive: true }}
            color="#f97316"
            delay={200}
          />
          <StatsCard
            title="Citizens Helped"
            value={15420}
            icon={Users}
            trend={{ value: 18, isPositive: true }}
            color="#8b5cf6"
            delay={300}
          />
        </div>

        {/* ── STUDENT SCHOLARSHIP SECTION (shows only when user is a student) ── */}
        {activeUser?.isStudent && studentSchemes.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white font-[family-name:var(--font-display)]">
                    🎓 Scholarships For You
                  </h2>
                  <p className="text-xs text-surface-400">Government + Private Industry — matched to your profile</p>
                </div>
              </div>
              <Link href="/schemes?category=scholarship" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentSchemes.map((scheme) => {
                const isGov = scheme.schemeSource === 'government';
                const isPrivate = scheme.schemeSource === 'private_industry';
                const isNgo = scheme.schemeSource === 'ngo';
                return (
                  <Link key={scheme.id} href={`/schemes/${scheme.id}`} className="glass-card rounded-2xl p-4 hover:border-purple-500/30 border border-white/5 transition-all group block">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        {isGov && (
                          <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/15">
                            <Landmark className="w-2.5 h-2.5" /> GOVT
                          </span>
                        )}
                        {isPrivate && (
                          <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                            <Building2 className="w-2.5 h-2.5" /> INDUSTRY
                          </span>
                        )}
                        {isNgo && (
                          <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-saffron-500/10 text-saffron-400 border border-saffron-500/15">
                            🤝 PLATFORM
                          </span>
                        )}
                      </div>
                      <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        scheme.eligibilityScore >= 70 ? 'bg-emerald-500/10 text-emerald-400' :
                        scheme.eligibilityScore >= 40 ? 'bg-saffron-500/10 text-saffron-400' :
                        'bg-white/5 text-surface-400'
                      }`}>
                        {scheme.eligibilityScore}%
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-white leading-tight mb-1 group-hover:text-purple-300 transition-colors line-clamp-2">
                      {scheme.name}
                    </h3>
                    <p className="text-xs text-surface-500 mb-2 truncate">{scheme.sourceOrg || scheme.ministry}</p>
                    <p className="text-xs font-medium text-emerald-400 bg-emerald-500/5 rounded-lg px-2.5 py-1.5 leading-snug line-clamp-2">
                      💰 {scheme.benefits.split('.')[0]}
                    </p>
                    {scheme.deadline && (
                      <p className="text-[10px] text-surface-500 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Deadline: {new Date(scheme.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Prompt non-students to toggle student status */}
        {activeUser && !activeUser.isStudent && (
          <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-purple-400 shrink-0" />
              <p className="text-sm text-purple-300">
                <strong>Are you a student?</strong> Enable student status in your profile to see 19+ exclusive scholarships from government & top companies like Reliance, Tata, Google!
              </p>
            </div>
            <Link href="/profile" className="text-xs font-semibold text-purple-400 hover:text-purple-300 whitespace-nowrap shrink-0">
              Update Profile →
            </Link>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Recommended Schemes */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white font-[family-name:var(--font-display)]">
                🎯 Top Recommendations for You
              </h2>
              <Link href="/schemes" className="text-sm text-saffron-400 hover:text-saffron-300 flex items-center gap-1 transition-colors">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {topSchemes.map((scheme) => (
                <SchemeCard
                  key={scheme.id}
                  scheme={scheme}
                  eligibilityScore={scheme.eligibilityScore}
                />
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-saffron-400" />
                Your Profile
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-surface-400">Profile Completion</span>
                  <span className="text-emerald-400 font-medium">
                    {activeUser?.name ? (activeUser.state && activeUser.annualIncome ? '85%' : '50%') : '10%'}
                  </span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                    style={{ width: activeUser?.name ? (activeUser.state && activeUser.annualIncome ? '85%' : '50%') : '10%' }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="bg-white/5 rounded-lg p-2.5">
                    <p className="text-xs text-surface-500">Category</p>
                    <p className="text-sm text-white font-medium capitalize">{activeUser?.category || '—'}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2.5">
                    <p className="text-xs text-surface-500">State</p>
                    <p className="text-sm text-white font-medium">{activeUser?.state?.split(' ')[0] || '—'}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2.5">
                    <p className="text-xs text-surface-500">Income</p>
                    <p className="text-sm text-white font-medium">
                      {activeUser?.annualIncome ? `₹${(activeUser.annualIncome / 100000).toFixed(1)}L` : '—'}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2.5">
                    <p className="text-xs text-surface-500">Occupation</p>
                    <p className="text-sm text-white font-medium truncate">{activeUser?.occupation || '—'}</p>
                  </div>
                </div>
                <Link href="/profile" className="block text-center text-xs text-saffron-400 hover:text-saffron-300 mt-2 transition-colors">
                  {activeUser?.name ? 'Update Profile →' : 'Complete Profile →'}
                </Link>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-400" />
                Upcoming Deadlines
              </h3>
              <div className="space-y-3">
                {mockSchemes
                  .filter((s) => s.deadline)
                  .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
                  .slice(0, 3)
                  .map((scheme) => {
                    const daysLeft = Math.max(0, Math.ceil((new Date(scheme.deadline!).getTime() - now) / (1000 * 60 * 60 * 24)));
                    return (
                      <Link key={scheme.id} href={`/schemes/${scheme.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${
                          daysLeft < 30 ? 'bg-red-500/10 text-red-400' : 'bg-saffron-500/10 text-saffron-400'
                        }`}>
                          {daysLeft}d
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate group-hover:text-saffron-300 transition-colors">{scheme.name}</p>
                          <p className="text-xs text-surface-500">{new Date(scheme.deadline!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </div>

            {/* Quick Category Access */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Browse by Category</h3>
              <div className="grid grid-cols-3 gap-2">
                {schemeCategories.slice(0, 6).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/schemes?category=${cat.id}`}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-center group"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">{cat.icon}</span>
                    <span className="text-[10px] text-surface-400 group-hover:text-white transition-colors leading-tight">{cat.label}</span>
                  </Link>
                ))}
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
