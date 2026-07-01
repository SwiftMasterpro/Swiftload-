'use client'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

/* ─── Label ─────────────────────────────────────────────────────────────────── */
export function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 6, letterSpacing: '.3px' }}>
      {children}
      {required && <span style={{ color: '#F59E0B', marginLeft: 4 }}>*</span>}
    </label>
  )
}

/* ─── Input ─────────────────────────────────────────────────────────────────── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}
export const FormInput = forwardRef<HTMLInputElement, InputProps>(({ error, className, ...props }, ref) => (
  <div>
    <input
      ref={ref}
      className="input-base"
      style={{ width: '100%', borderColor: error ? '#EF4444' : undefined }}
      {...props}
    />
    {error && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4 }}>{error}</p>}
  </div>
))
FormInput.displayName = 'FormInput'

/* ─── Textarea ───────────────────────────────────────────────────────────────── */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}
export const FormTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ error, ...props }, ref) => (
  <div>
    <textarea
      ref={ref}
      className="input-base"
      style={{ width: '100%', resize: 'vertical', minHeight: 100, borderColor: error ? '#EF4444' : undefined }}
      {...props}
    />
    {error && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4 }}>{error}</p>}
  </div>
))
FormTextarea.displayName = 'FormTextarea'

/* ─── Select ─────────────────────────────────────────────────────────────────── */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
  placeholder?: string
  error?: string
}
export function FormSelect({ options, placeholder, error, ...props }: SelectProps) {
  return (
    <div>
      <select
        style={{ background: 'rgba(255,255,255,.04)', border: `1px solid ${error ? '#EF4444' : 'rgba(255,255,255,.1)'}`, color: props.value ? '#fff' : '#64748B', borderRadius: 9, padding: '11px 14px', fontSize: 13.5, fontFamily: 'inherit', width: '100%', outline: 'none', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 38, transition: 'border-color 200ms ease' }}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4 }}>{error}</p>}
    </div>
  )
}

/* ─── Radio group ────────────────────────────────────────────────────────────── */
export function RadioGroup({ name, options, value, onChange }: {
  name: string
  options: { value: string; label: string; desc?: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map(o => (
        <label key={o.value} onClick={() => onChange(o.value)}
          style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: 10, border: value === o.value ? '1px solid #F59E0B' : '1px solid rgba(255,255,255,.08)', background: value === o.value ? 'rgba(245,158,11,.07)' : 'rgba(255,255,255,.02)', cursor: 'pointer', transition: 'all 180ms ease' }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${value === o.value ? '#F59E0B' : '#64748B'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition: 'all 180ms ease' }}>
            {value === o.value && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }}/>}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: value === o.value ? '#F59E0B' : '#fff' }}>{o.label}</div>
            {o.desc && <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, lineHeight: 1.5 }}>{o.desc}</div>}
          </div>
        </label>
      ))}
    </div>
  )
}

/* ─── Checkbox ───────────────────────────────────────────────────────────────── */
export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
      <div onClick={() => onChange(!checked)}
        style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${checked ? '#F59E0B' : '#64748B'}`, background: checked ? '#F59E0B' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition: 'all 180ms ease', cursor: 'pointer' }}>
        {checked && <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#080E1A" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>}
      </div>
      <span style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5 }}>{label}</span>
    </label>
  )
}

/* ─── Step progress bar ──────────────────────────────────────────────────────── */
export function StepBar({ current, total, labels }: { current: number; total: number; labels?: string[] }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < total - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: i < current ? '#10B981' : i === current ? '#F59E0B' : 'rgba(255,255,255,.08)', border: i === current ? '2px solid #F59E0B' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: i < current ? '#080E1A' : i === current ? '#080E1A' : '#64748B', transition: 'all 300ms ease', boxShadow: i === current ? '0 0 0 4px rgba(245,158,11,.18)' : 'none', flexShrink: 0 }}>
                {i < current ? '✓' : i + 1}
              </div>
              {labels && <div style={{ fontSize: 9.5, color: i === current ? '#F59E0B' : '#64748B', fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap' }}>{labels[i]}</div>}
            </div>
            {i < total - 1 && (
              <div style={{ flex: 1, height: 2, background: i < current ? '#10B981' : 'rgba(255,255,255,.08)', margin: labels ? '0 4px 18px' : '0 4px', transition: 'background 400ms ease' }}/>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Form shell ─────────────────────────────────────────────────────────────── */
export function FormShell({ title, subtitle, icon, children }: { title: string; subtitle?: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#080E1A', padding: '40px 24px 80px', position: 'relative' }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse,rgba(245,158,11,.06) 0%,transparent 70%)', pointerEvents: 'none' }}/>
      <div style={{ maxWidth: 580, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Back to site */}
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: 12.5, textDecoration: 'none', marginBottom: 28, transition: 'color 180ms' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#F59E0B')}
          onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6"/></svg>
          Back to SwiftLoad
        </a>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 26 }}>
            {icon}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', padding: '3px 12px', borderRadius: 100, marginBottom: 14 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }}/>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#F59E0B' }}>PRONTO SWIFTLOAD</span>
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(28px,5vw,38px)', color: '#fff', marginBottom: 10, lineHeight: 1.05 }}>{title}</h1>
          {subtitle && <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.65, maxWidth: 400, margin: '0 auto' }}>{subtitle}</p>}
        </div>
        {children}
        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,.06)' }}>
          <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.6 }}>
            🔒 Your data is encrypted and stored securely. We never sell your information.<br/>
            Questions? <a href="mailto:Prontswift@proton.me" style={{ color: '#F59E0B', textDecoration: 'none' }}>Prontswift@proton.me</a>
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Field group ────────────────────────────────────────────────────────────── */
export function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
      {hint && <p style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>{hint}</p>}
    </div>
  )
}

/* ─── Section divider ────────────────────────────────────────────────────────── */
export function SectionDivider({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 4 }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.07)' }}/>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#64748B', whiteSpace: 'nowrap' }}>{title.toUpperCase()}</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.07)' }}/>
    </div>
  )
}

/* ─── Google Forms redirect button ──────────────────────────────────────────── */
export function GoogleFormButton({ url, label = 'Open in Google Forms' }: { url: string; label?: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 9, border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.04)', color: '#94A3B8', fontSize: 13, textDecoration: 'none', transition: 'all 180ms ease' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#F59E0B'; e.currentTarget.style.color = '#F59E0B' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)'; e.currentTarget.style.color = '#94A3B8' }}>
      {/* Google "G" icon */}
      <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      {label}
    </a>
  )
}
