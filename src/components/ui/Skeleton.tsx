interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-slate-700/50 rounded ${className}`} />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="bg-[#1e1e3a]/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-5">
        <Skeleton className="w-6 h-6 rounded" />
        <Skeleton className="w-40 h-5" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7].map(i => (
          <div key={i} className="p-3 rounded-xl bg-slate-800/30">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-16 h-4" />
            </div>
            <Skeleton className="w-full h-2" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function DecisionPanelSkeleton() {
  return (
    <div className="bg-[#1e1e3a]/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="w-24 h-5" />
        </div>
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="p-3 rounded-xl bg-slate-800/30">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <Skeleton className="w-32 h-4 mb-2" />
                <Skeleton className="w-full h-3 mb-2" />
                <div className="flex gap-1">
                  <Skeleton className="w-12 h-4 rounded-full" />
                  <Skeleton className="w-12 h-4 rounded-full" />
                </div>
              </div>
              <Skeleton className="w-16 h-4" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="w-full h-12 mt-5 rounded-xl" />
    </div>
  )
}

export function GameBoardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a3e] to-[#0f0f23]">
      <div className="bg-[#12122a]/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Skeleton className="w-48 h-6" />
          <div className="flex items-center gap-4">
            <Skeleton className="w-24 h-8" />
            <Skeleton className="w-16 h-8" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 xl:col-span-3">
            <DashboardSkeleton />
          </div>
          <div className="lg:col-span-8 xl:col-span-9">
            <DecisionPanelSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}