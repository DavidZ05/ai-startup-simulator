interface EventNotificationProps {
  event: { title: string; description: string }
}

export function EventNotification({ event }: EventNotificationProps) {
  return (
    <div className="fixed top-4 right-4 z-40 animate-slide-in">
      <div className={`px-5 py-3 rounded-xl border shadow-xl backdrop-blur-xl max-w-sm ${
        event.title.includes('Viral') || event.title.includes('Breakthrough') || event.title.includes('Press')
          ? 'bg-emerald-500/15 border-emerald-500/30 shadow-emerald-500/20'
          : event.title.includes('Poach') || event.title.includes('Crash') || event.title.includes('Churn')
          ? 'bg-red-500/15 border-red-500/30 shadow-red-500/20'
          : 'bg-amber-500/15 border-amber-500/30 shadow-amber-500/20'
      }`}>
        <div className="font-semibold text-white text-sm">{event.title}</div>
        <div className="text-xs text-slate-300 mt-1">{event.description}</div>
      </div>
    </div>
  )
}