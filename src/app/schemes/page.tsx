'use client';

import { useState, useMemo, useEffect } from 'react';
import Navbar from '@/components/navbar';
import Chatbot from '@/components/chatbot';
import SchemeCard from '@/components/scheme-card';
import FilterSidebar from '@/components/filter-sidebar';
import Footer from '@/components/footer';
import { calculateEligibilityScore, Scheme } from '@/lib/mock-data';
import { useAuth } from '@/contexts/auth-context';
import { useSchemes } from '@/hooks/use-schemes';
import { Search, SlidersHorizontal, LayoutGrid, List, ArrowUpDown } from 'lucide-react';

export default function SchemesPage() {
  const { user } = useAuth();
  const { schemes: dbSchemes } = useSchemes();
  const [allSchemes, setAllSchemes] = useState<Scheme[]>([]);
  const [isScraping, setIsScraping] = useState(false);

  useEffect(() => {
    setAllSchemes(dbSchemes);
  }, [dbSchemes]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'name' | 'deadline'>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: [] as string[],
    states: [] as string[],
    gender: 'all',
    schemeType: 'all',
    incomeRange: 'all',
    requiresBpl: false,
    requiresFarmer: false,
    requiresStudent: false,
  });

  // Fetch live scraped schemes automatically
  useEffect(() => {
    async function fetchLiveSchemes() {
      try {
        setIsScraping(true);
        const res = await fetch('/api/scrape');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setAllSchemes(prev => {
              const existingIds = new Set(prev.map(s => s.id));
              const newSchemes = data.data.filter((s: Scheme) => !existingIds.has(s.id));
              return [...prev, ...newSchemes];
            });
          }
        }
      } catch (e) {
        console.error('Failed to fetch scraped schemes', e);
      } finally {
        setIsScraping(false);
      }
    }
    fetchLiveSchemes();
  }, []);

  const filteredSchemes = useMemo(() => {
    let result = allSchemes.map((s) => ({
      ...s,
      eligibilityScore: user ? calculateEligibilityScore(s, user) : 0,
    }));

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.ministry.toLowerCase().includes(q) ||
          s.benefits.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter((s) => filters.categories.includes(s.category));
    }

    // Scheme type filter
    if (filters.schemeType !== 'all') {
      result = result.filter((s) => s.schemeType === filters.schemeType);
    }

    // Gender filter
    if (filters.gender !== 'all') {
      result = result.filter((s) => s.targetGender === 'all' || s.targetGender === filters.gender);
    }

    // Special category filters
    if (filters.requiresBpl) result = result.filter((s) => s.requiresBpl);
    if (filters.requiresFarmer) result = result.filter((s) => s.requiresFarmer);
    if (filters.requiresStudent) result = result.filter((s) => s.requiresStudent);

    // Sort
    switch (sortBy) {
      case 'relevance':
        if (user) {
          result = result.filter((s) => s.eligibilityScore >= 50);
        }
        result.sort((a, b) => b.eligibilityScore - a.eligibilityScore);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'deadline':
        result.sort((a, b) => {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        });
        break;
    }

    return result;
  }, [searchQuery, filters, sortBy, user, allSchemes]);

  return (
    <div className="min-h-screen mesh-gradient">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-[family-name:var(--font-display)] mb-2 flex items-center gap-3">
            🔍 Explore Government Schemes
            {isScraping && <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full animate-pulse border border-emerald-500/30">Scraping Live Web...</span>}
          </h1>
          <p className="text-surface-400">
            Browse {allSchemes.length}+ schemes • Showing {filteredSchemes.length} results
          </p>
        </div>

        {/* Search & Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search schemes by name, ministry, or keyword..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-saffron-500/30 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-white focus:outline-none focus:border-saffron-500/30 transition-colors cursor-pointer"
              >
                <option value="relevance" className="bg-surface-900">Best Match</option>
                <option value="name" className="bg-surface-900">Name A-Z</option>
                <option value="deadline" className="bg-surface-900">Deadline</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none" />
            </div>

            {/* View toggle */}
            <div className="hidden sm:flex bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-saffron-500/15 text-saffron-400' : 'text-surface-500 hover:text-white'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-saffron-500/15 text-saffron-400' : 'text-surface-500 hover:text-white'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Filter toggle (mobile) */}
            <button
              onClick={() => setFilterOpen(true)}
              className="lg:hidden p-3 bg-white/5 border border-white/10 rounded-xl text-surface-400 hover:text-white transition-colors relative"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {Object.values(filters).some((v) => (Array.isArray(v) ? v.length > 0 : v !== 'all' && v !== false)) && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-saffron-500 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Content with sidebar */}
        <div className="flex gap-6">
          {/* Schemes Grid */}
          <div className="flex-1">
            {filteredSchemes.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <p className="text-4xl mb-4">🔍</p>
                <h3 className="text-lg font-semibold text-white mb-2">No schemes found</h3>
                <p className="text-sm text-surface-400">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                  : 'space-y-4'
              }>
                {filteredSchemes.map((scheme) => (
                  <SchemeCard
                    key={scheme.id}
                    scheme={scheme}
                    eligibilityScore={scheme.eligibilityScore}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Filter Sidebar (desktop always visible) */}
          <div className="hidden lg:block w-72 shrink-0">
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              isOpen={true}
              onClose={() => { }}
            />
          </div>
        </div>

        {/* Mobile filter sidebar */}
        <div className="lg:hidden">
          <FilterSidebar
            filters={filters}
            onFiltersChange={setFilters}
            isOpen={filterOpen}
            onClose={() => setFilterOpen(false)}
          />
        </div>
      </main>

      <Footer />
      <Chatbot />
    </div>
  );
}
