import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '@/lib/axios';

// ── Types ────────────────────────────────────────────────────────────────────

export interface MentorStack {
  id: string;
  name: string;
}

export interface MentorUser {
  id: string;
  email: string;
}

export interface Mentor {
  id: string;
  userId: string;
  stackId: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl: string | null;
  isVerified: boolean;
  isAvailableNow: boolean;
  averageRating: number;
  hourlyRate: number;
  createdAt: string;
  user: MentorUser;
  stack: MentorStack;
  sessions?: {
    id: string;
    rating: number;
    feedback: string | null;
    createdAt: string;
    student: {
      name: string;
      avatarUrl: string | null;
    };
  }[];
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export interface MentorFilters {
  stack?: string;
  sort_by?: 'rating' | 'price' | 'availability' | '';
  keyword?: string;
  page?: number;
  min_price?: number;
  max_price?: number;
  available?: boolean;
  top_rated?: boolean;
  verified?: boolean;
}

interface MentorApiResponse {
  data: Mentor[];
  pagination: Pagination;
}

// ── Custom useDebounce hook ──────────────────────────────────────────────────

function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

// ── useMentors hook ──────────────────────────────────────────────────────────

export function useMentors(filters: MentorFilters) {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce keyword 500 ms — other filters apply instantly
  const debouncedKeyword = useDebounce(filters.keyword ?? '', 500);

  // Abort controller ref so we can cancel in-flight requests on re-render
  const abortRef = useRef<AbortController | null>(null);

  const fetchMentors = useCallback(async () => {
    // Cancel previous request if still in flight
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    // Build clean params — omit empty/undefined values
    const params: Record<string, string | number> = {};
    if (filters.stack)              params.stack       = filters.stack;
    if (filters.sort_by)            params.sort_by     = filters.sort_by;
    if (debouncedKeyword)           params.keyword     = debouncedKeyword;
    if (filters.page)               params.page        = filters.page;
    if (filters.min_price != null)  params.min_price   = filters.min_price;
    if (filters.max_price != null)  params.max_price   = filters.max_price;
    if (filters.available)          params.available   = 'true';
    if (filters.top_rated)          params.top_rated   = 'true';
    if (filters.verified)           params.verified    = 'true';

    try {
      const { data } = await apiClient.get<MentorApiResponse>('/mentors', {
        params,
        signal: controller.signal,
      });
      setMentors(data.data);
      setPagination(data.pagination);
    } catch (err: unknown) {
      if ((err as { name?: string }).name === 'CanceledError') return; // aborted — ignore
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to load mentors. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [
    filters.stack,
    filters.sort_by,
    debouncedKeyword,
    filters.page,
    filters.min_price,
    filters.max_price,
    filters.available,
    filters.top_rated,
    filters.verified,
  ]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMentors();
    return () => abortRef.current?.abort();
  }, [fetchMentors]);

  return { mentors, pagination, loading, error };
}
