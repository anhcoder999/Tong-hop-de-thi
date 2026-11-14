export default function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton ${className}`} />;
}
export function DeCardSkeleton() {
  return (
    <div className="sheet p-5 pl-8 shadow-paper">
      <div className="flex items-start justify-between">
        <Skeleton className="h-11 w-11" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="mt-4 h-5 w-full" />
      <Skeleton className="mt-2 h-5 w-3/4" />
      <Skeleton className="mt-3 h-3 w-24" />
      <Skeleton className="mt-4 h-10 w-full" />
    </div>
  );
}