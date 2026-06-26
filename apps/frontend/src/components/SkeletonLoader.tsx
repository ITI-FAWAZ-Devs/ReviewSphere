export default function SkeletonLoader() {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 flex flex-col gap-4 animate-pulse">
      {/* Header: avatar + rating */}
      <div className="flex items-start justify-between">
        <div className="w-14 h-14 rounded-full bg-muted" />
        <div className="w-12 h-5 rounded-full bg-muted" />
      </div>

      {/* Name */}
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-2/3" />
        <div className="h-3 bg-rs-accent/10 rounded w-1/2" />
      </div>

      {/* Bio lines */}
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-5/6" />
        <div className="h-3 bg-muted rounded w-4/6" />
      </div>

      {/* Badges */}
      <div className="flex gap-2">
        <div className="h-5 w-14 bg-muted rounded-full" />
        <div className="h-5 w-16 bg-muted rounded-full" />
        <div className="h-5 w-12 bg-muted rounded-full" />
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Footer: price + button */}
      <div className="flex items-center justify-between">
        <div className="h-4 bg-muted rounded w-24" />
        <div className="h-9 bg-rs-accent/25 rounded-lg w-28" />
      </div>
    </div>
  );
}
