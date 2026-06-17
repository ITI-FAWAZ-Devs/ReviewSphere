import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let p = start; p <= end; p++) pages.push(p);

  if (current < total - 2) pages.push('...');
  pages.push(total);

  return pages;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(page: number) {
    if (page < 1 || page > totalPages) return;
    const next = new URLSearchParams(searchParams);
    next.set('page', String(page));
    setSearchParams(next, { replace: true });
  }

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1 mt-10 select-none"
    >
      {/* Previous */}
      <button
        id="pagination-prev"
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:border-indigo-500 hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page numbers */}
      {pages.map((p, idx) =>
        p === '...' ? (
          <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-slate-500 text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            id={`pagination-page-${p}`}
            onClick={() => goTo(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              p === currentPage
                ? 'bg-indigo-600 text-white shadow-sm border border-indigo-500'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-indigo-500 hover:text-indigo-400'
            }`}
          >
            {p}
          </button>
        ),
      )}

      {/* Next */}
      <button
        id="pagination-next"
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:border-indigo-500 hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
