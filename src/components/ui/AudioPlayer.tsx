import { useState, useEffect, useRef, createContext, useContext, type ReactNode } from 'react'

interface AudioContextType {
  isPlaying: boolean
  volume: number
  toggle: () => void
  setVolume: (v: number) => void
}

const AudioCtx = createContext<AudioContextType | null>(null)

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem('bgm_volume')
    return saved ? parseFloat(saved) : 0.3
  })
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio('/audio/chill.wav')
    audio.loop = true
    audio.volume = volume
    audio.preload = 'auto'
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
      localStorage.setItem('bgm_volume', String(volume))
    }
  }, [volume])

  const toggle = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(() => {})
    }
    setIsPlaying(!isPlaying)
  }

  const setVolume = (v: number) => {
    setVolumeState(Math.max(0, Math.min(1, v)))
  }

  return (
    <AudioCtx.Provider value={{ isPlaying, volume, toggle, setVolume }}>
      {children}
    </AudioCtx.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioCtx)
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider')
  }
  return context
}

export function AudioControls() {
  const { isPlaying, volume, toggle, setVolume } = useAudio()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-[#12122a]/90 backdrop-blur-xl rounded-xl border border-white/10 p-2 shadow-2xl">
      <button
        onClick={toggle}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        title={isPlaying ? 'Pause music' : 'Play music'}
      >
        {isPlaying ? (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>
      <div className="flex items-center gap-1">
        <input
          type="range"
          min="0"
          max="100"
          value={volume * 100}
          onChange={(e) => setVolume(parseInt(e.target.value) / 100)}
          className="w-16 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:rounded-full"
        />
      </div>
    </div>
  )
}
