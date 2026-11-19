export default function Skeleton({className}: {className?: string}) {
  return (
    <div className={`relative overflow-hidden bg-ink/10 ${className ?? ""}`}>
      <div className="shimmer absolute inset-0 bg-gradient-to-r from-transparent via-paper-light/80 to-transparent" />
    </div>
  );
}
export function DeCardSkeleton() {
  return (
    <div className="sheet space-y-3 p-5 pl-8 shadow-paper">
      <div className="flex items-start justify-between">
        <Skeleton className="h-11 w-11" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-6 w-4/5" />
      <Skeleton className="h-4 w-3/5" />
      <Skeleton className="h-4 w-2/5" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}