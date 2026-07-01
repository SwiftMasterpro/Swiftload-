'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/ui/Logo'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { TreeWatermark } from '@/components/ui/TreeWatermark'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#080E1A', display:'flex', alignItems:'center', justifyContent:'center', padding:24, position:'relative' }}>
      <TreeWatermark/>
      <div style={{ width:'100%', maxWidth:380, position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <Logo size={36} href="/"/>
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:28, marginTop:18, marginBottom:6 }}>
            {sent ? 'Check your email' : 'Reset password'}
          </h1>
        </div>
        <div className="card" style={{ padding:'28px' }}>
          {sent ? (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:48, marginBottom:16 }}>📧</div>
              <p style={{ color:'#64748B', fontSize:13.5, lineHeight:1.7, marginBottom:20 }}>
                We sent a reset link to <strong style={{ color:'#F59E0B' }}>{email}</strong>.<br/>Check your inbox (and spam).
              </p>
              <Link href="/auth/login" className="btn btn-amber btn-md" style={{ justifyContent:'center', display:'flex' }}>Back to Sign In</Link>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <p style={{ color:'#64748B', fontSize:13, marginBottom:4 }}>Enter your email and we'll send a reset link.</p>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'#94A3B8', display:'block', marginBottom:6 }}>Email address</label>
                <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@example.com" className="input-base" onKeyDown={e=>e.key==='Enter'&&handleReset()}/>
              </div>
              <button onClick={handleReset} disabled={loading||!email} className="btn btn-amber btn-lg" style={{ justifyContent:'center' }}>
                {loading?<LoadingSpinner size={18} color="#080E1A"/>:'Send Reset Link'}
              </button>
              <Link href="/auth/login" style={{ textAlign:'center', color:'#64748B', fontSize:12, textDecoration:'none' }}>← Back to sign in</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
