interface EventNotificationProps {
  event: { title: string; description: string }
}

export function EventNotification({ event }: EventNotificationProps) {
  const isPositive = event.title.includes('Viral') || event.title.includes('Breakthrough') || event.title.includes('Press')
  const isNegative = event.title.includes('Poach') || event.title.includes('Crash') || event.title.includes('Churn')

  return (
    <div className="fixed top-4 right-4 z-40 animate-slide-in">
      <div className={`px-4 py-3 rounded-xl border backdrop-blur-2xl max-w-xs shadow-2xl ${
        isPositive
          ? 'bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/20'
          : isNegative
          ? 'bg-red-500/10 border-red-500/30 shadow-red-500/20'
          : 'bg-amber-500/10 border-amber-500/30 shadow-amber-500/20'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            isPositive ? 'bg-emerald-500/20' : isNegative ? 'bg-red-500/20' : 'bg-amber-500/20'
          }`}>
            <span className="text-xs">{isPositive ? '🎉' : isNegative ? '⚠️' : '📰'}</span>
          </div>
          <div>
            <div className="font-semibold text-white text-xs">{event.title}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{event.description}</div>
          </div>
        </div>
      </div>
    </div>
  )
}