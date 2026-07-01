'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormShell, Field, FormInput, FormSelect, FormTextarea, Checkbox, StepBar, SectionDivider, GoogleFormButton } from '@/components/forms/FormPrimitives'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { BW_CITIES } from '@/lib/utils/constants'
import { toast } from 'sonner'

const STEPS = ['Company Details', 'Freight Needs', 'Features', 'Confirm']
const INDUSTRIES = [
  { value: 'retail',        label: 'Retail & FMCG' },
  { value: 'construction',  label: 'Construction & Building' },
  { value: 'agriculture',   label: 'Agriculture & Farming' },
  { value: 'mining',        label: 'Mining & Resources' },
  { value: 'manufacturing', label: 'Manufacturing & Industry' },
  { value: 'logistics',     label: 'Logistics & Distribution' },
  { value: 'government',    label: 'Government & Public Sector' },
  { value: 'hospitality',   label: 'Hospitality & Tourism' },
  { value: 'healthcare',    label: 'Healthcare & Pharmaceuticals' },
  { value: 'other',         label: 'Other' },
]
const MONTHLY_LOADS = [
  { value: '1-5',    label: '1–5 loads per month' },
  { value: '6-20',   label: '6–20 loads per month' },
  { value: '21-50',  label: '21–50 loads per month' },
  { value: '51-100', label: '51–100 loads per month' },
  { value: '100+',   label: '100+ loads per month' },
]
const FLEET_SIZES = [
  { value: '0',    label: 'No fleet (outsource all freight)' },
  { value: '1-5',  label: '1–5 vehicles' },
  { value: '6-20', label: '6–20 vehicles' },
  { value: '20+',  label: '20+ vehicles' },
]
const ROUTES_BW = ['Gaborone–Francistown','Gaborone–Maun','Gaborone–Kasane','National (all routes)','Cross-border RSA','Cross-border NAM','Cross-border ZIM','SADC Region']

type FormState = {
  company_name: string; contact_name: string; email: string; phone: string
  cipa_reg: string; industry: string; company_city: string
  fleet_size: string; monthly_loads: string; routes: string[]
  needs_escrow: boolean; needs_fleet: boolean; needs_api: boolean; needs_analytics: boolean
  needs_crossborder: boolean; needs_whatsapp: boolean
  notes: string; agree_terms: boolean; agree_contact: boolean
}
const INIT: FormState = {
  company_name: '', contact_name: '', email: '', phone: '',
  cipa_reg: '', industry: '', company_city: '',
  fleet_size: '', monthly_loads: '', routes: [],
  needs_escrow: true, needs_fleet: false, needs_api: false, needs_analytics: false,
  needs_crossborder: false, needs_whatsapp: true,
  notes: '', agree_terms: false, agree_contact: false,
}

export default function BusinessOnboardPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(INIT)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const s = (k: keyof FormState, v: any) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }
  const toggleRoute = (r: string) => s('routes', form.routes.includes(r) ? form.routes.filter(x => x !== r) : [...form.routes, r])

  const validate = (st: number) => {
    const e: Record<string, string> = {}
    if (st === 0) {
      if (!form.company_name)  e.company_name  = 'Company name required'
      if (!form.contact_name)  e.contact_name  = 'Contact name required'
      if (!form.email.includes('@')) e.email   = 'Valid email required'
      if (!form.phone)         e.phone         = 'Phone required'
      if (!form.industry)      e.industry      = 'Select your industry'
    }
    if (st === 1) {
      if (!form.monthly_loads) e.monthly_loads = 'Select monthly volume'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validate(step)) setStep(s => s + 1) }
  const back = () => setStep(s => s - 1)

  const submit = async () => {
    if (!form.agree_terms || !form.agree_contact) { toast.error('Please accept all terms'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_key: 'business-onboard', ...form }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed') }
      router.push('/forms/success?type=business-onboard')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const FeatureToggle = ({ k, label, icon }: { k: keyof FormState; label: string; icon: string }) => (
    <button onClick={() => s(k, !form[k])}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, border: form[k] ? '1px solid #F59E0B' : '1px solid rgba(255,255,255,.08)', background: form[k] ? 'rgba(245,158,11,.08)' : 'rgba(255,255,255,.02)', cursor: 'pointer', textAlign: 'left', transition: 'all 180ms ease', fontFamily: 'inherit', width: '100%' }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontWeight: 600, fontSize: 13, color: form[k] ? '#F59E0B' : '#CBD5E1' }}>{label}</span>
      {form[k] && <span style={{ marginLeft: 'auto', color: '#10B981', fontWeight: 700, fontSize: 12 }}>✓ Selected</span>}
    </button>
  )

  return (
    <FormShell
      title="Set Up a Business Account"
      subtitle="Unlock fleet management, team access, analytics, and volume pricing. CIPA-verified companies only."
      icon="🏢">

      <StepBar current={step} total={STEPS.length} labels={STEPS} />

      <div className="card" style={{ padding: '28px 28px' }}>

        {/* Step 0 — Company */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Company / trading name" required>
                <FormInput value={form.company_name} onChange={e => s('company_name', e.target.value)} placeholder="Naledi Traders (Pty) Ltd" error={errors.company_name} />
              </Field>
              <Field label="CIPA registration number" hint="Optional — speeds up verification">
                <FormInput value={form.cipa_reg} onChange={e => s('cipa_reg', e.target.value)} placeholder="BW-2024-00001" />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Primary contact name" required>
                <FormInput value={form.contact_name} onChange={e => s('contact_name', e.target.value)} placeholder="Naledi Kgomotso" error={errors.contact_name} />
              </Field>
              <Field label="Industry" required>
                <FormSelect value={form.industry} onChange={e => s('industry', e.target.value)} placeholder="Select industry" options={INDUSTRIES} error={errors.industry} />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Work email" required>
                <FormInput type="email" value={form.email} onChange={e => s('email', e.target.value)} placeholder="orders@naleditraders.co.bw" error={errors.email} />
              </Field>
              <Field label="Phone number" required>
                <FormInput type="tel" value={form.phone} onChange={e => s('phone', e.target.value)} placeholder="+267 71 000 000" error={errors.phone} />
              </Field>
            </div>
            <Field label="Company city / head office">
              <FormSelect value={form.company_city} onChange={e => s('company_city', e.target.value)} placeholder="Select city" options={BW_CITIES.map(c => ({ value: c, label: c }))} />
            </Field>
          </div>
        )}

        {/* Step 1 — Freight needs */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Field label="Monthly shipment volume" required>
              <FormSelect value={form.monthly_loads} onChange={e => s('monthly_loads', e.target.value)} placeholder="Select volume" options={MONTHLY_LOADS} error={errors.monthly_loads} />
            </Field>
            <Field label="Own fleet size" hint="Vehicles owned or managed by your company">
              <FormSelect value={form.fleet_size} onChange={e => s('fleet_size', e.target.value)} placeholder="Select fleet size" options={FLEET_SIZES} />
            </Field>
            <Field label="Primary routes" hint="Select all that apply">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 4 }}>
                {ROUTES_BW.map(r => (
                  <button key={r} onClick={() => toggleRoute(r)}
                    style={{ padding: '7px 13px', borderRadius: 100, fontSize: 12, fontWeight: 600, border: form.routes.includes(r) ? '1px solid #F59E0B' : '1px solid rgba(255,255,255,.1)', background: form.routes.includes(r) ? 'rgba(245,158,11,.09)' : 'rgba(255,255,255,.02)', color: form.routes.includes(r) ? '#F59E0B' : '#94A3B8', cursor: 'pointer', transition: 'all 180ms ease', fontFamily: 'inherit' }}>
                    {r}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Additional requirements or notes">
              <FormTextarea value={form.notes} onChange={e => s('notes', e.target.value)} placeholder="Specific cargo types, temperature control, dedicated drivers, API integration needs…" rows={3} />
            </Field>
          </div>
        )}

        {/* Step 2 — Features */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ color: '#64748B', fontSize: 13, marginBottom: 4 }}>Select the SwiftLoad features most important to your business:</p>
            <FeatureToggle k="needs_escrow"      label="Escrow payments (Stripe-held, OTP-released)"     icon="🔒" />
            <FeatureToggle k="needs_whatsapp"     label="WhatsApp-native posting & notifications"         icon="💬" />
            <FeatureToggle k="needs_fleet"        label="Fleet management (vehicles, drivers, maintenance)" icon="🚛" />
            <FeatureToggle k="needs_analytics"    label="Analytics dashboard & spend reports"             icon="📊" />
            <FeatureToggle k="needs_crossborder"  label="Cross-border SADC logistics (RSA, NAM, ZIM, ZAM)"icon="🌍" />
            <FeatureToggle k="needs_api"          label="API access & webhook integrations"               icon="⚡" />
          </div>
        )}

        {/* Step 3 — Confirm */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Summary</div>
              {[
                ['Company',  `${form.company_name}${form.cipa_reg ? ` (${form.cipa_reg})` : ''}`],
                ['Contact',  `${form.contact_name} · ${form.email} · ${form.phone}`],
                ['Industry', INDUSTRIES.find(i => i.value === form.industry)?.label ?? form.industry],
                ['Volume',   MONTHLY_LOADS.find(m => m.value === form.monthly_loads)?.label ?? form.monthly_loads],
                ['Fleet',    FLEET_SIZES.find(f => f.value === form.fleet_size)?.label ?? 'Not specified'],
                ['Routes',   form.routes.length ? form.routes.join(', ') : 'Not specified'],
                ['Features', [
                  form.needs_escrow && 'Escrow',
                  form.needs_whatsapp && 'WhatsApp',
                  form.needs_fleet && 'Fleet',
                  form.needs_analytics && 'Analytics',
                  form.needs_crossborder && 'Cross-border',
                  form.needs_api && 'API',
                ].filter(Boolean).join(', ') || 'None selected'],
              ].map(([k, v]) => v && (
                <div key={k} style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 70, fontSize: 11, fontWeight: 700, color: '#64748B', flexShrink: 0 }}>{k}</div>
                  <div style={{ fontSize: 13, color: '#CBD5E1' }}>{v}</div>
                </div>
              ))}
            </div>
            <Checkbox checked={form.agree_contact} onChange={v => s('agree_contact', v)} label="I agree to be contacted by SwiftLoad to set up our business account and verify company details." />
            <Checkbox checked={form.agree_terms} onChange={v => s('agree_terms', v)} label="I agree to the SwiftLoad Business Terms of Service and understand that CIPA verification is required to access all features." />
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          {step > 0 && <button onClick={back} className="btn btn-ghost btn-lg" style={{ color: '#64748B' }}>← Back</button>}
          {step < STEPS.length - 1 ? (
            <button onClick={next} className="btn btn-amber btn-lg" style={{ flex: 1, justifyContent: 'center' }}>Continue — {STEPS[step + 1]} →</button>
          ) : (
            <button onClick={submit} disabled={loading || !form.agree_terms || !form.agree_contact} className="btn btn-amber btn-lg" style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? <><LoadingSpinner size={18} color="#080E1A"/> Submitting…</> : '🏢 Submit Business Application'}
            </button>
          )}
        </div>
      </div>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>Prefer Google Forms?</p>
        <GoogleFormButton url="https://forms.gle/swiftload-business-onboard" label="Open Business Onboarding on Google Forms" />
      </div>
    </FormShell>
  )
}
