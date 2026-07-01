'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormShell, Field, FormInput, FormSelect, FormTextarea, RadioGroup, Checkbox, StepBar, SectionDivider, GoogleFormButton } from '@/components/forms/FormPrimitives'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { CARGO_TYPES, VEHICLE_TYPES, BW_CITIES, BWP_PER_KM } from '@/lib/utils/constants'
import { fmtBWP } from '@/lib/utils/format'
import { toast } from 'sonner'

const STEPS = ['Your Details', 'Shipment Info', 'Vehicle & Dates', 'Confirm']
const CITIES = BW_CITIES.concat(['Johannesburg, RSA', 'Windhoek, NAM', 'Lusaka, ZAM', 'Harare, ZIM'])

type FormState = {
  full_name: string; email: string; phone: string; company: string
  pickup_city: string; dropoff_city: string; cargo_type: string; weight_tons: string
  vehicle_type: string; pickup_date: string; flexible_dates: boolean; budget_max: string; notes: string
  agree_contact: boolean
}

const INIT: FormState = {
  full_name: '', email: '', phone: '', company: '',
  pickup_city: '', dropoff_city: '', cargo_type: '', weight_tons: '',
  vehicle_type: '', pickup_date: '', flexible_dates: false, budget_max: '', notes: '',
  agree_contact: false,
}

export default function LoadQuotePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(INIT)
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [loading, setLoading] = useState(false)

  const s = (k: keyof FormState, v: any) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  // Price estimate
  const rate = BWP_PER_KM[form.vehicle_type] ?? 0
  const estimateByRoute: Record<string, number> = {
    'Gaborone-Francistown': 436,
    'Gaborone-Maun': 697,
    'Gaborone-Kasane': 934,
  }
  const estKm = estimateByRoute[`${form.pickup_city}-${form.dropoff_city}`] ?? 300
  const estPrice = rate > 0 ? Math.round(rate * estKm) : 0

  const validate = (s: number): boolean => {
    const e: Partial<FormState> = {}
    if (s === 0) {
      if (!form.full_name.trim())  e.full_name = 'Name required'
      if (!form.email.includes('@')) e.email = 'Valid email required'
    }
    if (s === 1) {
      if (!form.pickup_city)  e.pickup_city  = 'Select pickup city'
      if (!form.dropoff_city) e.dropoff_city = 'Select dropoff city'
      if (!form.cargo_type)   e.cargo_type   = 'Select cargo type'
      if (!form.weight_tons || parseFloat(form.weight_tons) <= 0) e.weight_tons = 'Enter weight'
    }
    if (s === 2) {
      if (!form.vehicle_type) e.vehicle_type = 'Select vehicle type'
      if (!form.pickup_date)  e.pickup_date  = 'Select pickup date'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validate(step)) setStep(s => s + 1) }
  const back = () => setStep(s => s - 1)

  const submit = async () => {
    if (!form.agree_contact) { toast.error('Please confirm you agree to be contacted'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_key: 'load-quote', ...form, weight_tons: parseFloat(form.weight_tons), budget_max: form.budget_max ? parseFloat(form.budget_max) : null }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Submission failed') }
      router.push('/forms/success?type=load-quote')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormShell
      title="Get a Load Quote"
      subtitle="Tell us about your freight — verified carriers will respond within 2 hours with competitive bids."
      icon="📦">

      <StepBar current={step} total={STEPS.length} labels={STEPS} />

      <div className="card" style={{ padding: '28px 28px' }}>
        {/* ── Step 0: Your Details ── */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Full name" required>
                <FormInput value={form.full_name} onChange={e => s('full_name', e.target.value)} placeholder="Thabo Molefe" error={errors.full_name as string} />
              </Field>
              <Field label="Email address" required>
                <FormInput type="email" value={form.email} onChange={e => s('email', e.target.value)} placeholder="thabo@company.co.bw" error={errors.email as string} />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Phone number" hint="+267 format preferred">
                <FormInput type="tel" value={form.phone} onChange={e => s('phone', e.target.value)} placeholder="+267 71 000 000" />
              </Field>
              <Field label="Company / Business name">
                <FormInput value={form.company} onChange={e => s('company', e.target.value)} placeholder="Molefe Logistics (optional)" />
              </Field>
            </div>
            <div style={{ background: 'rgba(59,130,246,.06)', border: '1px solid rgba(59,130,246,.15)', borderRadius: 9, padding: '11px 14px', fontSize: 12.5, color: '#94A3B8', lineHeight: 1.6 }}>
              🔒 Your details are used only to match you with carriers and will never be sold or shared externally.
            </div>
          </div>
        )}

        {/* ── Step 1: Shipment Info ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Pickup city" required>
                <FormSelect value={form.pickup_city} onChange={e => s('pickup_city', e.target.value)} placeholder="Select city" options={CITIES.map(c => ({ value: c, label: c }))} error={errors.pickup_city as string} />
              </Field>
              <Field label="Dropoff city" required>
                <FormSelect value={form.dropoff_city} onChange={e => s('dropoff_city', e.target.value)} placeholder="Select city" options={CITIES.map(c => ({ value: c, label: c }))} error={errors.dropoff_city as string} />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Cargo type" required>
                <FormSelect value={form.cargo_type} onChange={e => s('cargo_type', e.target.value)} placeholder="Select cargo type" options={CARGO_TYPES.map(c => ({ value: c, label: c }))} error={errors.cargo_type as string} />
              </Field>
              <Field label="Estimated weight (tons)" required>
                <FormInput type="number" value={form.weight_tons} onChange={e => s('weight_tons', e.target.value)} placeholder="e.g. 5.0" min="0.1" max="60" step="0.5" error={errors.weight_tons as string} />
              </Field>
            </div>
            <Field label="Special instructions">
              <FormTextarea value={form.notes} onChange={e => s('notes', e.target.value)} placeholder="Fragile, hazardous, loading equipment needed, temperature requirements…" rows={3} />
            </Field>
          </div>
        )}

        {/* ── Step 2: Vehicle & Dates ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Field label="Vehicle type required" required>
              <FormSelect value={form.vehicle_type} onChange={e => s('vehicle_type', e.target.value)} placeholder="Select vehicle type" options={VEHICLE_TYPES.map(v => ({ value: v, label: v }))} error={errors.vehicle_type as string} />
            </Field>
            {estPrice > 0 && (
              <div style={{ background: 'rgba(245,158,11,.07)', border: '1px solid rgba(245,158,11,.18)', borderRadius: 9, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#F59E0B' }}>ESTIMATED FREIGHT COST</div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Based on ~{estKm}km route · actual bids may vary</div>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 28, color: '#F59E0B' }}>{fmtBWP(estPrice)}</div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Preferred pickup date" required>
                <FormInput type="date" value={form.pickup_date} onChange={e => s('pickup_date', e.target.value)} min={new Date().toISOString().split('T')[0]} error={errors.pickup_date as string} />
              </Field>
              <Field label="Max budget (BWP)" hint="Leave blank to receive open bids">
                <FormInput type="number" value={form.budget_max} onChange={e => s('budget_max', e.target.value)} placeholder="e.g. 8000" min="0" />
              </Field>
            </div>
            <Checkbox checked={form.flexible_dates} onChange={v => s('flexible_dates', v)} label="My dates are flexible (+ 2–3 days) — often attracts more carrier bids" />
          </div>
        )}

        {/* ── Step 3: Confirm ── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 10, padding: '18px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Summary</div>
              {[
                ['Contact',   `${form.full_name} · ${form.email}${form.phone ? ` · ${form.phone}` : ''}`],
                ['Route',     `${form.pickup_city} → ${form.dropoff_city}`],
                ['Cargo',     `${form.cargo_type}${form.weight_tons ? ` · ${form.weight_tons}t` : ''}`],
                ['Vehicle',   form.vehicle_type],
                ['Pickup',    `${form.pickup_date}${form.flexible_dates ? ' (flexible)' : ''}`],
                ['Budget',    form.budget_max ? fmtBWP(parseFloat(form.budget_max)) + ' max' : 'Open to bids'],
              ].map(([k, v]) => v && (
                <div key={k} style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 70, fontSize: 11, fontWeight: 700, color: '#64748B', flexShrink: 0 }}>{k}</div>
                  <div style={{ fontSize: 13, color: '#CBD5E1' }}>{v}</div>
                </div>
              ))}
              {form.notes && (
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 70, fontSize: 11, fontWeight: 700, color: '#64748B', flexShrink: 0 }}>Notes</div>
                  <div style={{ fontSize: 13, color: '#CBD5E1' }}>{form.notes}</div>
                </div>
              )}
            </div>
            <Checkbox
              checked={form.agree_contact}
              onChange={v => s('agree_contact', v)}
              label="I agree to be contacted by SwiftLoad and matched carriers regarding this quote request."
            />
            <div style={{ background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.15)', borderRadius: 9, padding: '11px 14px', fontSize: 12, color: '#94A3B8', lineHeight: 1.65 }}>
              ✅ After submitting, verified carriers on the SwiftLoad network will review your requirements and send bids directly. You'll receive an email with all quotes.
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24, alignItems: 'center' }}>
          {step > 0 && <button onClick={back} className="btn btn-ghost btn-lg" style={{ color: '#64748B', flexShrink: 0 }}>← Back</button>}
          {step < STEPS.length - 1 ? (
            <button onClick={next} className="btn btn-amber btn-lg" style={{ flex: 1, justifyContent: 'center' }}>
              Continue — {STEPS[step + 1]} →
            </button>
          ) : (
            <button onClick={submit} disabled={loading || !form.agree_contact} className="btn btn-amber btn-lg" style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? <><LoadingSpinner size={18} color="#080E1A"/> Submitting…</> : '🚛 Submit Quote Request'}
            </button>
          )}
        </div>
      </div>

      {/* Google Forms alternative */}
      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>Prefer Google Forms?</p>
        <GoogleFormButton url="https://forms.gle/swiftload-load-quote" label="Open Load Quote on Google Forms" />
      </div>
    </FormShell>
  )
}
