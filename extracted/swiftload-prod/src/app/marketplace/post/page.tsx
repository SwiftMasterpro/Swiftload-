'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { VEHICLE_TYPES, CARGO_TYPES, BW_CITIES, BWP_PER_KM, PLATFORM_FEE_PCT, VAT_RATE } from '@/lib/utils/constants'
import { fmtBWP } from '@/lib/utils/format'
import { toast } from 'sonner'

export default function PostLoadPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    title: '', description: '', category: 'general',
    cargo_type: '', weight_tons: '', volume_m3: '',
    pickup_address: '', pickup_city: '',
    dropoff_address: '', dropoff_city: '',
    vehicle_type: '',
    budget_min: '', budget_max: '',
    pickup_date: '', pickup_time: '', flexible_dates: false,
  })

  const set = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }))

  // Estimate price
  const ratePerKm  = BWP_PER_KM[form.vehicle_type] ?? 10
  const estKm      = 300
  const estPrice   = form.vehicle_type ? Math.round(ratePerKm * estKm) : 0
  const platformFee = Math.round(estPrice * PLATFORM_FEE_PCT)
  const vat         = Math.round((estPrice + platformFee) * VAT_RATE)
  const total       = estPrice + platformFee + vat

  const submit = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { toast.error('Sign in to post a load'); setLoading(false); return }

      const res = await fetch('/api/loads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          weight_tons: parseFloat(form.weight_tons),
          volume_m3:   form.volume_m3 ? parseFloat(form.volume_m3) : undefined,
          budget_min:  form.budget_min ? parseFloat(form.budget_min) : undefined,
          budget_max:  form.budget_max ? parseFloat(form.budget_max) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message ?? data.error ?? 'Failed to post load')
      toast.success('Load posted! Carriers will start bidding shortly.')
      router.push('/marketplace')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 } as React.CSSProperties
  const selStyle   = { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', color: '#fff', borderRadius: 9, padding: '11px 14px', fontSize: 13.5, fontFamily: 'inherit', width: '100%', outline: 'none' } as React.CSSProperties

  const STEPS = ['Cargo Details', 'Route', 'Vehicle & Budget']

  return (
    <div style={{ minHeight: '100vh', background: '#080E1A', padding: '32px 24px 64px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Link href="/marketplace" style={{ color: '#64748B', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
            ← Back to Marketplace
          </Link>
          <div className="t-eyebrow" style={{ marginBottom: 6 }}>Post a Load</div>
          <h1 className="t-h2">Find a truck in minutes</h1>
          <p className="t-body t-small" style={{ marginTop: 6 }}>Verified carriers will bid on your load. Accept and track live.</p>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, alignItems: 'center' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: i < STEPS.length - 1 ? '1' : 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: i < step - 1 ? '#10B981' : i === step - 1 ? '#F59E0B' : 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: i < step ? '#080E1A' : '#64748B' }}>
                  {i < step - 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: i === step - 1 ? '#F59E0B' : '#64748B', whiteSpace: 'nowrap' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: i < step - 1 ? '#10B981' : 'rgba(255,255,255,.08)' }} />}
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '32px 28px' }}>
          {/* Step 1 — Cargo */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={labelStyle}>Load title *</label>
                <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Building materials — Gaborone to Palapye" className="input-base" />
              </div>
              <div>
                <label style={labelStyle}>Cargo type *</label>
                <select value={form.cargo_type} onChange={e => set('cargo_type', e.target.value)} style={selStyle}>
                  <option value="">Select cargo type</option>
                  {CARGO_TYPES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Weight (tons) *</label>
                  <input value={form.weight_tons} onChange={e => set('weight_tons', e.target.value)} type="number" placeholder="e.g. 5" className="input-base" min="0.1" max="60" step="0.1" />
                </div>
                <div>
                  <label style={labelStyle}>Volume (m³) optional</label>
                  <input value={form.volume_m3} onChange={e => set('volume_m3', e.target.value)} type="number" placeholder="e.g. 20" className="input-base" min="0.1" step="0.1" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Description (optional)</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Special handling, fragile items, loading instructions…" className="input-base" rows={3} style={{ resize: 'vertical' }} />
              </div>
              <button onClick={() => { if (!form.title || !form.cargo_type || !form.weight_tons) { toast.error('Fill in required fields'); return } setStep(2) }} className="btn btn-amber btn-lg" style={{ justifyContent: 'center', marginTop: 4 }}>
                Continue to Route →
              </button>
            </div>
          )}

          {/* Step 2 — Route */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Pickup address *</label>
                  <input value={form.pickup_address} onChange={e => set('pickup_address', e.target.value)} placeholder="e.g. 123 Industrial Rd, Gaborone" className="input-base" />
                </div>
                <div>
                  <label style={labelStyle}>Pickup city *</label>
                  <select value={form.pickup_city} onChange={e => set('pickup_city', e.target.value)} style={selStyle}>
                    <option value="">Select city</option>
                    {BW_CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Dropoff address *</label>
                  <input value={form.dropoff_address} onChange={e => set('dropoff_address', e.target.value)} placeholder="e.g. 45 Main Ave, Francistown" className="input-base" />
                </div>
                <div>
                  <label style={labelStyle}>Dropoff city *</label>
                  <select value={form.dropoff_city} onChange={e => set('dropoff_city', e.target.value)} style={selStyle}>
                    <option value="">Select city</option>
                    {BW_CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Pickup date *</label>
                  <input value={form.pickup_date} onChange={e => set('pickup_date', e.target.value)} type="date" className="input-base" min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label style={labelStyle}>Preferred time</label>
                  <input value={form.pickup_time} onChange={e => set('pickup_time', e.target.value)} type="time" className="input-base" />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.flexible_dates} onChange={e => set('flexible_dates', e.target.checked)} style={{ accentColor: '#F59E0B' }} />
                <span style={{ fontSize: 13, color: '#94A3B8' }}>Flexible on pickup date (may attract more bids)</span>
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(1)} className="btn btn-ghost btn-lg">← Back</button>
                <button onClick={() => { if (!form.pickup_city || !form.dropoff_city || !form.pickup_address || !form.dropoff_address || !form.pickup_date) { toast.error('Fill in all route fields'); return } setStep(3) }} className="btn btn-amber btn-lg" style={{ flex: 1, justifyContent: 'center' }}>
                  Continue to Vehicle & Budget →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Vehicle & Budget */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={labelStyle}>Required vehicle type *</label>
                <select value={form.vehicle_type} onChange={e => set('vehicle_type', e.target.value)} style={selStyle}>
                  <option value="">Select vehicle type</option>
                  {VEHICLE_TYPES.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>

              {/* Price estimate */}
              {form.vehicle_type && (
                <div style={{ background: 'rgba(245,158,11,.07)', border: '1px solid rgba(245,158,11,.18)', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', letterSpacing: 2, marginBottom: 10 }}>ESTIMATED COST (est. 300km route)</div>
                  <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                    {[['Freight', fmtBWP(estPrice)], ['Platform fee (5%)', fmtBWP(platformFee)], ['VAT (14%)', fmtBWP(vat)], ['Total est.', fmtBWP(total)]].map(([l, v]) => (
                      <div key={l}>
                        <div style={{ fontSize: 10, color: '#64748B' }}>{l}</div>
                        <div style={{ fontWeight: 700, color: l === 'Total est.' ? '#F59E0B' : '#fff', fontSize: l === 'Total est.' ? 18 : 14 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Budget min (BWP)</label>
                  <input value={form.budget_min} onChange={e => set('budget_min', e.target.value)} type="number" placeholder="e.g. 2000" className="input-base" min="0" />
                </div>
                <div>
                  <label style={labelStyle}>Budget max (BWP)</label>
                  <input value={form.budget_max} onChange={e => set('budget_max', e.target.value)} type="number" placeholder="e.g. 5000" className="input-base" min="0" />
                </div>
              </div>

              <div style={{ background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.18)', borderRadius: 9, padding: '12px 14px', fontSize: 12, color: '#94A3B8', lineHeight: 1.7 }}>
                🔒 <strong style={{ color: '#10B981' }}>Escrow protected.</strong> Payment is held by Stripe and released only after you confirm delivery via WhatsApp OTP. Zero risk of non-delivery.
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(2)} className="btn btn-ghost btn-lg">← Back</button>
                <button onClick={submit} disabled={loading || !form.vehicle_type} className="btn btn-amber btn-lg" style={{ flex: 1, justifyContent: 'center' }}>
                  {loading ? <LoadingSpinner size={18} color="#080E1A" /> : '🚛 Post Load — Get Bids'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
