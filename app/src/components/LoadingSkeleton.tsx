import { Skeleton } from '@/components/ui/skeleton';

export function CryptoCardSkeleton() {
  return (
    <div className="p-5 rounded-xl bg-surface-container/60 border border-white/[0.04]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-8 w-28 mb-1" />
      <Skeleton className="h-3 w-20 mb-4" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export function MarketStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-4 sm:p-5 rounded-xl bg-surface-container/60 border border-white/[0.04]">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg" />
            <Skeleton className="h-3 w-16 sm:w-20" />
          </div>
          <Skeleton className="h-6 sm:h-8 w-20 sm:w-24" />
        </div>
      ))}
    </div>
  );
}

export function CoinDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-2xl" />
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      {/* Price */}
      <div>
        <Skeleton className="h-12 w-48 mb-2" />
        <Skeleton className="h-5 w-24" />
      </div>

      {/* Chart */}
      <Skeleton className="h-[300px] sm:h-[400px] w-full rounded-xl" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function WatchlistSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-surface-container/60 border border-white/[0.04]">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <Skeleton className="h-5 w-20 mb-1" />
              <Skeleton className="h-3 w-12 ml-auto" />
            </div>
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
