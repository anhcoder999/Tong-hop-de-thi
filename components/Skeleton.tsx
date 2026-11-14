// Khối shimmer tái sử dụng được, class .skeleton định nghĩa trong globals.css
export default function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton ${className}`} />;
}
// Bộ xương giả lập đúng bố cục DeCard để loading không bị nhảy layout
export function DeCardSkeleton() {
  return (
    <div className="glass rounded-xl p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-5 w-full" />
      <Skeleton className="mt-2 h-5 w-3/4" />
      <Skeleton className="mt-3 h-4 w-28" />
      <Skeleton className="mt-4 h-10 w-full rounded-2xl" />
    </div>
  );
}