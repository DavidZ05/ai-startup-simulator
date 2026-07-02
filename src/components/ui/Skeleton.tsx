interface SkeletonProps {
  className?: string
  variant?: 'default' | 'circular' | 'rectangular'
}

export function Skeleton({ className = '', variant = 'default' }: SkeletonProps) {
  const baseClass = 'animate-pulse bg-slate-700/50'
  const variantClass = variant === 'circular' ? 'rounded-full' : variant === 'rectangular' ? 'rounded-none' : 'rounded'
  return (
    <div className={`${baseClass} ${variantClass} ${className}`} />
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

export function TechTreeSkeleton() {
  return (
    <div className="bg-[#1e1e3a]/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 shadow-xl">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="w-5 h-5 rounded" />
        <Skeleton className="w-20 h-4" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="p-2 rounded-lg bg-slate-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="w-24 h-3" />
              </div>
              <Skeleton className="w-12 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AchievementsSkeleton() {
  return (
    <div className="bg-[#1e1e3a]/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="w-24 h-4" />
        </div>
        <Skeleton className="w-8 h-3" />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
          <Skeleton key={i} className="w-full h-10 rounded-lg" />
        ))}
      </div>
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
          <div className="lg:col-span-3 space-y-4">
            <DashboardSkeleton />
            <AchievementsSkeleton />
          </div>
          <div className="lg:col-span-6">
            <DecisionPanelSkeleton />
          </div>
          <div className="lg:col-span-3">
            <TechTreeSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}

export function LoginSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f23] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
          <Skeleton className="w-48 h-8 mx-auto mb-2" />
          <Skeleton className="w-64 h-4 mx-auto" />
        </div>
        <div className="bg-[#1e1e3a]/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
          <Skeleton className="w-full h-12 mb-4 rounded-xl" />
          <Skeleton className="w-full h-12 mb-4 rounded-xl" />
          <Skeleton className="w-full h-12 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function GameSelectorSkeleton() {
  return (
    <div className="min-h-screen bg-[#0f0f23] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="w-48 h-8" />
          <Skeleton className="w-32 h-10 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#1e1e3a]/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5">
              <Skeleton className="w-32 h-6 mb-3" />
              <Skeleton className="w-24 h-4 mb-4" />
              <div className="flex gap-2">
                <Skeleton className="w-20 h-8 rounded-lg" />
                <Skeleton className="w-20 h-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}