'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/ui/Logo'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { TreeWatermark } from '@/components/ui/TreeWatermark'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [tab, setTab] = useState<'email' | 'phone'>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const signInEmail = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Welcome back!')
    router.push('/dashboard')
  }

  const sendOTP = async () => {
    setLoading(true)
    const e164 = phone.startsWith('+') ? phone : `+267${phone.replace(/^0/, '')}`
    const { error } = await supabase.auth.signInWithOtp({ phone: e164 })
    if (error) { toast.error(error.message); setLoading(false); return }
    setOtpSent(true)
    toast.success('OTP sent to your WhatsApp')
    setLoading(false)
  }

  const verifyOTP = async () => {
    setLoading(true)
    const e164 = phone.startsWith('+') ? phone : `+267${phone.replace(/^0/, '')}`
    const { error } = await supabase.auth.verifyOtp({ phone: e164, token: otp, type: 'sms' })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Welcome back!')
    router.push('/dashboard')
  }

  const signInGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } })
    if (error) toast.error(error.message)
  }

  const signInApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: `${window.location.origin}/auth/callback` } })
    if (error) toast.error(error.message)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
      <TreeWatermark />
      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Logo size={36} href="/" />
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 28, marginTop: 20, marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ color: '#64748B', fontSize: 13 }}>Sign in to your SwiftLoad account</p>
        </div>

        <div className="card" style={{ padding: '28px 28px' }}>
          {/* Social buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            <button onClick={signInGoogle} className="btn btn-ghost btn-md" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>
              🔍 Google
            </button>
            <button onClick={signInApple} className="btn btn-ghost btn-md" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>
              🍎 Apple
            </button>
          </div>

          <div style={{ position: 'relative', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="hl" style={{ flex: 1 }} />
            <span style={{ color: '#64748B', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>OR</span>
            <div className="hl" style={{ flex: 1 }} />
          </div>

          {/* Method tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,.04)', borderRadius: 9, padding: 3 }}>
            {(['email', 'phone'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px', borderRadius: 7, border: 'none', background: tab === t ? '#0E1825' : 'transparent', color: tab === t ? '#fff' : '#64748B', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 180ms', textTransform: 'capitalize' }}>
                {t === 'email' ? '📧 Email' : '📱 Phone OTP'}
              </button>
            ))}
          </div>

          {tab === 'email' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Email address</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" className="input-base" onKeyDown={e => e.key === 'Enter' && signInEmail()} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>Password</label>
                  <Link href="/auth/reset-password" style={{ fontSize: 11, color: '#F59E0B', textDecoration: 'none' }}>Forgot?</Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <input value={password} onChange={e => setPassword(e.target.value)} type={showPass ? 'text' : 'password'} placeholder="••••••••" className="input-base" style={{ paddingRight: 40 }} onKeyDown={e => e.key === 'Enter' && signInEmail()} />
                  <button onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 14 }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <button onClick={signInEmail} disabled={loading || !email || !password} className="btn btn-amber btn-lg" style={{ justifyContent: 'center', marginTop: 4 }}>
                {loading ? <LoadingSpinner size={18} color="#080E1A" /> : 'Sign In'}
              </button>
            </div>
          )}

          {tab === 'phone' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Botswana mobile number</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div className="input-base" style={{ width: 64, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: 13 }}>🇧🇼</div>
                  <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="7x xxx xxx" className="input-base" disabled={otpSent} />
                </div>
              </div>
              {!otpSent ? (
                <button onClick={sendOTP} disabled={loading || phone.length < 7} className="btn btn-amber btn-lg" style={{ justifyContent: 'center' }}>
                  {loading ? <LoadingSpinner size={18} color="#080E1A" /> : 'Send OTP via WhatsApp'}
                </button>
              ) : (
                <>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 }}>6-digit OTP from WhatsApp</label>
                    <input value={otp} onChange={e => setOtp(e.target.value)} type="text" placeholder="000000" className="input-base" maxLength={6} style={{ letterSpacing: 8, fontSize: 20, textAlign: 'center' }} onKeyDown={e => e.key === 'Enter' && verifyOTP()} />
                  </div>
                  <button onClick={verifyOTP} disabled={loading || otp.length < 6} className="btn btn-amber btn-lg" style={{ justifyContent: 'center' }}>
                    {loading ? <LoadingSpinner size={18} color="#080E1A" /> : 'Verify & Sign In'}
                  </button>
                  <button onClick={() => { setOtpSent(false); setOtp('') }} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                    ← Change number
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#64748B', fontSize: 13 }}>
          No account yet?{' '}
          <Link href="/auth/register" style={{ color: '#F59E0B', fontWeight: 700, textDecoration: 'none' }}>Create one free</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 10 }}>
          <Link href="/" style={{ color: '#64748B', fontSize: 12, textDecoration: 'none' }}>← Back to SwiftLoad</Link>
        </p>
      </div>
    </div>
  )
}
