import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export function LoginForm() {
  const { login, register } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        await register(username, password)
      } else {
        await login(username, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="entrance">
      <section className="entrance-story">
        <div className="brand"><span className="brand-mark" aria-hidden="true">↗</span> AI Startup Simulator</div>
        <div>
          <div className="eyebrow">The founder’s workbench</div>
          <h1>Small beginnings.<br />Big decisions.</h1>
          <p>Build your company one month at a time. Find your market, grow your team, and make every decision count.</p>
        </div>
        <div className="entrance-foot"><span>TURN-BASED BUSINESS SIMULATION</span><span>From seed to success ↗</span></div>
      </section>
      <section className="entrance-form">
        <div className="eyebrow">Your next chapter</div>
        <h2>{isRegister ? 'Become a founder.' : 'Back to business.'}</h2>
        <p className="text-sm text-muted">{isRegister ? 'Create an account to begin your startup journey.' : 'Sign in to pick up where you left off.'}</p>
        <form onSubmit={handleSubmit}>
          <div className="field"><label htmlFor="username">Username</label><input id="username" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Your founder name" minLength={3} required /></div>
          <div className="field"><label htmlFor="password">Password</label><input id="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} required /></div>
          {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}
          <button type="submit" className="primary" disabled={loading}>{loading ? 'Please wait…' : isRegister ? 'Create your account ↗' : 'Enter your workspace ↗'}</button>
        </form>
        <div className="form-switch">{isRegister ? 'Already a founder? ' : 'New here? '}<button onClick={() => { setIsRegister(!isRegister); setError('') }}>{isRegister ? 'Sign in' : 'Create an account'}</button></div>
        <p className="form-note">Your company. Your decisions. Your progress, saved.</p>
      </section>
    </main>
  )
}
