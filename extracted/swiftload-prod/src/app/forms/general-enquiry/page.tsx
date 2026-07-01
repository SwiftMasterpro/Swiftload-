'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormShell, Field, FormInput, FormSelect, FormTextarea, Checkbox, GoogleFormButton } from '@/components/forms/FormPrimitives'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { toast } from 'sonner'

const CATEGORIES = [
  { value: 'general',      label: '❓ General question' },
  { value: 'support',      label: '🛠️ Technical support' },
  { value: 'partnership',  label: '🤝 Partnership / integration' },
  { value: 'press',        label: '📰 Press / media enquiry' },
  { value: 'careers',      label: '💼 Careers / work with us' },
  { value: 'other',        label: '📨 Other' },
]

export default function GeneralEnquiryPage() {
  const router = useRouter()
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', subject: '', category: 'general', message: '', agree: false })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const s = (k: string, v: any) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const submit = async () => {
    const e: Record<string, string> = {}
    if (!form.full_name)            e.full_name = 'Required'
    if (!form.email.includes('@'))  e.email     = 'Valid email required'
    if (!form.subject.trim())       e.subject   = 'Please enter a subject'
    if (!form.message.trim())       e.message   = 'Please enter your message'
    if (!form.agree)                e.agree     = 'You must agree to be contacted'
    setErrors(e)
    if (Object.keys(e).length) return

    setLoading(true)
    try {
      const res = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_key: 'general-enquiry', ...form }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed') }
      router.push('/forms/success?type=general-enquiry')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormShell
      title="Get in Touch"
      subtitle="We respond to all enquiries within 4 business hours. For urgent freight needs, use the Load Quote form."
      icon="✉️">

      {/* Contact cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
        {[
          { icon: '📧', label: 'Email', val: 'Prontswift@proton.me', href: 'mailto:Prontswift@proton.me' },
          { icon: '💬', label: 'WhatsApp', val: '+267 75 000 000', href: 'https://wa.me/26775000000' },
        ].map(c => (
          <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', textDecoration: 'none', transition: 'border-color 180ms ease' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(245,158,11,.3)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)')}>
            <span style={{ fontSize: 22 }}>{c.icon}</span>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', letterSpacing: 1 }}>{c.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#CBD5E1' }}>{c.val}</div>
            </div>
          </a>
        ))}
      </div>

      <div className="card" style={{ padding: '28px 28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Full name" required>
              <FormInput value={form.full_name} onChange={e => s('full_name', e.target.value)} placeholder="Your name" error={errors.full_name} />
            </Field>
            <Field label="Email address" required>
              <FormInput type="email" value={form.email} onChange={e => s('email', e.target.value)} placeholder="you@example.com" error={errors.email} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Phone number">
              <FormInput type="tel" value={form.phone} onChange={e => s('phone', e.target.value)} placeholder="+267 71 000 000 (optional)" />
            </Field>
            <Field label="Enquiry category">
              <FormSelect value={form.category} onChange={e => s('category', e.target.value)} options={CATEGORIES} />
            </Field>
          </div>
          <Field label="Subject" required>
            <FormInput value={form.subject} onChange={e => s('subject', e.target.value)} placeholder="Brief description of your enquiry" error={errors.subject} />
          </Field>
          <Field label="Message" required>
            <FormTextarea value={form.message} onChange={e => s('message', e.target.value)} placeholder="Tell us more — the more detail you provide, the faster we can help you…" rows={5} error={errors.message} />
          </Field>
          <Checkbox checked={form.agree} onChange={v => s('agree', v)} label="I agree to be contacted by SwiftLoad regarding this enquiry." />
          {errors.agree && <p style={{ color: '#EF4444', fontSize: 11, marginTop: -8 }}>{errors.agree}</p>}
          <button onClick={submit} disabled={loading} className="btn btn-amber btn-lg" style={{ justifyContent: 'center' }}>
            {loading ? <><LoadingSpinner size={18} color="#080E1A"/> Sending…</> : '✉️ Send Message'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>Prefer Google Forms?</p>
        <GoogleFormButton url="https://forms.gle/swiftload-enquiry" label="Open Contact Form on Google Forms" />
      </div>
    </FormShell>
  )
}
