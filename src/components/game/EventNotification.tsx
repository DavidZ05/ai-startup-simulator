interface EventNotificationProps {
  event: { title: string; description: string }
}

export function EventNotification({ event }: EventNotificationProps) {
  const isPositive = event.title.includes('Viral') || event.title.includes('Breakthrough') || event.title.includes('Press')
  const isNegative = event.title.includes('Poach') || event.title.includes('Crash') || event.title.includes('Churn')

  return (
    <div className="fixed top-4 right-4 z-40 animate-slide-in">
      <div className={`px-4 py-3 rounded-xl border  max-w-xs  ${
        isPositive
          ? 'bg-success-soft border-success-soft '
          : isNegative
          ? 'bg-danger-soft border-danger-soft '
          : 'bg-warning-soft border-warning-soft '
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            isPositive ? 'bg-success-soft' : isNegative ? 'bg-danger-soft' : 'bg-warning-soft'
          }`}>
            <span className="text-xs">{isPositive ? '🎉' : isNegative ? '⚠️' : '📰'}</span>
          </div>
          <div>
            <div className="font-semibold text-ink text-xs">{event.title}</div>
            <div className="text-xs text-muted mt-0.5">{event.description}</div>
          </div>
        </div>
      </div>
    </div>
  )
}