import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { toast } from '@/lib/toast';
import { useMentors, type MentorFilters } from '@/hooks/useMentors';
import FilterBar from '@/components/FilterBar';
import MentorList from '@/components/MentorList';
import Pagination from '@/components/Pagination';
import { useAuth } from '@/context/AuthContext';

const SORT_OPTIONS = [
  { value: '',             label: 'Most Relevant' },
  { value: 'rating',       label: 'Highest Rated' },
  { value: 'price',        label: 'Lowest Price' },
  { value: 'availability', label: 'Available Now' },
] as const;

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/mentors" className="text-indigo-400 font-bold text-xl tracking-tight">
            MentorHub
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <Link
              to="/mentors"
              className="text-indigo-400 border-b-2 border-indigo-400 pb-0.5"
            >
              Find Mentors
            </Link>
            <a href="#" className="text-slate-400 hover:text-slate-200 transition-colors">About</a>
            <a href="#" className="text-slate-400 hover:text-slate-200 transition-colors">Pricing</a>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-300 hidden sm:block">{user.name}</span>
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                to="/signup"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm shadow-indigo-900/20"
              >
                Join Now
              </Link>
            )}
          </div>
        </div>
      </header>

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
              <h1 className="text-2xl font-bold text-slate-100">Expert Mentors</h1>
              {!loading && (
                <p className="text-sm text-slate-400 mt-1">
                  Showing{' '}
                  <span className="font-semibold text-slate-200">
                    {pagination.totalCount.toLocaleString()}
                  </span>{' '}
                  available mentors tailored to your stack.
                </p>
              )}
            </div>

            {/* Sort by */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <label htmlFor="sort-select" className="text-sm text-slate-400">
                Sort by:
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
                className="text-sm font-semibold text-indigo-400 border border-slate-700 rounded-lg px-3 py-1.5 bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile filters (collapsed) */}
          <details className="lg:hidden mb-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            <summary className="px-5 py-3 text-sm font-semibold text-slate-200 cursor-pointer select-none list-none flex items-center justify-between">
              <span>Filters</span>
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div>
            <span className="font-bold text-indigo-400">MentorHub</span>
            <span className="ml-3">© {new Date().getFullYear()} MentorHub. All rights reserved.</span>
          </div>
          <nav className="flex gap-5">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Cookie Policy</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
