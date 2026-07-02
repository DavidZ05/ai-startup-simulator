import { useCallback } from 'react'
import { useOnlineStatus } from '../components/ui/OfflineIndicator'

const STORAGE_PREFIX = 'startup_sim_'

export function useOfflineStorage() {
  const isOnline = useOnlineStatus()

  const saveToLocal = useCallback((key: string, data: unknown) => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Failed to save to local storage:', error)
      return false
    }
  }, [])

  const loadFromLocal = useCallback((key: string) => {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}${key}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to load from local storage:', error)
      return null
    }
  }, [])

  const removeFromLocal = useCallback((key: string) => {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`)
      return true
    } catch (error) {
      console.error('Failed to remove from local storage:', error)
      return false
    }
  }, [])

  const saveGameOffline = useCallback((gameId: number, data: unknown) => {
    return saveToLocal(`game_${gameId}`, data)
  }, [saveToLocal])

  const loadGameOffline = useCallback((gameId: number) => {
    return loadFromLocal(`game_${gameId}`)
  }, [loadFromLocal])

  const getOfflineGames = useCallback(() => {
    const games: Array<{ id: number; data: unknown }> = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(`${STORAGE_PREFIX}game_`)) {
        const gameId = parseInt(key.replace(`${STORAGE_PREFIX}game_`, ''), 10)
        if (!isNaN(gameId)) {
          const data = loadFromLocal(`game_${gameId}`)
          if (data) games.push({ id: gameId, data })
        }
      }
    }
    return games
  }, [loadFromLocal])

  return {
    isOnline,
    saveToLocal,
    loadFromLocal,
    removeFromLocal,
    saveGameOffline,
    loadGameOffline,
    getOfflineGames,
  }
}
