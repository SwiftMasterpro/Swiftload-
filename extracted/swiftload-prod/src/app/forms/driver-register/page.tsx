'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormShell, Field, FormInput, FormSelect, FormTextarea, RadioGroup, Checkbox, StepBar, SectionDivider, GoogleFormButton } from '@/components/forms/FormPrimitives'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { VEHICLE_TYPES, BW_CITIES } from '@/lib/utils/constants'
import { toast } from 'sonner'

const STEPS = ['Personal Info', 'Your Vehicle', 'Experience', 'Declaration']
const LICENCE_CLASSES = [
  { value: 'B', label: 'Class B — Light Motor Vehicle' },
  { value: 'C', label: 'Class C — Heavy Motor Vehicle' },
  { value: 'C1', label: 'Class C1 — Medium Heavy Vehicle' },
  { value: 'D', label: 'Class D — Bus / Minibus' },
  { value: 'EB', label: 'Class EB — Articulated Heavy Motor' },
]
const PREFERRED_ROUTES = ['Gaborone–Francistown','Gaborone–Maun','Gaborone–Kasane','Gaborone–Jwaneng','Francistown–Maun','Cross-border RSA','Cross-border NAM','Cross-border ZIM','All routes']

type FormState = {
  full_name: string; email: string; phone: string; home_city: string; omang_number: string
  licence_class: string; licence_expiry: string; years_experience: string
  vehicle_make: string; vehicle_model: string; vehicle_year: string; vehicle_reg: string
  vehicle_type: string; capacity_tons: string; has_insurance: boolean; insurance_expiry: string
  routes_preferred: string[]; bio: string
  agree_kyc: boolean; agree_terms: boolean; agree_background: boolean
}
const INIT: FormState = {
  full_name: '', email: '', phone: '', home_city: '', omang_number: '',
  licence_class: '', licence_expiry: '', years_experience: '',
  vehicle_make: '', vehicle_model: '', vehicle_year: '', vehicle_reg: '',
  vehicle_type: '', capacity_tons: '', has_insurance: false, insurance_expiry: '',
  routes_preferred: [], bio: '',
  agree_kyc: false, agree_terms: false, agree_background: false,
}

export default function DriverRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(INIT)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const s  = (k: keyof FormState, v: any) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }
  const toggleRoute = (r: string) => s('routes_preferred', form.routes_preferred.includes(r) ? form.routes_preferred.filter(x => x !== r) : [...form.routes_preferred, r])

  const validate = (st: number) => {
    const e: Record<string, string> = {}
    if (st === 0) {
      if (!form.full_name)    e.full_name    = 'Required'
      if (!form.email.includes('@')) e.email = 'Valid email required'
      if (!form.phone)        e.phone        = 'Phone number required'
      if (!form.home_city)    e.home_city    = 'Select your city'
    }
    if (st === 1) {
      if (!form.vehicle_make) e.vehicle_make = 'Required'
      if (!form.vehicle_model)e.vehicle_model= 'Required'
      if (!form.vehicle_reg)  e.vehicle_reg  = 'Registration required'
      if (!form.vehicle_type) e.vehicle_type = 'Select vehicle type'
      if (!form.capacity_tons)e.capacity_tons= 'Enter capacity'
    }
    if (st === 2) {
      if (!form.licence_class)   e.licence_class   = 'Select licence class'
      if (!form.licence_expiry)  e.licence_expiry  = 'Expiry date required'
      if (!form.years_experience) e.years_experience = 'Enter years of experience'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validate(step)) setStep(s => s + 1) }
  const back = () => setStep(s => s - 1)

  const submit = async () => {
    if (!form.agree_kyc || !form.agree_terms || !form.agree_background) {
      toast.error('Please accept all declarations to continue'); return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_key: 'driver-register',
          ...form,
          vehicle_year:       form.vehicle_year    ? parseInt(form.vehicle_year)     : null,
          capacity_tons:      form.capacity_tons   ? parseFloat(form.capacity_tons)  : null,
          years_experience:   form.years_experience ? parseInt(form.years_experience) : null,
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Submission failed') }
      router.push('/forms/success?type=driver-register')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormShell
      title="Become a SwiftLoad Driver"
      subtitle="Join Botswana's largest verified driver network. Earn more, deadhead less, get paid same day."
      icon="🚛">

      {/* Stats banner */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        {[['P 18,400','Avg monthly earnings'],['91%','Return load rate'],['8 min','First bid time'],['Same day','Escrow payout']].map(([v, l]) => (
          <div key={l} className="card" style={{ flex: '1 1 110px', padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 20, color: '#F59E0B' }}>{v}</div>
            <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      <StepBar current={step} total={STEPS.length} labels={STEPS} />

      <div className="card" style={{ padding: '28px 28px' }}>

        {/* ── Step 0: Personal ── */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Full name (as on Omang)" required>
                <FormInput value={form.full_name} onChange={e => s('full_name', e.target.value)} placeholder="Kabo Sithole" error={errors.full_name} />
              </Field>
              <Field label="Email address" required>
                <FormInput type="email" value={form.email} onChange={e => s('email', e.target.value)} placeholder="kabo@email.com" error={errors.email} />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Mobile number" required hint="+267 format">
                <FormInput type="tel" value={form.phone} onChange={e => s('phone', e.target.value)} placeholder="+267 71 000 000" error={errors.phone} />
              </Field>
              <Field label="Home city / base" required>
                <FormSelect value={form.home_city} onChange={e => s('home_city', e.target.value)} placeholder="Select city" options={BW_CITIES.map(c => ({ value: c, label: c }))} error={errors.home_city} />
              </Field>
            </div>
            <Field label="Omang / National ID number" hint="Kept confidential — for KYC verification only">
              <FormInput value={form.omang_number} onChange={e => s('omang_number', e.target.value)} placeholder="123456789" />
            </Field>
          </div>
        )}

        {/* ── Step 1: Vehicle ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SectionDivider title="Vehicle Details" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 14 }}>
              <Field label="Make" required>
                <FormInput value={form.vehicle_make} onChange={e => s('vehicle_make', e.target.value)} placeholder="Isuzu" error={errors.vehicle_make} />
              </Field>
              <Field label="Model" required>
                <FormInput value={form.vehicle_model} onChange={e => s('vehicle_model', e.target.value)} placeholder="NQR 500" error={errors.vehicle_model} />
              </Field>
              <Field label="Year">
                <FormInput type="number" value={form.vehicle_year} onChange={e => s('vehicle_year', e.target.value)} placeholder="2020" min="1990" max="2026" />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Registration number" required>
                <FormInput value={form.vehicle_reg} onChange={e => s('vehicle_reg', e.target.value.toUpperCase())} placeholder="BW AB 1234" error={errors.vehicle_reg} />
              </Field>
              <Field label="Capacity (tons)" required>
                <FormInput type="number" value={form.capacity_tons} onChange={e => s('capacity_tons', e.target.value)} placeholder="8.0" min="0.5" max="60" step="0.5" error={errors.capacity_tons} />
              </Field>
            </div>
            <Field label="Vehicle type" required>
              <FormSelect value={form.vehicle_type} onChange={e => s('vehicle_type', e.target.value)} placeholder="Select vehicle type" options={VEHICLE_TYPES.map(v => ({ value: v, label: v }))} error={errors.vehicle_type} />
            </Field>
            <SectionDivider title="Insurance" />
            <Checkbox checked={form.has_insurance} onChange={v => s('has_insurance', v)} label="My vehicle has current third-party or comprehensive insurance" />
            {form.has_insurance && (
              <Field label="Insurance expiry date">
                <FormInput type="date" value={form.insurance_expiry} onChange={e => s('insurance_expiry', e.target.value)} />
              </Field>
            )}
          </div>
        )}

        {/* ── Step 2: Experience ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Driver's licence class" required>
                <FormSelect value={form.licence_class} onChange={e => s('licence_class', e.target.value)} placeholder="Select class" options={LICENCE_CLASSES} error={errors.licence_class} />
              </Field>
              <Field label="Licence expiry date" required>
                <FormInput type="date" value={form.licence_expiry} onChange={e => s('licence_expiry', e.target.value)} error={errors.licence_expiry} />
              </Field>
            </div>
            <Field label="Years of professional driving experience" required>
              <FormInput type="number" value={form.years_experience} onChange={e => s('years_experience', e.target.value)} placeholder="e.g. 5" min="0" max="50" error={errors.years_experience} />
            </Field>
            <Field label="Preferred routes" hint="Select all that apply">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 4 }}>
                {PREFERRED_ROUTES.map(r => (
                  <button key={r} onClick={() => toggleRoute(r)}
                    style={{ padding: '6px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, border: form.routes_preferred.includes(r) ? '1px solid #F59E0B' : '1px solid rgba(255,255,255,.1)', background: form.routes_preferred.includes(r) ? 'rgba(245,158,11,.1)' : 'rgba(255,255,255,.02)', color: form.routes_preferred.includes(r) ? '#F59E0B' : '#94A3B8', cursor: 'pointer', transition: 'all 180ms ease', fontFamily: 'inherit' }}>
                    {r}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="About you" hint="Tell clients about your experience, reliability, routes covered">
              <FormTextarea value={form.bio} onChange={e => s('bio', e.target.value)} placeholder="10 years experience on the Gaborone–Maun route. Always on time, clean truck, excellent client ratings…" rows={3} />
            </Field>
          </div>
        )}

        {/* ── Step 3: Declaration ── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.15)', borderRadius: 10, padding: '16px 18px' }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: '#F59E0B' }}>Driver Verification Declaration</div>
              <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.7 }}>
                By submitting this application you confirm that all information provided is accurate and truthful. SwiftLoad will verify your Omang, driving licence, vehicle registration, and insurance before you can receive bookings. False information results in permanent account suspension.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Checkbox checked={form.agree_kyc}        onChange={v => s('agree_kyc', v)}        label="I consent to SwiftLoad verifying my identity documents (Omang, licence, vehicle registration, insurance)" />
              <Checkbox checked={form.agree_background} onChange={v => s('agree_background', v)} label="I consent to a background check as part of the driver onboarding process" />
              <Checkbox checked={form.agree_terms}      onChange={v => s('agree_terms', v)}      label="I agree to the SwiftLoad Driver Terms of Service and Code of Conduct, including the obligation to complete accepted bookings" />
            </div>
            <div style={{ background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.15)', borderRadius: 9, padding: '11px 14px', fontSize: 12, color: '#94A3B8', lineHeight: 1.65 }}>
              ✅ After submitting, our team will review your application within 1 business day and send you an invite to upload your documents via the app.
            </div>
          </div>
        )}

        {/* Nav */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          {step > 0 && <button onClick={back} className="btn btn-ghost btn-lg" style={{ color: '#64748B' }}>← Back</button>}
          {step < STEPS.length - 1 ? (
            <button onClick={next} className="btn btn-amber btn-lg" style={{ flex: 1, justifyContent: 'center' }}>Continue — {STEPS[step + 1]} →</button>
          ) : (
            <button onClick={submit} disabled={loading || !form.agree_kyc || !form.agree_terms || !form.agree_background} className="btn btn-amber btn-lg" style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? <><LoadingSpinner size={18} color="#080E1A"/> Submitting…</> : '🚛 Submit Driver Application'}
            </button>
          )}
        </div>
      </div>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>Prefer Google Forms?</p>
        <GoogleFormButton url="https://forms.gle/swiftload-driver-register" label="Open Driver Registration on Google Forms" />
      </div>
    </FormShell>
  )
}
