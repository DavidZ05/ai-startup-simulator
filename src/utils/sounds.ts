class SoundManager {
  private audioContext: AudioContext | null = null

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext()
    }
    return this.audioContext
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
    try {
      const ctx = this.getContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = frequency
      oscillator.type = type

      gainNode.gain.setValueAtTime(volume, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration)
    } catch {}
  }

  click() {
    this.playTone(800, 0.05, 'sine', 0.08)
  }

  select() {
    this.playTone(600, 0.08, 'sine', 0.06)
    setTimeout(() => this.playTone(800, 0.08, 'sine', 0.06), 50)
  }

  confirm() {
    this.playTone(523, 0.1, 'sine', 0.08)
    setTimeout(() => this.playTone(659, 0.1, 'sine', 0.08), 80)
    setTimeout(() => this.playTone(784, 0.15, 'sine', 0.08), 160)
  }

  success() {
    this.playTone(523, 0.12, 'sine', 0.1)
    setTimeout(() => this.playTone(659, 0.12, 'sine', 0.1), 100)
    setTimeout(() => this.playTone(784, 0.12, 'sine', 0.1), 200)
    setTimeout(() => this.playTone(1047, 0.2, 'sine', 0.1), 300)
  }

  error() {
    this.playTone(200, 0.15, 'square', 0.06)
    setTimeout(() => this.playTone(150, 0.2, 'square', 0.06), 100)
  }

  event() {
    this.playTone(440, 0.08, 'triangle', 0.07)
    setTimeout(() => this.playTone(554, 0.08, 'triangle', 0.07), 60)
  }

  achievement() {
    const notes = [523, 659, 784, 1047, 784, 1047]
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.12, 'sine', 0.08), i * 80)
    })
  }

  levelUp() {
    this.playTone(440, 0.1, 'sine', 0.08)
    setTimeout(() => this.playTone(554, 0.1, 'sine', 0.08), 80)
    setTimeout(() => this.playTone(659, 0.1, 'sine', 0.08), 160)
    setTimeout(() => this.playTone(880, 0.2, 'sine', 0.1), 240)
  }

  coin() {
    this.playTone(988, 0.06, 'sine', 0.07)
    setTimeout(() => this.playTone(1319, 0.1, 'sine', 0.07), 50)
  }

  notification() {
    this.playTone(880, 0.08, 'sine', 0.06)
    setTimeout(() => this.playTone(1100, 0.12, 'sine', 0.06), 80)
  }
}

export const sounds = new SoundManager()
