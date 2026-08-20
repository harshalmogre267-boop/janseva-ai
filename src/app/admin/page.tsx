'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/navbar';
import Chatbot from '@/components/chatbot';
import Footer from '@/components/footer';
import StatsCard from '@/components/stats-card';
import { 
  mockSchemes, 
  mockUserProfile, 
  analyticsData, 
  schemeCategories,
  Scheme
} from '@/lib/mock-data';
import { 
  BarChart3, 
  Users, 
  Layers, 
  Trash2, 
  Edit, 
  TrendingUp, 
  FileText, 
  CheckCircle,
  X,
  PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { db, isConfigValid } from '@/lib/firebase';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';

// Dynamically import Recharts components to prevent Next.js SSR hydration errors
const ResponsiveContainer = dynamic(
  () => import('recharts').then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const XAxis = dynamic(
  () => import('recharts').then((m) => m.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import('recharts').then((m) => m.YAxis),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then((m) => m.Tooltip),
  { ssr: false }
);
const PieChart = dynamic(
  () => import('recharts').then((m) => m.PieChart),
  { ssr: false }
);
const Pie = dynamic(
  () => import('recharts').then((m) => m.Pie),
  { ssr: false }
);
const Cell = dynamic(
  () => import('recharts').then((m) => m.Cell),
  { ssr: false }
);
const LineChart = dynamic(
  () => import('recharts').then((m) => m.LineChart),
  { ssr: false }
);
const Line = dynamic(
  () => import('recharts').then((m) => m.Line),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import('recharts').then((m) => m.CartesianGrid),
  { ssr: false }
);

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'analytics' | 'schemes' | 'users'>('analytics');
  const [schemes, setSchemes] = useState<Scheme[]>(mockSchemes);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newSchemeName, setNewSchemeName] = useState('');
  const [newSchemeCategory, setNewSchemeCategory] = useState('agriculture');
  const [newSchemeMinistry, setNewSchemeMinistry] = useState('');
  const [newSchemeDesc, setNewSchemeDesc] = useState('');
  const [newSchemeBenefit, setNewSchemeBenefit] = useState('');
  
  // Protect route
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadSchemes() {
      if (!isConfigValid || !db) return;

      try {
        const snapshot = await getDocs(collection(db, 'schemes'));
        if (!snapshot.empty) {
          setSchemes(snapshot.docs.map((schemeDoc) => schemeDoc.data() as Scheme));
        }
      } catch (err) {
        console.error('Failed to load schemes from Firestore:', err);
      }
    }

    loadSchemes();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-2 border-saffron-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-surface-400 text-sm">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }
  
  const handleCreateScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchemeName || !newSchemeMinistry) return;

    const newScheme: Scheme = {
      id: `s-${Date.now()}`,
      name: newSchemeName,
      nameHi: newSchemeName,
      description: newSchemeDesc,
      category: newSchemeCategory,
      ministry: newSchemeMinistry,
      benefits: newSchemeBenefit,
      schemeType: 'central',
      targetState: null,
      minAge: null,
      maxAge: null,
      minIncome: null,
      maxIncome: null,
      targetGender: 'all',
      targetCategories: ['general', 'obc', 'sc', 'st', 'ews'],
      targetEducation: ['none', 'primary', 'secondary', 'graduate', 'postgraduate'],
      requiresBpl: false,
      requiresFarmer: false,
      requiresStudent: false,
      requiresDisability: false,
      applicationUrl: 'https://india.gov.in',
      deadline: null,
      documentsRequired: ['Aadhaar Card'],
      isActive: true
    };

    if (isConfigValid && db) {
      try {
        await setDoc(doc(db, 'schemes', newScheme.id), newScheme);
      } catch (err) {
        console.error('Failed to save scheme to Firestore:', err);
        return;
      }
    }

    setSchemes((prev) => [newScheme, ...prev]);
    setCreateModalOpen(false);
    
    // Clear form
    setNewSchemeName('');
    setNewSchemeDesc('');
    setNewSchemeMinistry('');
    setNewSchemeBenefit('');
  };

  const deleteScheme = async (id: string) => {
    if (isConfigValid && db) {
      try {
        await deleteDoc(doc(db, 'schemes', id));
      } catch (err) {
        console.error('Failed to delete scheme from Firestore:', err);
        return;
      }
    }

    setSchemes((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen mesh-gradient flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
          {/* Top Panel Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-saffron-400" />
                <span className="text-xs font-semibold text-saffron-400 uppercase tracking-wider bg-saffron-500/10 px-2.5 py-1 rounded-full">
                  Authority console
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-[family-name:var(--font-display)]">
                Admin Dashboard
              </h1>
              <p className="text-surface-400 text-sm mt-1">
                Monitor system metrics, citizen growth trajectories, and scheme indexes.
              </p>
            </div>
            
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-saffron-500 to-saffron-600 hover:shadow-lg hover:shadow-saffron-500/20 text-white font-semibold rounded-2xl transition-all text-sm shrink-0"
            >
              <PlusCircle className="w-4 h-4" /> Add New Scheme
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total Users"
              value={analyticsData.totalUsers}
              icon={Users}
              trend={{ value: 14, isPositive: true }}
              color="#3b82f6"
              delay={0}
            />
            <StatsCard
              title="Active Schemes"
              value={schemes.length}
              icon={Layers}
              trend={{ value: 2, isPositive: true }}
              color="#f97316"
              delay={100}
            />
            <StatsCard
              title="Mock Registrations"
              value={analyticsData.totalApplications}
              icon={FileText}
              trend={{ value: 8, isPositive: true }}
              color="#10b981"
              delay={200}
            />
            <StatsCard
              title="Active Sessions"
              value={analyticsData.activeUsers}
              icon={TrendingUp}
              trend={{ value: 21, isPositive: true }}
              color="#8b5cf6"
              delay={300}
            />
          </div>

          {/* Tab buttons */}
          <div className="flex gap-2 border-b border-white/10 pb-4 mb-6">
             {[
               { id: 'analytics' as const, label: 'Systems Analytics', icon: BarChart3 },
               { id: 'schemes' as const, label: 'Scheme Management', icon: Layers },
               { id: 'users' as const, label: 'User Index', icon: Users },
             ].map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white border border-white/15'
                    : 'text-surface-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENTS */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Monthly User growth chart */}
                  <div className="glass-card rounded-3xl p-6">
                    <h3 className="text-sm font-bold text-white font-[family-name:var(--font-display)] mb-6">
                      Monthly Citizen Registrations
                    </h3>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analyticsData.monthlyUsers}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)' }} />
                          <Line type="monotone" dataKey="users" stroke="#f97316" strokeWidth={3} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Categories share */}
                  <div className="glass-card rounded-3xl p-6">
                    <h3 className="text-sm font-bold text-white font-[family-name:var(--font-display)] mb-6">
                      Schemes Count by Category
                    </h3>
                    <div className="h-72 w-full flex flex-col sm:flex-row items-center justify-around gap-4">
                      <div className="h-full w-full max-w-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analyticsData.schemesByCategory}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="count"
                            >
                              {analyticsData.schemesByCategory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                        {analyticsData.schemesByCategory.slice(0, 8).map((cat, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                            <span className="text-surface-400 font-medium truncate max-w-[100px]">{cat.category}</span>
                            <span className="text-white font-bold">({cat.count})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Schemes CRUD Tab */}
              {activeTab === 'schemes' && (
                <div className="glass-card rounded-3xl p-6 overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-white font-[family-name:var(--font-display)]">
                      Current System Scheme Catalogue
                    </h3>
                    <span className="text-xs text-surface-400">Total: {schemes.length} programs</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-surface-400">
                          <th className="pb-3 font-semibold">Scheme Name</th>
                          <th className="pb-3 font-semibold">Ministry</th>
                          <th className="pb-3 font-semibold">Category</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schemes.map((scheme) => (
                          <tr key={scheme.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                            <td className="py-3 font-medium text-white max-w-[200px] truncate">{scheme.name}</td>
                            <td className="py-3 text-surface-300 max-w-[150px] truncate">{scheme.ministry}</td>
                            <td className="py-3 capitalize">
                              <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-surface-300">
                                {scheme.category}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Active
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 text-surface-400 hover:text-white rounded-lg hover:bg-white/5">
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteScheme(scheme.id)}
                                  className="p-1.5 text-surface-400 hover:text-red-400 rounded-lg hover:bg-white/5"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="glass-card rounded-3xl p-6 overflow-hidden">
                  <h3 className="text-sm font-bold text-white font-[family-name:var(--font-display)] mb-6">
                    Registered Citizens
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-surface-400">
                          <th className="pb-3 font-semibold">Name</th>
                          <th className="pb-3 font-semibold">Phone</th>
                          <th className="pb-3 font-semibold">State</th>
                          <th className="pb-3 font-semibold">Occupation</th>
                          <th className="pb-3 font-semibold">Annual Income</th>
                          <th className="pb-3 font-semibold">Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Mock User row along with a few general mocked records */}
                        <tr className="border-b border-white/5 bg-saffron-500/5">
                          <td className="py-3.5 font-bold text-white flex items-center gap-1.5">
                            {mockUserProfile.name}
                            <span className="text-[9px] bg-saffron-500 text-white px-1.5 py-0.5 rounded">You</span>
                          </td>
                          <td className="py-3.5 text-surface-300">{mockUserProfile.phone}</td>
                          <td className="py-3.5 text-surface-300">{mockUserProfile.state}</td>
                          <td className="py-3.5 text-surface-300 capitalize">{mockUserProfile.occupation}</td>
                          <td className="py-3.5 text-surface-300">₹{mockUserProfile.annualIncome.toLocaleString('en-IN')}</td>
                          <td className="py-3.5 uppercase text-saffron-400 font-semibold">{mockUserProfile.category}</td>
                        </tr>
                        {[
                          { name: 'Amit Shah', phone: '+91 88776 55443', state: 'Gujarat', occ: 'Shopkeeper', inc: 350000, cat: 'general' },
                          { name: 'Meena Devi', phone: '+91 99887 77665', state: 'Bihar', occ: 'Unemployed', inc: 72000, cat: 'sc' },
                          { name: 'Vikram Singh', phone: '+91 77665 44332', state: 'Rajasthan', occ: 'Farmer', inc: 180000, cat: 'obc' },
                          { name: 'Priya Nair', phone: '+91 98889 00112', state: 'Kerala', occ: 'Student', inc: 420000, cat: 'ews' },
                        ].map((user, index) => (
                          <tr key={index} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                            <td className="py-3.5 font-medium text-white">{user.name}</td>
                            <td className="py-3.5 text-surface-400">{user.phone}</td>
                            <td className="py-3.5 text-surface-400">{user.state}</td>
                            <td className="py-3.5 text-surface-400 capitalize">{user.occ}</td>
                            <td className="py-3.5 text-surface-400">₹{user.inc.toLocaleString('en-IN')}</td>
                            <td className="py-3.5 uppercase text-surface-400">{user.cat}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Create Scheme Modal Form */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-3xl w-full max-w-lg p-6 relative z-10 border border-white/10"
            >
              <button
                onClick={() => setCreateModalOpen(false)}
                className="absolute top-4 right-4 text-surface-400 hover:text-white hover:bg-white/5 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-base font-bold text-white font-[family-name:var(--font-display)] mb-4 flex items-center gap-1.5">
                <PlusCircle className="w-5 h-5 text-saffron-500" /> Catalog New Welfare Scheme
              </h3>

              <form onSubmit={handleCreateScheme} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-300 mb-1.5">Scheme Name</label>
                  <input
                    type="text"
                    required
                    value={newSchemeName}
                    onChange={(e) => setNewSchemeName(e.target.value)}
                    placeholder="E.g., PM Garib Kalyan Anna Yojana"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-saffron-500/40 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-surface-300 mb-1.5">Authority Ministry</label>
                    <input
                      type="text"
                      required
                      value={newSchemeMinistry}
                      onChange={(e) => setNewSchemeMinistry(e.target.value)}
                      placeholder="Ministry of Consumer Affairs"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-saffron-500/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-surface-300 mb-1.5">Category</label>
                    <select
                      value={newSchemeCategory}
                      onChange={(e) => setNewSchemeCategory(e.target.value)}
                      className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-saffron-500/40 transition-all"
                    >
                      {schemeCategories.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-300 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={newSchemeDesc}
                    onChange={(e) => setNewSchemeDesc(e.target.value)}
                    placeholder="Provide full description of target group..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-saffron-500/40 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-300 mb-1.5">Benefits Description</label>
                  <input
                    type="text"
                    value={newSchemeBenefit}
                    onChange={(e) => setNewSchemeBenefit(e.target.value)}
                    placeholder="E.g., 5kg food grains per person per month for free"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-saffron-500/40 transition-all"
                  />
                </div>

                <div className="flex gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-white text-xs font-bold hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-saffron-500 to-saffron-600 text-white text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-saffron-500/20 transition-all"
                  >
                    Catalog Scheme
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
      <Chatbot />
    </div>
  );
}
