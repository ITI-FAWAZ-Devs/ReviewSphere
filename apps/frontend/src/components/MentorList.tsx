import type { Mentor } from '@/hooks/useMentors';
import MentorCard from './MentorCard';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';

interface MentorListProps {
  mentors: Mentor[];
  loading: boolean;
  error: string | null;
}

const SKELETON_COUNT = 6;

export default function MentorList({ mentors, loading, error }: MentorListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <SkeletonLoader key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <div className="col-span-3 flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-200 mb-1">Something went wrong</h3>
          <p className="text-sm text-slate-400 max-w-xs">{error}</p>
        </div>
      </div>
    );
  }

  if (mentors.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <EmptyState message="No mentors found for your search. Try adjusting your filters." />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {mentors.map((mentor) => (
        <MentorCard key={mentor.id} mentor={mentor} />
      ))}
    </div>
  );
}
