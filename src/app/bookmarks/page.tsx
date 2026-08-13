'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/navbar';
import Chatbot from '@/components/chatbot';
import Footer from '@/components/footer';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useSchemes } from '@/hooks/use-schemes';
import SchemeCard from '@/components/scheme-card';
import { mockUserProfile, calculateEligibilityScore, Scheme } from '@/lib/mock-data';
import { 
  Bookmark, 
  Bell, 
  Trash2, 
  Calendar, 
  Clock, 
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Reminder {
  id: string;
  schemeId: string;
  schemeName: string;
  remindAt: string;
  message: string;
}

export default function BookmarksPage() {
  const { user, loading } = useAuth();
  const { schemes } = useSchemes();
  const router = useRouter();
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['1', '3', '4']); // default mocked bookmarks

  // Protect route
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [user, loading, router]);
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: 'r1',
      schemeId: '3',
      schemeName: 'PM Awas Yojana (Urban)',
      remindAt: '2026-03-24',
      message: 'Apply before PM Awas housing deadline!',
    },
    {
      id: 'r2',
      schemeId: '1',
      schemeName: 'PM Kisan Samman Nidhi',
      remindAt: '2026-12-24',
      message: 'Claim third installment of ₹2,000.',
    }
  ]);

  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [selectedSchemeForReminder, setSelectedSchemeForReminder] = useState<Scheme | null>(null);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderMsg, setReminderMsg] = useState('');

  const removeBookmark = (id: string) => {
    setBookmarkedIds((prev) => prev.filter((bid) => bid !== id));
    // Also clean up any reminders linked to that bookmark
    setReminders((prev) => prev.filter((r) => r.schemeId !== id));
  };

  const addReminderClick = (scheme: Scheme) => {
    setSelectedSchemeForReminder(scheme);
    setReminderDate(scheme.deadline || '');
    setReminderMsg(`Deadline for ${scheme.name} application is approaching!`);
    setReminderModalOpen(true);
  };

  const saveReminder = () => {
    if (!selectedSchemeForReminder || !reminderDate) return;
    
    const newRem: Reminder = {
      id: `r-${Date.now()}`,
      schemeId: selectedSchemeForReminder.id,
      schemeName: selectedSchemeForReminder.name,
      remindAt: reminderDate,
      message: reminderMsg,
    };

    setReminders((prev) => [newRem, ...prev]);
    setReminderModalOpen(false);
    setSelectedSchemeForReminder(null);
  };

  const removeReminder = (remId: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== remId));
  };

  const activeUser = user || mockUserProfile;

  const bookmarkedSchemes = schemes
    .filter((s) => bookmarkedIds.includes(s.id))
    .map((s) => ({
      ...s,
      eligibilityScore: calculateEligibilityScore(s, activeUser),
    }));

  if (loading) {
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-2 border-saffron-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-surface-400 text-sm">Loading saved schemes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-[family-name:var(--font-display)] flex items-center gap-2.5">
              <Bookmark className="w-7 h-7 text-saffron-500 fill-saffron-500" />
              Saved Schemes & Reminders
            </h1>
            <p className="text-surface-400 mt-1 text-sm sm:text-base">
              Track government schemes you have bookmarked, set application deadline reminders, and manage alerts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Bookmarked Grid (col-span-8) */}
            <div className="lg:col-span-8 space-y-6">
              <h2 className="text-lg font-semibold text-white font-[family-name:var(--font-display)] flex items-center gap-2">
                📂 Bookmarked Schemes ({bookmarkedSchemes.length})
              </h2>

              {bookmarkedSchemes.length === 0 ? (
                <div className="glass-card rounded-3xl p-12 text-center text-surface-400 text-sm">
                  You haven&apos;t saved any schemes yet. Go to <span className="text-saffron-400 hover:underline cursor-pointer">Schemes Explorer</span> to bookmark relevant programs.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bookmarkedSchemes.map((scheme) => (
                    <div key={scheme.id} className="relative group">
                      <SchemeCard
                        scheme={scheme}
                        eligibilityScore={scheme.eligibilityScore}
                      />
                      {/* Hover action overlay or footer controls */}
                      <div className="flex gap-2 mt-2 px-1">
                        <button
                          onClick={() => removeBookmark(scheme.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all text-xs font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove Bookmark
                        </button>
                        <button
                          onClick={() => addReminderClick(scheme)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-saffron-500/10 border border-saffron-500/20 text-saffron-400 hover:bg-saffron-500/20 hover:text-saffron-300 transition-all text-xs font-semibold"
                        >
                          <Bell className="w-3.5 h-3.5" /> Set Reminder
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Reminders Sidebar (col-span-4) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="glass-card rounded-3xl p-5">
                <h3 className="text-sm font-bold text-white font-[family-name:var(--font-display)] mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-saffron-400 animate-pulse" />
                  Active Alarm Reminders ({reminders.length})
                </h3>

                {reminders.length === 0 ? (
                  <p className="text-xs text-surface-500 text-center py-6">No reminders scheduled.</p>
                ) : (
                  <div className="space-y-3">
                    {reminders.map((rem) => (
                      <div key={rem.id} className="bg-white/5 rounded-2xl p-4 relative border border-white/5 hover:border-white/10 transition-colors">
                        <button
                          onClick={() => removeReminder(rem.id)}
                          className="absolute top-3 right-3 text-surface-500 hover:text-red-400 p-1 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-center gap-2 mb-2 text-saffron-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-semibold">
                            {new Date(rem.remindAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white pr-6">{rem.schemeName}</p>
                        <p className="text-[10px] text-surface-400 mt-1 leading-normal">
                          {rem.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-white/5 rounded-2xl p-3.5 mt-5 flex items-start gap-3 border border-white/5">
                  <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-surface-400 leading-normal">
                    Reminders are sent to your verified mobile number <b>{activeUser.phone || '+91 98765 43210'}</b> via SMS 1 week prior to the scheme deadline dates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Reminder Scheduling Modal */}
      <AnimatePresence>
        {reminderModalOpen && selectedSchemeForReminder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReminderModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-3xl w-full max-w-md p-6 relative z-10 border border-white/10"
            >
              <button
                onClick={() => setReminderModalOpen(false)}
                className="absolute top-4 right-4 text-surface-400 hover:text-white hover:bg-white/5 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-base font-bold text-white font-[family-name:var(--font-display)] mb-2">
                Schedule Scheme Reminder
              </h3>
              <p className="text-xs text-surface-400 mb-5">
                Set a calendar reminder for <b>{selectedSchemeForReminder.name}</b> before the official portal closes.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-300 mb-2">Reminder Date</label>
                  <input
                    type="date"
                    required
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-saffron-500/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-300 mb-2">Alert Message</label>
                  <textarea
                    rows={3}
                    value={reminderMsg}
                    onChange={(e) => setReminderMsg(e.target.value)}
                    placeholder="Reminder note..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-saffron-500/40 transition-all resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setReminderModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-white text-xs font-bold hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveReminder}
                    disabled={!reminderDate}
                    className="flex-1 py-2.5 bg-gradient-to-r from-saffron-500 to-saffron-600 text-white text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-saffron-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Alarm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
      <Chatbot />
    </div>
  );
}
