import { Search, X } from 'lucide-react';
import type { MentorFilters } from '@/hooks/useMentors';
import { useStacks } from '@/hooks/useStacks';

interface FilterBarProps {
  filters: MentorFilters;
  onFiltersChange: (patch: Partial<MentorFilters>) => void;
  onReset: () => void;
}

interface ToggleRowProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ id, label, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-sm text-slate-300 cursor-pointer">
        {label}
      </label>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          checked ? 'bg-indigo-600' : 'bg-slate-700'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default function FilterBar({ filters, onFiltersChange, onReset }: FilterBarProps) {
  const { stacks, loading: stacksLoading } = useStacks();
  
  const minPrice = filters.min_price ?? 0;
  const maxPrice = filters.max_price ?? 500;

  return (
    <aside className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-5 flex flex-col gap-6 sticky top-6 self-start">
      {/* ── Header ─────────────────────────────────────────────── */}
      <h2 className="text-base font-bold text-slate-100">Filters</h2>

      {/* ── Quick Search ───────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Quick Search
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="filter-keyword"
            type="text"
            value={filters.keyword ?? ''}
            onChange={(e) => onFiltersChange({ keyword: e.target.value, page: 1 })}
            placeholder="Mentor name or keyword…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-700 rounded-lg bg-slate-950 placeholder-slate-500 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
          {filters.keyword && (
            <button
              onClick={() => onFiltersChange({ keyword: '', page: 1 })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Tech Stack chips ───────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Tech Stack
        </p>
        <div className="flex flex-wrap gap-2">
          {stacksLoading ? (
            <div className="text-xs text-slate-500 animate-pulse">Loading stacks...</div>
          ) : (
            stacks.map((s) => {
              const active = filters.stack === s.id;
              return (
                <button
                  key={s.id}
                  id={`filter-stack-${s.id}`}
                  onClick={() =>
                    onFiltersChange({ stack: active ? '' : s.id, page: 1 })
                  }
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                    active
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-indigo-500 hover:text-indigo-400'
                  }`}
                >
                  {s.name}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Price Range ────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Price Range
          </p>
          <span className="text-xs font-semibold text-indigo-400">
            ${minPrice} – ${maxPrice === 500 ? '500+' : maxPrice}
          </span>
        </div>
        {/* Min slider */}
        <input
          id="filter-min-price"
          type="range"
          min={0}
          max={500}
          step={10}
          value={minPrice}
          onChange={(e) =>
            onFiltersChange({ min_price: Number(e.target.value), page: 1 })
          }
          className="w-full accent-indigo-500 mb-1 bg-slate-800"
        />
        {/* Max slider */}
        <input
          id="filter-max-price"
          type="range"
          min={0}
          max={500}
          step={10}
          value={maxPrice}
          onChange={(e) =>
            onFiltersChange({ max_price: Number(e.target.value), page: 1 })
          }
          className="w-full accent-indigo-500 bg-slate-800"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>$0</span>
          <span>$500+</span>
        </div>
      </div>

      {/* ── Toggles ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <ToggleRow
          id="filter-available"
          label="Available Now"
          checked={filters.available ?? false}
          onChange={(v) => onFiltersChange({ available: v, page: 1 })}
        />
        <ToggleRow
          id="filter-top-rated"
          label="Top Rated Only"
          checked={filters.top_rated ?? false}
          onChange={(v) => onFiltersChange({ top_rated: v, page: 1 })}
        />
        <ToggleRow
          id="filter-verified"
          label="Verified Identity"
          checked={filters.verified ?? false}
          onChange={(v) => onFiltersChange({ verified: v, page: 1 })}
        />
      </div>

      {/* ── Clear All ──────────────────────────────────────────── */}
      <button
        id="filter-clear-all"
        onClick={onReset}
        className="w-full py-2 text-sm font-medium text-slate-300 border border-slate-700 bg-slate-800/50 rounded-lg hover:bg-slate-800 hover:border-slate-600 hover:text-slate-200 transition-colors"
      >
        Clear All Filters
      </button>
    </aside>
  );
}
