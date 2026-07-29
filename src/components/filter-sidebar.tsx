'use client';

import { useState } from 'react';
import { schemeCategories, indianStates } from '@/lib/mock-data';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface Filters {
  categories: string[];
  states: string[];
  gender: string;
  schemeType: string;
  incomeRange: string;
  requiresBpl: boolean;
  requiresFarmer: boolean;
  requiresStudent: boolean;
}

interface FilterSidebarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterSidebar({ filters, onFiltersChange, isOpen, onClose }: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const toggleCategory = (catId: string) => {
    const cats = localFilters.categories.includes(catId)
      ? localFilters.categories.filter(c => c !== catId)
      : [...localFilters.categories, catId];
    updateFilter('categories', cats);
  };

  const resetFilters = () => {
    const defaults: Filters = {
      categories: [],
      states: [],
      gender: 'all',
      schemeType: 'all',
      incomeRange: 'all',
      requiresBpl: false,
      requiresFarmer: false,
      requiresStudent: false,
    };
    setLocalFilters(defaults);
    onFiltersChange(defaults);
  };

  const activeCount = [
    localFilters.categories.length > 0,
    localFilters.states.length > 0,
    localFilters.gender !== 'all',
    localFilters.schemeType !== 'all',
    localFilters.incomeRange !== 'all',
    localFilters.requiresBpl,
    localFilters.requiresFarmer,
    localFilters.requiresStudent,
  ].filter(Boolean).length;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed lg:sticky top-16 lg:top-20 right-0 z-40 h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] w-80 lg:w-72 glass-card rounded-none lg:rounded-2xl p-5 overflow-y-auto transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-saffron-400" />
            <h3 className="text-sm font-semibold text-white">Filters</h3>
            {activeCount > 0 && (
              <span className="text-xs bg-saffron-500/15 text-saffron-400 px-2 py-0.5 rounded-full font-medium">
                {activeCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={resetFilters} className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-white/5 transition-all" title="Reset">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-white/5 transition-all lg:hidden">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-5">
          <h4 className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-3">Category</h4>
          <div className="flex flex-wrap gap-1.5">
            {schemeCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  localFilters.categories.includes(cat.id)
                    ? 'text-white border'
                    : 'text-surface-400 bg-white/5 hover:bg-white/10'
                }`}
                style={
                  localFilters.categories.includes(cat.id)
                    ? { background: `${cat.color}20`, borderColor: `${cat.color}40`, color: cat.color }
                    : {}
                }
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scheme Type */}
        <div className="mb-5">
          <h4 className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-3">Scheme Type</h4>
          <div className="flex gap-2">
            {['all', 'central', 'state', 'private'].map((type) => (
              <button
                key={type}
                onClick={() => updateFilter('schemeType', type)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all capitalize ${
                  localFilters.schemeType === type
                    ? 'bg-saffron-500/15 text-saffron-400 border border-saffron-500/20'
                    : 'text-surface-400 bg-white/5 hover:bg-white/10'
                }`}
              >
                {type === 'all' ? 'All' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Gender */}
        <div className="mb-5">
          <h4 className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-3">Target Gender</h4>
          <div className="flex gap-2">
            {['all', 'male', 'female'].map((g) => (
              <button
                key={g}
                onClick={() => updateFilter('gender', g)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all capitalize ${
                  localFilters.gender === g
                    ? 'bg-saffron-500/15 text-saffron-400 border border-saffron-500/20'
                    : 'text-surface-400 bg-white/5 hover:bg-white/10'
                }`}
              >
                {g === 'all' ? 'All' : g}
              </button>
            ))}
          </div>
        </div>

        {/* State filter */}
        <div className="mb-5">
          <h4 className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-3">State</h4>
          <select
            value={localFilters.states[0] || ''}
            onChange={(e) => updateFilter('states', e.target.value ? [e.target.value] : [])}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-saffron-500/30 transition-colors"
          >
            <option value="" className="bg-surface-900">All States</option>
            {indianStates.map((s) => (
              <option key={s} value={s} className="bg-surface-900">{s}</option>
            ))}
          </select>
        </div>

        {/* Income Range */}
        <div className="mb-5">
          <h4 className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-3">Max Income Limit</h4>
          <select
            value={localFilters.incomeRange}
            onChange={(e) => updateFilter('incomeRange', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-saffron-500/30 transition-colors"
          >
            <option value="all" className="bg-surface-900">Any Income</option>
            <option value="100000" className="bg-surface-900">Up to ₹1 Lakh</option>
            <option value="250000" className="bg-surface-900">Up to ₹2.5 Lakh</option>
            <option value="500000" className="bg-surface-900">Up to ₹5 Lakh</option>
            <option value="800000" className="bg-surface-900">Up to ₹8 Lakh</option>
          </select>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-3">Special Categories</h4>
          {[
            { key: 'requiresBpl' as const, label: 'Below Poverty Line (BPL)' },
            { key: 'requiresFarmer' as const, label: 'Farmer' },
            { key: 'requiresStudent' as const, label: 'Student' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-surface-300 group-hover:text-white transition-colors">{label}</span>
              <div
                onClick={() => updateFilter(key, !localFilters[key])}
                 className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${
                   localFilters[key] ? 'bg-saffron-500' : 'bg-white/10'
                 }`}
                 >
                   <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                     localFilters[key] ? 'translate-x-5' : 'translate-x-0.5'
                   }`} />
              </div>
            </label>
          ))}
        </div>
      </aside>
    </>
  );
}
