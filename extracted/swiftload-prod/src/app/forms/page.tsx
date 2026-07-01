import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forms — Pronto SwiftLoad',
  description: 'Get a freight quote, register as a driver, set up a business account, or contact SwiftLoad.',
}

const FORMS = [
  {
    href:    '/forms/load-quote',
    icon:    '📦',
    title:   'Get a Load Quote',
    desc:    'Tell us about your freight — pickup city, cargo, weight, vehicle needed. Verified carriers respond within 2 hours.',
    cta:     'Request a Quote',
    accent:  '#F59E0B',
    time:    '~3 min',
  },
  {
    href:    '/forms/driver-register',
    icon:    '🚛',
    title:   'Become a Driver',
    desc:    'Join Botswana\'s largest verified driver network. Submit your vehicle and licence details to start receiving loads.',
    cta:     'Apply as a Driver',
    accent:  '#3B82F6',
    time:    '~5 min',
  },
  {
    href:    '/forms/business-onboard',
    icon:    '🏢',
    title:   'Business Account',
    desc:    'Unlock fleet management, team access, volume pricing, and analytics. CIPA-verified businesses only.',
    cta:     'Set Up Business Account',
    accent:  '#10B981',
    time:    '~4 min',
  },
  {
    href:    '/forms/general-enquiry',
    icon:    '✉️',
    title:   'Contact Us',
    desc:    'General questions, partnership enquiries, press, support, or anything else — we respond within 4 hours.',
    cta:     'Send a Message',
    accent:  '#94A3B8',
    time:    '~2 min',
  },
]

export default function FormsHubPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#080E1A', padding: '48px 24px 80px', position: 'relative' }}>
      {/* Ambient */}
      <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: 700, height: 320, background: 'radial-gradient(ellipse,rgba(245,158,11,.055) 0%,transparent 70%)', pointerEvents: 'none' }}/>

      <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Back */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: 12.5, textDecoration: 'none', marginBottom: 32 }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6"/></svg>
          Back to SwiftLoad
        </Link>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', padding: '4px 14px', borderRadius: 100, marginBottom: 18 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }}/>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#F59E0B' }}>PRONTO SWIFTLOAD</span>
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(34px,6vw,52px)', color: '#fff', marginBottom: 14, lineHeight: 1.0 }}>
            HOW CAN WE<br/><span style={{ color: '#F59E0B' }}>HELP YOU?</span>
          </h1>
          <p style={{ color: '#64748B', fontSize: 15, lineHeight: 1.65, maxWidth: 440, margin: '0 auto' }}>
            Four forms, one platform. Submit online and our team responds within 2–4 hours.
          </p>
        </div>

        {/* Form cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18, marginBottom: 40 }}>
          {FORMS.map(f => (
            <Link key={f.href} href={f.href} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '28px 26px', height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'transform 200ms ease, border-color 200ms ease', borderColor: 'rgba(255,255,255,.07)' }}>
                {/* Subtle accent gradient */}
                <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: `radial-gradient(circle at 100% 0%,${f.accent}0F 0%,transparent 70%)`, pointerEvents: 'none' }}/>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${f.accent}14`, border: `1px solid ${f.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 18 }}>
                  {f.icon}
                </div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 22, color: '#fff', marginBottom: 8 }}>{f.title}</div>
                <p style={{ color: '#64748B', fontSize: 13.5, lineHeight: 1.65, flex: 1, marginBottom: 20 }}>{f.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 700, color: f.accent }}>
                    {f.cta}
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={f.accent} strokeWidth={2.5}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </span>
                  <span style={{ fontSize: 11, color: '#64748B' }}>⏱ {f.time}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Already have account */}
        <div className="card" style={{ padding: '22px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Already a SwiftLoad member?</div>
            <p style={{ color: '#64748B', fontSize: 13 }}>Sign in to your dashboard to post loads, track deliveries, and manage your account directly.</p>
          </div>
          <div style={{ display: 'flex', gap: 9, flexShrink: 0 }}>
            <Link href="/auth/login" className="btn btn-ghost btn-md" style={{ color: '#94A3B8' }}>Sign In</Link>
            <Link href="/auth/register" className="btn btn-amber btn-md">Create Account</Link>
          </div>
        </div>

        {/* Contact strip */}
        <div style={{ textAlign: 'center', marginTop: 32, display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="mailto:Prontswift@proton.me" style={{ color: '#64748B', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            📧 Prontswift@proton.me
          </a>
          <a href="https://wa.me/26775000000" target="_blank" rel="noopener noreferrer" style={{ color: '#64748B', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            💬 WhatsApp +267 75 000 000
          </a>
          <span style={{ color: '#64748B', fontSize: 13 }}>⏱ Response within 4 hours</span>
        </div>
      </div>
    </div>
  )
}
