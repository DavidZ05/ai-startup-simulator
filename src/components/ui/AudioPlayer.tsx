import { useState, useEffect, useRef, createContext, useContext, type ReactNode } from 'react'

interface AudioContextType {
  isPlaying: boolean
  volume: number
  toggle: () => void
  setVolume: (v: number) => void
}

const AudioContext = createContext<AudioContextType | null>(null)

function createBGMBuffer(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const duration = 8
  const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate)

  const chordProgressions = [
    [261.63, 329.63, 392.00],
    [293.66, 369.99, 440.00],
    [329.63, 415.30, 493.88],
    [349.23, 440.00, 523.25],
  ]

  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel)

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const chordIndex = Math.floor((t / duration) * chordProgressions.length) % chordProgressions.length
      const chord = chordProgressions[chordIndex]

      let sample = 0
      for (const freq of chord) {
        sample += Math.sin(2 * Math.PI * freq * t) * 0.08
        sample += Math.sin(2 * Math.PI * freq * 0.5 * t) * 0.04
      }

      const melodyFreqs = [523.25, 587.33, 659.26, 698.46, 783.99]
      const melodyIndex = Math.floor(t * 2) % melodyFreqs.length
      const melodyEnv = Math.max(0, 1 - ((t * 2) % 1) * 2)
      sample += Math.sin(2 * Math.PI * melodyFreqs[melodyIndex] * t) * 0.05 * melodyEnv

      const fadeIn = Math.min(1, t / 0.5)
      const fadeOut = Math.min(1, (duration - t) / 0.5)
      sample *= fadeIn * fadeOut

      data[i] = sample * 0.6
    }
  }

  return buffer
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem('bgm_volume')
    return saved ? parseFloat(saved) : 0.3
  })
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioCtxRef = useRef<globalThis.AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  const startBGM = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new globalThis.AudioContext()
      }
      const ctx = audioCtxRef.current

      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      if (!gainRef.current) {
        gainRef.current = ctx.createGain()
        gainRef.current.gain.value = volume
        gainRef.current.connect(ctx.destination)
      }

      const buffer = createBGMBuffer(ctx)
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true
      source.connect(gainRef.current)
      source.start()

      sourceRef.current = source
      setIsPlaying(true)
    } catch (e) {
      console.error('BGM error:', e)
    }
  }

  const stopBGM = () => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop()
      } catch {}
      sourceRef.current = null
    }
    setIsPlaying(false)
  }

  useEffect(() => {
    return () => {
      stopBGM()
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = volume
    }
    localStorage.setItem('bgm_volume', String(volume))
  }, [volume])

  const toggle = () => {
    if (isPlaying) {
      stopBGM()
    } else {
      startBGM()
    }
  }

  const setVolume = (v: number) => {
    setVolumeState(Math.max(0, Math.min(1, v)))
  }

  return (
    <AudioContext.Provider value={{ isPlaying, volume, toggle, setVolume }}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
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
