'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const MESSAGES: Record<string, { icon: string; title: string; sub: string; next: { label: string; href: string }[] }> = {
  'load-quote': {
    icon: '📦', title: 'Quote request received!',
    sub: 'Verified carriers will review your load and send competitive bids. You\'ll receive an email within 2 hours. A SwiftLoad team member may also call to confirm details.',
    next: [
      { label: 'Post a full load (faster matching)', href: '/marketplace/post' },
      { label: 'Create a free account', href: '/auth/register?role=customer' },
      { label: 'Back to home', href: '/' },
    ],
  },
  'driver-register': {
    icon: '🚛', title: 'Application submitted!',
    sub: 'Our verification team will review your application within 1 business day. We\'ll email you with next steps — including how to upload your documents and go live on the platform.',
    next: [
      { label: 'Create your driver account now', href: '/auth/register?role=driver' },
      { label: 'Browse available loads', href: '/marketplace' },
      { label: 'Back to home', href: '/' },
    ],
  },
  'business-onboard': {
    icon: '🏢', title: 'Business application received!',
    sub: 'Our team will contact you within 1 business day to set up your account, verify your company details, and walk you through the platform. CIPA verification speeds up the process.',
    next: [
      { label: 'Create your business account now', href: '/auth/register?role=business' },
      { label: 'Browse the marketplace', href: '/marketplace' },
      { label: 'Back to home', href: '/' },
    ],
  },
  'general-enquiry': {
    icon: '✉️', title: 'Message received!',
    sub: 'We respond to all enquiries within 4 business hours. For urgent freight needs, post a load directly in the marketplace.',
    next: [
      { label: 'Post a load', href: '/marketplace/post' },
      { label: 'Get a freight quote', href: '/forms/load-quote' },
      { label: 'Back to home', href: '/' },
    ],
  },
}

function SuccessContent() {
  const params = useSearchParams()
  const type   = params.get('type') ?? 'general-enquiry'
  const msg    = MESSAGES[type] ?? MESSAGES['general-enquiry']

  return (
    <div style={{ minHeight: '100vh', background: '#080E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      {/* Success glow */}
      <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 300, background: 'radial-gradient(ellipse,rgba(16,185,129,.08) 0%,transparent 70%)', pointerEvents: 'none' }}/>
      <div style={{ maxWidth: 480, width: '100%', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {/* Animated check circle */}
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,.12)', border: '2px solid rgba(16,185,129,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36 }}>
          {msg.icon}
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', padding: '4px 13px', borderRadius: 100, marginBottom: 18 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'pulse 1.5s infinite' }}/>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#10B981' }}>SUBMISSION CONFIRMED</span>
        </div>
        <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(28px,5vw,42px)', color: '#fff', marginBottom: 16, lineHeight: 1.05 }}>
          {msg.title}
        </h1>
        <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
          {msg.sub}
        </p>

        {/* Next steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 28 }}>
          {msg.next.map((n, i) => (
            <Link key={n.href} href={n.href}
              className={i === 0 ? 'btn btn-amber btn-lg' : 'btn btn-ghost btn-lg'}
              style={{ justifyContent: 'center', display: 'flex' }}>
              {n.label}
            </Link>
          ))}
        </div>

        {/* Reference */}
        <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 10, padding: '14px 18px' }}>
          <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.65 }}>
            Need to follow up? Email us at{' '}
            <a href="mailto:Prontswift@proton.me" style={{ color: '#F59E0B', textDecoration: 'none' }}>Prontswift@proton.me</a>{' '}
            or WhatsApp <a href="https://wa.me/26775000000" target="_blank" rel="noopener noreferrer" style={{ color: '#F59E0B', textDecoration: 'none' }}>+267 75 000 000</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return <Suspense fallback={<div style={{ minHeight: '100vh', background: '#080E1A' }}/>}><SuccessContent/></Suspense>
}
