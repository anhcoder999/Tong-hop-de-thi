export default function Skeleton({className}: {className?: string}) {
  return (
    <div className={`relative overflow-hidden rounded-field bg-ink/[0.08] ${className ?? ""}`}>
      <div className="shimmer absolute inset-0 bg-gradient-to-r from-transparent via-mark/25 to-transparent" />
    </div>
  );
}
export function DeCardSkeleton() {
  return (
    <div className="rounded-card border-2 border-ink/12 bg-paper-light p-5">
      <div className="flex items-start justify-between">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="mt-4 h-5 w-4/5" />
      <Skeleton className="mt-2 h-5 w-2/5" />
      <Skeleton className="mt-4 h-4 w-3/5" />
      <Skeleton className="mt-5 h-11 w-full" />
    </div>
  );
}