import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/lib/toast';
import { useMentors, type MentorFilters } from '@/hooks/useMentors';
import FilterBar from '@/components/FilterBar';
import MentorList from '@/components/MentorList';
import Pagination from '@/components/Pagination';

const DEFAULT_FILTERS: MentorFilters = {
  stack:      '',
  sort_by:    '',
  keyword:    '',
  page:       1,
  min_price:  0,
  max_price:  500,
  available:  false,
  top_rated:  false,
  verified:   false,
};

export default function MentorDiscovery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  const sortOptions = [
    { value: '',             label: t('mentor.discovery.sortRelevant') },
    { value: 'rating',       label: t('mentor.discovery.sortRated') },
    { value: 'price',        label: t('mentor.discovery.sortPrice') },
    { value: 'availability', label: t('mentor.discovery.sortAvailable') },
  ];

  // Initialise filters from URL query params
  const [filters, setFilters] = useState<MentorFilters>(() => ({
    stack:     searchParams.get('stack')    ?? DEFAULT_FILTERS.stack,
    sort_by:   (searchParams.get('sort_by') ?? DEFAULT_FILTERS.sort_by) as MentorFilters['sort_by'],
    keyword:   searchParams.get('keyword')  ?? DEFAULT_FILTERS.keyword,
    page:      Number(searchParams.get('page') ?? 1),
    min_price: Number(searchParams.get('min_price') ?? DEFAULT_FILTERS.min_price),
    max_price: Number(searchParams.get('max_price') ?? DEFAULT_FILTERS.max_price),
    available: searchParams.get('available') === 'true',
    top_rated: searchParams.get('top_rated') === 'true',
    verified:  searchParams.get('verified')  === 'true',
  }));

  // Keep URL in sync whenever filters change
  useEffect(() => {
    const next = new URLSearchParams();
    if (filters.stack)              next.set('stack',     filters.stack);
    if (filters.sort_by)            next.set('sort_by',   filters.sort_by);
    if (filters.keyword)            next.set('keyword',   filters.keyword);
    if (filters.page && filters.page > 1) next.set('page', String(filters.page));
    if (filters.min_price)          next.set('min_price', String(filters.min_price));
    if (filters.max_price !== 500)  next.set('max_price', String(filters.max_price));
    if (filters.available)          next.set('available', 'true');
    if (filters.top_rated)          next.set('top_rated', 'true');
    if (filters.verified)           next.set('verified',  'true');
    setSearchParams(next, { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Sync `page` param from Pagination component back into filter state
  useEffect(() => {
    const pageFromUrl = Number(searchParams.get('page') ?? 1);
    if (pageFromUrl !== filters.page) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilters((f) => ({ ...f, page: pageFromUrl }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('page')]);

  const { mentors, pagination, loading, error } = useMentors(filters);

  // Toast on error
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  function handleFiltersChange(patch: Partial<MentorFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  function handleReset() {
    setFilters({ ...DEFAULT_FILTERS });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Main layout ────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex gap-7 flex-1 w-full">
        {/* Sidebar */}
        <div className="hidden lg:block w-56 flex-shrink-0">
          <FilterBar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleReset}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Content header */}
          <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('mentor.discovery.title')}</h1>
              {!loading && (
                <p className="text-sm text-muted-foreground mt-1">
                  {t('mentor.discovery.showing', { count: pagination.totalCount })}
                </p>
              )}
            </div>

            {/* Sort by */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <label htmlFor="sort-select" className="text-sm text-muted-foreground">
                {t('mentor.discovery.sortBy')}:
              </label>
              <select
                id="sort-select"
                value={filters.sort_by ?? ''}
                onChange={(e) =>
                  handleFiltersChange({
                    sort_by: e.target.value as MentorFilters['sort_by'],
                    page: 1,
                  })
                }
                className="text-sm font-semibold text-rs-accent border border-border rounded-lg px-3 py-1.5 bg-card focus:outline-none focus:ring-2 focus:ring-rs-accent/30 transition cursor-pointer"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile filters (collapsed) */}
          <details className="lg:hidden mb-5 bg-card border border-border rounded-2xl shadow-sm">
            <summary className="px-5 py-3 text-sm font-semibold text-foreground cursor-pointer select-none list-none flex items-center justify-between">
              <span>{t('filter.title')}</span>
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-5 pb-5">
              <FilterBar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onReset={handleReset}
              />
            </div>
          </details>

          {/* Mentor grid */}
          <MentorList mentors={mentors} loading={loading} error={error} />

          {/* Pagination */}
          {!loading && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
            />
          )}
        </div>
      </main>
    </div>
  );
}
