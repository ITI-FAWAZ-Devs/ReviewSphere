import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
      <label htmlFor={id} className="text-sm text-foreground cursor-pointer">
        {label}
      </label>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rs-accent ${
          checked ? 'bg-rs-accent' : 'bg-muted-foreground/30'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 rtl:left-auto rtl:right-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default function FilterBar({ filters, onFiltersChange, onReset }: FilterBarProps) {
  const { stacks, loading: stacksLoading } = useStacks();
  const { t } = useTranslation();

  const minPrice = filters.min_price ?? 0;
  const maxPrice = filters.max_price ?? 500;

  return (
    <aside className="bg-card rounded-2xl border border-border shadow-sm p-5 flex flex-col gap-6 sticky top-6 self-start">
      <h2 className="text-base font-bold text-foreground">{t('filter.title')}</h2>

      {/* Quick Search */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          {t('filter.quickSearch')}
        </p>
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            id="filter-keyword"
            type="text"
            value={filters.keyword ?? ''}
            onChange={(e) => onFiltersChange({ keyword: e.target.value, page: 1 })}
            placeholder={t('filter.searchPlaceholder')}
            className="w-full ps-9 pe-3 py-2 text-sm border border-border rounded-lg bg-background placeholder-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-rs-accent focus:border-transparent transition"
          />
          {filters.keyword && (
            <button
              onClick={() => onFiltersChange({ keyword: '', page: 1 })}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tech Stack chips */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          {t('filter.techStack')}
        </p>
        <div className="flex flex-wrap gap-2">
          {stacksLoading ? (
            <div className="text-xs text-muted-foreground animate-pulse">{t('filter.loadingStacks')}</div>
          ) : (
            stacks.map((s) => {
              const active = filters.stack === s.id;
              return (
                <button
                  key={s.id}
                  id={`filter-stack-${s.id}`}
                  onClick={() => onFiltersChange({ stack: active ? '' : s.id, page: 1 })}
                  className={`px-3 py-1 text-xs font-mono font-medium rounded-full border transition-colors ${
                    active
                      ? 'bg-rs-accent border-rs-accent text-white'
                      : 'bg-muted border-border text-foreground hover:border-rs-accent/50 hover:text-rs-accent'
                  }`}
                >
                  {s.name}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t('filter.priceRange')}
          </p>
          <span className="text-xs font-semibold text-rs-accent">
            ${minPrice} – ${maxPrice === 500 ? '500+' : maxPrice}
          </span>
        </div>
        <input id="filter-min-price" type="range" min={0} max={500} step={10} value={minPrice}
          onChange={(e) => onFiltersChange({ min_price: Number(e.target.value), page: 1 })}
          className="w-full accent-rs-accent mb-1 bg-muted"
        />
        <input id="filter-max-price" type="range" min={0} max={500} step={10} value={maxPrice}
          onChange={(e) => onFiltersChange({ max_price: Number(e.target.value), page: 1 })}
          className="w-full accent-rs-accent bg-muted"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>$0</span>
          <span>$500+</span>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-col gap-3">
        <ToggleRow id="filter-available" label={t('filter.availableNow')} checked={filters.available ?? false}
          onChange={(v) => onFiltersChange({ available: v, page: 1 })} />
        <ToggleRow id="filter-top-rated" label={t('filter.topRated')} checked={filters.top_rated ?? false}
          onChange={(v) => onFiltersChange({ top_rated: v, page: 1 })} />
        <ToggleRow id="filter-verified" label={t('filter.verified')} checked={filters.verified ?? false}
          onChange={(v) => onFiltersChange({ verified: v, page: 1 })} />
      </div>

      {/* Clear All */}
      <button
        id="filter-clear-all"
        onClick={onReset}
        className="w-full py-2 text-sm font-medium text-muted-foreground border border-border bg-muted rounded-lg hover:bg-secondary hover:text-foreground transition-colors"
      >
        {t('filter.clearAll')}
      </button>
    </aside>
  );
}
