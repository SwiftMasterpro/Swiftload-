'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/ui/Logo'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { TreeWatermark } from '@/components/ui/TreeWatermark'
import { toast } from 'sonner'
import type { UserRole } from '@/types'

const ROLES: { id: UserRole; label: string; icon: string; desc: string }[] = [
  { id: 'customer',    label: 'Shipper / Customer',  icon: '📦', desc: 'Post loads, track deliveries, pay via escrow' },
  { id: 'driver',      label: 'Freelance Driver',     icon: '🚛', desc: 'Find loads, get paid same day, build reputation' },
  { id: 'business',    label: 'Business Account',     icon: '🏢', desc: 'Fleet management, team access, analytics' },
  { id: 'fleet_owner', label: 'Fleet Owner',          icon: '🚚', desc: 'Manage multiple vehicles and drivers' },
]

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const defaultRole = (searchParams.get('role') as UserRole) || 'customer'
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<UserRole>(defaultRole)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [terms, setTerms] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return }
    if (!terms) { toast.error('Please accept the terms'); return }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role, phone: phone ? `+267${phone.replace(/^0/,'')}` : null, company_name: companyName || null },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      if (data.user) {
        await supabase.from('profiles').upsert({
          user_id: data.user.id, role, full_name: fullName, email,
          phone: phone ? `+267${phone.replace(/^0/, '')}` : null,
          company_name: companyName || null, country: 'BW', verified: false, active: true, rating: 0, rating_count: 0,
        })
      }
      toast.success('Account created! Check your email to verify.')
      setStep(3)
    } catch (err: any) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const needsCompany = ['business', 'fleet_owner'].includes(role)

  return (
    <div style={{ minHeight: '100vh', background: '#080E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
      <TreeWatermark />
      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Logo size={36} href="/" />
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 28, marginTop: 18, marginBottom: 6 }}>
            {step === 1 ? 'Choose your role' : step === 2 ? 'Create your account' : 'Account created! 🎉'}
          </h1>
          <p style={{ color: '#64748B', fontSize: 13 }}>
            {step === 1 ? 'How will you use SwiftLoad?' : step === 2 ? 'Fill in your details to get started' : 'Check your email to verify and start using SwiftLoad'}
          </p>
        </div>

        {/* Step indicator */}
        {step < 3 && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ height: 4, width: s === step ? 28 : 18, borderRadius: 2, background: s <= step ? '#F59E0B' : 'rgba(255,255,255,.12)', transition: 'all 260ms ease' }} />
            ))}
          </div>
        )}

        <div className="card" style={{ padding: '28px 28px' }}>
          {/* Step 1: Role */}
          {step === 1 && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {ROLES.map(r => (
                  <button key={r.id} onClick={() => setRole(r.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 10, border: role === r.id ? '1px solid #F59E0B' : '1px solid rgba(255,255,255,.08)', background: role === r.id ? 'rgba(245,158,11,.07)' : 'rgba(255,255,255,.02)', cursor: 'pointer', textAlign: 'left', transition: 'all 180ms ease', fontFamily: 'inherit' }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{r.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: role === r.id ? '#F59E0B' : '#fff', marginBottom: 2 }}>{r.label}</div>
                      <div style={{ fontSize: 11.5, color: '#64748B', lineHeight: 1.4 }}>{r.desc}</div>
                    </div>
                    {role === r.id && <span style={{ color: '#F59E0B', fontSize: 16 }}>✓</span>}
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(2)} className="btn btn-amber btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                Continue as {ROLES.find(r => r.id === role)?.label} →
              </button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: needsCompany ? '1fr' : '1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Full name *</label>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Thabo Molefe" className="input-base" />
                </div>
                {needsCompany && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Company name *</label>
                    <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Molefe Transport (Pty) Ltd" className="input-base" />
                  </div>
                )}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Email address *</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" className="input-base" />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Botswana mobile (optional)</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div className="input-base" style={{ width: 52, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: 13 }}>🇧🇼</div>
                    <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="7x xxx xxx" className="input-base" />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input value={password} onChange={e => setPassword(e.target.value)} type={showPass ? 'text' : 'password'} placeholder="Min 8 chars, 1 uppercase, 1 number" className="input-base" style={{ paddingRight: 40 }} />
                    <button onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 14 }}>
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Confirm password *</label>
                  <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type="password" placeholder="Re-enter password" className="input-base" onKeyDown={e => e.key === 'Enter' && handleRegister()} />
                </div>
              </div>

              {/* Terms */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} style={{ marginTop: 3, accentColor: '#F59E0B', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
                  I agree to the <a href="/terms" style={{ color: '#F59E0B' }}>Terms of Service</a> and <a href="/privacy" style={{ color: '#F59E0B' }}>Privacy Policy</a>, and confirm I am 18 or older.
                </span>
              </label>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(1)} className="btn btn-ghost btn-lg" style={{ flex: '0 0 auto' }}>← Back</button>
                <button onClick={handleRegister} disabled={loading || !email || !password || !fullName || !terms} className="btn btn-amber btn-lg" style={{ flex: 1, justifyContent: 'center' }}>
                  {loading ? <LoadingSpinner size={18} color="#080E1A" /> : 'Create Account'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 20 }}>📧</div>
              <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}>Check your email</h3>
              <p style={{ color: '#64748B', fontSize: 13.5, lineHeight: 1.7, marginBottom: 24 }}>
                We sent a verification link to <strong style={{ color: '#F59E0B' }}>{email}</strong>.<br/>
                Click the link to activate your account.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link href="/auth/login" className="btn btn-amber btn-lg" style={{ justifyContent: 'center' }}>Go to Sign In</Link>
                <Link href="/" className="btn btn-ghost btn-md" style={{ justifyContent: 'center', color: '#64748B' }}>Back to Home</Link>
              </div>
              <p style={{ fontSize: 11, color: '#64748B', marginTop: 16 }}>Didn't receive it? Check spam or contact Prontswift@proton.me</p>
            </div>
          )}
        </div>

        {step < 3 && (
          <p style={{ textAlign: 'center', marginTop: 20, color: '#64748B', fontSize: 13 }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#F59E0B', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </p>
        )}
      </div>
    </div>
  )
}
