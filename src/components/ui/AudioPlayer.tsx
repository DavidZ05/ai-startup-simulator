import { useState, useEffect, useRef, createContext, useContext, type ReactNode } from 'react'

interface AudioContextType {
  isPlaying: boolean
  volume: number
  toggle: () => void
  setVolume: (v: number) => void
}

const AudioContext = createContext<AudioContextType | null>(null)

class AmbientBGM {
  private ctx: globalThis.AudioContext | null = null
  private gainNode: GainNode | null = null
  private oscillators: OscillatorNode[] = []
  private isPlaying = false
  private loopInterval: ReturnType<typeof setInterval> | null = null

  start(volume: number = 0.15) {
    if (this.isPlaying) return

    this.ctx = new globalThis.AudioContext()
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    this.gainNode = this.ctx.createGain()
    this.gainNode.gain.value = volume
    this.gainNode.connect(this.ctx.destination)

    const notes = [261.63, 329.63, 392.00, 523.25]
    const now = this.ctx.currentTime

    notes.forEach((freq, i) => {
      if (!this.ctx || !this.gainNode) return
      const osc = this.ctx.createOscillator()
      const oscGain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.value = freq

      oscGain.gain.setValueAtTime(0, now)
      oscGain.gain.linearRampToValueAtTime(0.15, now + 2 + i * 0.5)
      oscGain.gain.linearRampToValueAtTime(0.1, now + 8 + i * 0.5)
      oscGain.gain.linearRampToValueAtTime(0, now + 16)

      osc.connect(oscGain)
      oscGain.connect(this.gainNode)

      osc.start(now + i * 0.3)
      osc.stop(now + 16)

      this.oscillators.push(osc)
    })

    this.isPlaying = true

    this.loopInterval = setInterval(() => {
      if (!this.isPlaying || !this.ctx) {
        if (this.loopInterval) clearInterval(this.loopInterval)
        return
      }
      this.playLoop()
    }, 14000)
  }

  private playLoop() {
    if (!this.ctx || !this.gainNode) return

    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]
    const now = this.ctx.currentTime

    for (let i = 0; i < 4; i++) {
      if (!this.ctx || !this.gainNode) return
      const osc = this.ctx.createOscillator()
      const oscGain = this.ctx.createGain()
      const freq = notes[Math.floor(Math.random() * notes.length)]

      osc.type = 'sine'
      osc.frequency.value = freq * (Math.random() > 0.5 ? 0.5 : 1)

      oscGain.gain.setValueAtTime(0, now + i * 3)
      oscGain.gain.linearRampToValueAtTime(0.12, now + i * 3 + 0.5)
      oscGain.gain.linearRampToValueAtTime(0, now + i * 3 + 2.5)

      osc.connect(oscGain)
      oscGain.connect(this.gainNode)

      osc.start(now + i * 3)
      osc.stop(now + i * 3 + 3)

      this.oscillators.push(osc)
    }
  }

  stop() {
    this.isPlaying = false
    if (this.loopInterval) {
      clearInterval(this.loopInterval)
      this.loopInterval = null
    }
    this.oscillators.forEach(osc => {
      try { osc.stop() } catch {}
    })
    this.oscillators = []
    if (this.ctx) {
      this.ctx.close()
      this.ctx = null
    }
    this.gainNode = null
  }

  setVolume(v: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = v
    }
  }
}

const bgm = new AmbientBGM()

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem('bgm_volume')
    return saved ? parseFloat(saved) : 0.25
  })

  useEffect(() => {
    return () => {
      bgm.stop()
    }
  }, [])

  useEffect(() => {
    bgm.setVolume(volume)
    localStorage.setItem('bgm_volume', String(volume))
  }, [volume])

  const toggle = () => {
    if (isPlaying) {
      bgm.stop()
    } else {
      bgm.start(volume)
    }
    setIsPlaying(!isPlaying)
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
