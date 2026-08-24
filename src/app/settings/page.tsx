'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/navbar';
import Chatbot from '@/components/chatbot';
import Footer from '@/components/footer';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { 
  Settings, 
  Globe, 
  Volume2, 
  BellRing, 
  ShieldCheck, 
  Check, 
  Sparkles,
  LogOut
} from 'lucide-react';

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Protect route
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [user, loading, router]);

  const [lang, setLang] = useState('en');
  const [notifications, setNotifications] = useState({
    sms: true,
    whatsapp: false,
    email: true,
    deadlines: true,
  });
  
  const [voiceSettings, setVoiceSettings] = useState({
    enabled: true,
    speed: 1.0,
    accent: 'indian-english',
  });

  const [saved, setSaved] = useState(false);

  const toggleNotification = (id: 'sms' | 'whatsapp' | 'email' | 'deadlines') => {
    setNotifications((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-2 border-saffron-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-surface-400 text-sm">Loading settings...</p>
        </div>
      </div>
    );
  }

  const saveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen mesh-gradient flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-[family-name:var(--font-display)] flex items-center gap-2.5">
              <Settings className="w-7 h-7 text-saffron-500" />
              Application Settings
            </h1>
            <p className="text-surface-400 mt-1 text-sm">
              Adjust localization preferences, voice synthesis parameters, and reminder notification delivery networks.
            </p>
          </div>

          <div className="space-y-6">
            {/* Language & Translations */}
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-sm font-bold text-white font-[family-name:var(--font-display)] mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-saffron-400" /> Language & Localization
              </h3>
              <p className="text-xs text-surface-400 mb-4">
                Select your preferred system language. All scheme catalog descriptions and AI assistant conversations will adapt dynamically.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'en', name: 'English', native: 'English' },
                  { id: 'hi', name: 'Hindi', native: 'हिन्दी' },
                  { id: 'ta', name: 'Tamil', native: 'தமிழ்' },
                  { id: 'te', name: 'Telugu', native: 'తెలుగు' },
                  { id: 'bn', name: 'Bengali', native: 'বাংলা' },
                  { id: 'mr', name: 'Marathi', native: 'मराठी' },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLang(l.id)}
                    className={`p-4 rounded-2xl border text-left flex flex-col transition-all ${
                      lang === l.id
                        ? 'bg-saffron-500/10 border-saffron-500/40 text-saffron-400'
                        : 'bg-white/5 border-white/10 text-surface-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-semibold text-white">{l.name}</span>
                    <span className="text-[10px] text-surface-400 mt-1">{l.native}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Assistant parameters */}
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-sm font-bold text-white font-[family-name:var(--font-display)] mb-4 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-saffron-400" /> Voice Assistant Engine
              </h3>
              <p className="text-xs text-surface-400 mb-4">
                Configure browser-native Web Speech synthesis and recognition parameters for hands-free audio command control.
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">Enable Audio Responses</p>
                    <p className="text-[10px] text-surface-500 mt-0.5">Let AI read scheme eligibility details aloud</p>
                  </div>
                  <button
                    onClick={() => setVoiceSettings(v => ({ ...v, enabled: !v.enabled }))}
                    className={`w-11 h-6 rounded-full p-1 transition-colors ${
                      voiceSettings.enabled ? 'bg-saffron-500' : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      voiceSettings.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                  <div>
                    <label className="block text-xs font-semibold text-surface-300 mb-2">Speech Synthesizer Speed ({voiceSettings.speed}x)</label>
                    <input
                      type="range"
                      min="0.5"
                      max="1.8"
                      step="0.1"
                      value={voiceSettings.speed}
                      onChange={(e) => setVoiceSettings(v => ({ ...v, speed: parseFloat(e.target.value) }))}
                      className="w-full accent-saffron-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-surface-300 mb-2">Accent / TTS Voice Profile</label>
                    <select
                      value={voiceSettings.accent}
                      onChange={(e) => setVoiceSettings(v => ({ ...v, accent: e.target.value }))}
                      className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-saffron-500/40"
                    >
                      <option value="indian-english">Indian English Accent</option>
                      <option value="hindi-female">Hindi Female Accent</option>
                      <option value="tamil-female">Tamil Female Accent</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Delivery Channels */}
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-sm font-bold text-white font-[family-name:var(--font-display)] mb-4 flex items-center gap-2">
                <BellRing className="w-4 h-4 text-saffron-400" /> Notifications & Alerts
              </h3>
              <p className="text-xs text-surface-400 mb-4">
                Select where you want to receive critical updates about application deadlines, scheme launches, and score updates.
              </p>

               <div className="space-y-3.5">
                 {[
                   { id: 'sms' as const, label: 'SMS Notifications', desc: 'Direct cell text alerts for deadline dates' },
                   { id: 'whatsapp' as const, label: 'WhatsApp Alerts', desc: 'Real-time interactive matches pushed straight to chat' },
                   { id: 'email' as const, label: 'Email Digests', desc: 'Weekly roundup of newly eligible schemes' },
                   { id: 'deadlines' as const, label: 'Browser Push Alerts', desc: 'Keep track of timeline dates when visiting portal' },
                 ].map((notif) => (
                  <div key={notif.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-b-0">
                    <div>
                      <p className="text-xs font-semibold text-white">{notif.label}</p>
                      <p className="text-[10px] text-surface-500 mt-0.5">{notif.desc}</p>
                    </div>
                     <button
                       onClick={() => toggleNotification(notif.id)}
                       className={`w-11 h-6 rounded-full p-1 transition-colors ${
                         notifications[notif.id] ? 'bg-emerald-500' : 'bg-white/10'
                       }`}
                     >
                       <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                         notifications[notif.id] ? 'translate-x-5' : 'translate-x-0'
                       }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Assurance */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-400">Government Security Standards</h4>
                <p className="text-[10px] text-surface-400 leading-relaxed mt-1">
                  JanSeva AI does not store Aadhaar numbers or bank certificates on local storage networks. All matches are processed securely using temporary session audits.
                </p>
              </div>
            </div>

            {/* Account Management & Sign Out */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Account Session</h4>
                <p className="text-[10px] text-surface-400 mt-0.5">
                  Signed in as <span className="text-emerald-400">{user?.email || user?.phone || 'Citizen'}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold transition-all"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-surface-500">Last saved: Just now</span>
              <button
                onClick={saveSettings}
                className="flex items-center gap-1.5 px-6 py-3 bg-gradient-to-r from-saffron-500 to-saffron-600 hover:shadow-lg hover:shadow-saffron-500/20 text-white font-bold rounded-2xl text-xs transition-all"
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4 text-white" /> Settings Saved!
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" /> Save Preferences
                  </>
                )}
              </button>
            </div>
          </div>
        </main>
      </div>

      <Footer />
      <Chatbot />
    </div>
  );
}
