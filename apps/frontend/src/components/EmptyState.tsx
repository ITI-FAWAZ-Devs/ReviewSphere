import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({
  message = 'No mentors found for your search.',
}: EmptyStateProps) {
  return (
    <div className="col-span-3 flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
        <SearchX className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-1">No results</h3>
      <p className="text-sm text-slate-400 max-w-xs">{message}</p>
    </div>
  );
}
