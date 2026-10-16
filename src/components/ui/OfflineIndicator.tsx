import { useState, useEffect } from 'react'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowBanner(true)
      setTimeout(() => setShowBanner(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowBanner(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showBanner && isOnline) return null

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isOnline
          ? 'bg-success-soft translate-y-0'
          : 'bg-warning-soft translate-y-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2">
        <span className="text-lg">{isOnline ? '✅' : '⚠️'}</span>
        <span className="text-sm font-medium text-ink">
          {isOnline ? 'Back online' : 'You are offline. Some features may be limited.'}
        </span>
        {!isOnline && (
          <button
            onClick={() => setShowBanner(false)}
            className="ml-4 text-ink/80 hover:text-ink text-sm"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  )
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
