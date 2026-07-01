'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ContactForm } from '@/components/features/ContactForm'

const featureCards = [
  {
    title: 'Agriculture',
    body: 'Transport for fresh produce, livestock, animal feed, fertilizer, farm equipment, and cold-chain deliveries.',
    image: 'https://pyiduregtpbynsjrnhua.supabase.co/storage/v1/object/public/site-assets/01_Agriculture/agriculture_optionA.jpg',
  },
  {
    title: 'Driver Network',
    body: 'Verified professional driver profiles, steady job flow, secure escrow payments, and independent business growth.',
    image: 'https://pyiduregtpbynsjrnhua.supabase.co/storage/v1/object/public/site-assets/02_Driver_Recruitment/driver_recruitment_optionA.jpg',
  },
  {
    title: 'Business Customers',
    body: 'Centralized logistics management, real-time fleet visibility, live GPS tracking, digital proof of delivery, and analytics.',
    image: 'https://pyiduregtpbynsjrnhua.supabase.co/storage/v1/object/public/site-assets/03_Business_Customers/business_customers_optionA.jpg',
  },
  {
    title: 'Transport Companies',
    body: 'Fleet optimization software, direct freight matching, SADC-wide corridor access, and multi-vehicle dashboards.',
    image: 'https://pyiduregtpbynsjrnhua.supabase.co/storage/v1/object/public/site-assets/04_Transport_Companies/transport_companies_optionA.jpg',
  },
  {
    title: 'Platform Ecosystem',
    body: 'A verified transport network, transparent escrow safeguards, live route milestones, and AI-powered dispatch assistance.',
    image: 'https://pyiduregtpbynsjrnhua.supabase.co/storage/v1/object/public/site-assets/05_Social_Media_Stack/social_media_stack_optionA.jpg',
  },
]

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  return reducedMotion
}

function FeatureCard({
  title,
  body,
  image,
  revealCounterRef,
  reducedMotion,
}: {
  title: string
  body: string
  image: string
  revealCounterRef: React.MutableRefObject<number>
  reducedMotion: boolean
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [delay, setDelay] = useState('0s')
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = cardRef.current
    if (!element) return

    if (reducedMotion) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const nextDelay = `${revealCounterRef.current * 0.2}s`
          revealCounterRef.current += 1
          setDelay(nextDelay)
          setIsVisible(true)
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.2 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [reducedMotion, revealCounterRef])

  return (
    <div
      ref={cardRef}
      className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 shadow-xl shadow-black/20"
      style={{
        opacity: reducedMotion ? 1 : isVisible ? 1 : 0,
        transform: reducedMotion ? 'none' : isVisible ? 'translateX(0) scale(1)' : 'translateX(-40px) scale(0.9)',
        transition: reducedMotion ? 'opacity 0.4s ease-out' : `opacity 0.7s ease-out, transform 0.7s ease-out`,
        transitionDelay: delay,
      }}
    >
      <Image src={image} alt={title} width={640} height={420} className="h-48 w-full object-cover" />
      <div className="p-6">
        <h3 className="mb-3 text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-slate-400">{body}</p>
      </div>
    </div>
  )
}

function FuelAndTripCalculator({
  onQuoteRequest,
}: {
  onQuoteRequest: (summary: string) => void
}) {
  const [distanceKm, setDistanceKm] = useState('180')
  const [consumption, setConsumption] = useState('10')
  const [fuelPrice, setFuelPrice] = useState('14.5')
  const [tripHours, setTripHours] = useState('5.5')
  const [driverRate, setDriverRate] = useState('220')
  const [bufferPercent, setBufferPercent] = useState('15')
  const [savedQuote, setSavedQuote] = useState<string | null>(null)

  const fuelLitres = useMemo(() => (Number(distanceKm) / 100) * Number(consumption), [distanceKm, consumption])
  const fuelCost = useMemo(() => fuelLitres * Number(fuelPrice), [fuelLitres, fuelPrice])
  const driverWage = useMemo(() => Number(tripHours) * Number(driverRate), [tripHours, driverRate])
  const bufferAmount = useMemo(() => (driverWage + fuelCost) * (Number(bufferPercent) / 100), [driverWage, fuelCost, bufferPercent])
  const suggestedQuote = useMemo(() => fuelCost + driverWage + bufferAmount, [fuelCost, driverWage, bufferAmount])

  const assistantNote = useMemo(() => {
    if (!Number(distanceKm) || !Number(tripHours)) {
      return 'Enter a route length and expected hours to generate a fair estimate.'
    }

    const longRoute = Number(distanceKm) > 250
    const highBuffer = Number(bufferPercent) >= 15
    const fairWage = Number(driverRate) >= 180

    if (longRoute && highBuffer && fairWage) {
      return 'This route looks long-haul, so the estimate includes a stronger buffer for fatigue, tolls, and handoff time while keeping the driver wage fair.'
    }

    if (!fairWage) {
      return 'The suggested driver pay is below a fair baseline for a full trip. Consider increasing the hourly rate to cover time, risk, and compliance.'
    }

    return 'The estimate balances fuel spend, driver time, and a small fairness buffer so the quote remains sustainable for both shipper and carrier.'
  }, [distanceKm, tripHours, bufferPercent, driverRate])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem('swiftload-quote-summary')
    if (stored) {
      setSavedQuote(stored)
    }
  }, [])

  const handleRequestQuote = () => {
    const summary = [
      'SwiftLoad quote request',
      `- Distance: ${distanceKm} km`,
      `- Fuel required: ${fuelLitres.toFixed(1)} L`,
      `- Fuel cost: BWP ${fuelCost.toFixed(2)}`,
      `- Driver wage: BWP ${driverWage.toFixed(2)}`,
      `- Suggested fair quote: BWP ${suggestedQuote.toFixed(2)}`,
      `- Fairness buffer: ${bufferPercent}%`,
      `- Notes: ${assistantNote}`,
    ].join('\n')

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('swiftload-quote-summary', summary)
    }

    setSavedQuote(summary)
    onQuoteRequest(summary)
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-8 shadow-2xl shadow-black/20">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-label text-xs uppercase tracking-[0.3em]">Fuel & trip planner</p>
            <h2 className="t-h3 text-white">Estimate fuel spend and build a fair trip quote in minutes.</h2>
            <p className="mt-3 text-sm text-slate-400">
              Use these calculators to estimate cost, compare driver pay, and keep quotes fair for both customers and transport partners.
            </p>
          </div>
          <div className="rounded-full border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-300">
            AI-assisted estimate
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Fuel calculator</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-slate-300">
                <span className="mb-2 block">Distance (km)</span>
                <input type="number" min="0" value={distanceKm} onChange={(event) => setDistanceKm(event.target.value)} className="input-base" />
              </label>
              <label className="text-sm text-slate-300">
                <span className="mb-2 block">Fuel use (L/100 km)</span>
                <input type="number" min="0" step="0.1" value={consumption} onChange={(event) => setConsumption(event.target.value)} className="input-base" />
              </label>
              <label className="text-sm text-slate-300 sm:col-span-2">
                <span className="mb-2 block">Fuel price (BWP/L)</span>
                <input type="number" min="0" step="0.1" value={fuelPrice} onChange={(event) => setFuelPrice(event.target.value)} className="input-base" />
              </label>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Fuel needed</p>
                <p className="mt-2 text-2xl font-semibold text-white">{fuelLitres.toFixed(1)} L</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Fuel cost</p>
                <p className="mt-2 text-2xl font-semibold text-white">BWP {fuelCost.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Trip calculator</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-slate-300">
                <span className="mb-2 block">Estimated hours</span>
                <input type="number" min="0" step="0.5" value={tripHours} onChange={(event) => setTripHours(event.target.value)} className="input-base" />
              </label>
              <label className="text-sm text-slate-300">
                <span className="mb-2 block">Driver wage (BWP/hour)</span>
                <input type="number" min="0" value={driverRate} onChange={(event) => setDriverRate(event.target.value)} className="input-base" />
              </label>
              <label className="text-sm text-slate-300 sm:col-span-2">
                <span className="mb-2 block">Fairness buffer (%)</span>
                <input type="range" min="5" max="25" step="1" value={bufferPercent} onChange={(event) => setBufferPercent(event.target.value)} className="w-full accent-amber-500" />
                <span className="mt-2 block text-xs text-slate-500">Current buffer: {bufferPercent}%</span>
              </label>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={handleRequestQuote} className="btn btn-amber btn-md">
                Request quote
              </button>
            </div>
            <div className="mt-6 grid gap-3">
              <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Driver wage</p>
                <p className="mt-2 text-xl font-semibold text-white">BWP {driverWage.toFixed(2)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Suggested fair quote</p>
                <p className="mt-2 text-2xl font-semibold text-white">BWP {suggestedQuote.toFixed(2)}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-400">{assistantNote}</p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Saved quote summary</p>
              {savedQuote ? (
                <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-300">{savedQuote}</pre>
              ) : (
                <p className="mt-3 text-sm text-slate-400">Request a quote to save a summary and prefill the contact form.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function SwiftLoadLanding() {
  const reducedMotion = useReducedMotion()
  const revealCounterRef = useRef(0)
  const [pendingQuoteSummary, setPendingQuoteSummary] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem('swiftload-quote-summary')
    if (stored) {
      setPendingQuoteSummary(stored)
    }
  }, [])

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_42%)] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[rgba(8,14,26,0.9)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-[0.2em] text-white">SWIFTLOAD</Link>
          <nav className="flex items-center gap-6 text-sm text-slate-300">
            <a href="#features" className="transition hover:text-amber-400">Features</a>
            <a href="#contact" className="transition hover:text-amber-400">Contact</a>
            <Link href="/about" className="rounded-full border border-white/10 px-3 py-1.5 text-amber-400 transition hover:border-amber-400/40 hover:bg-amber-400/10">About us</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="section-label text-xs uppercase tracking-[0.3em]">SwiftLoad</p>
          <h1 className="t-h2 mb-6 text-white">Africa&apos;s Intelligent Logistics Operating System.</h1>
          <p className="max-w-2xl text-lg text-slate-300">
            SwiftLoad is a logistics-matching platform connecting businesses, farmers, transport providers, and customers across Botswana.
          </p>
          <p className="mt-4 max-w-2xl text-base text-slate-400">
            SwiftLoad launched as a logistics service powered by software, with bookings coordinated personally while the software supports dispatch, live tracking, proof of delivery, communication, payments, and analytics.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/about" className="btn btn-amber btn-md">Learn more</Link>
            <a href="#features" className="btn btn-ghost btn-md">Explore features</a>
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 shadow-2xl shadow-black/30">
          <Image src="https://pyiduregtpbynsjrnhua.supabase.co/storage/v1/object/public/site-assets/05_Social_Media_Stack/social_media_stack_optionA.jpg" alt="SwiftLoad ecosystem visuals and social sharing assets" width={900} height={800} className="h-full w-full object-cover" priority />
        </div>
      </section>

      <FuelAndTripCalculator onQuoteRequest={(summary) => setPendingQuoteSummary(summary)} />

      <section id="features" className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 max-w-3xl">
          <p className="section-label text-xs uppercase tracking-[0.3em]">Phase 1 segments</p>
          <h2 className="t-h3 text-white">Built around the current priority sectors in Botswana.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              body={feature.body}
              image={feature.image}
              revealCounterRef={revealCounterRef}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-8 shadow-xl shadow-black/20">
            <h2 className="t-h3 mb-4 text-white">Contact</h2>
            <ul className="space-y-3 text-sm text-slate-300">
              <li><span className="font-semibold text-white">Email:</span> <a href="mailto:Prontoswift@proton.me" className="text-amber-400 hover:underline">Prontoswift@proton.me</a></li>
              <li><span className="font-semibold text-white">X (Twitter):</span> Pronto Swift Load — @ProntoSwift</li>
              <li><span className="font-semibold text-white">Facebook:</span> Pronto Swiftloads</li>
              <li><span className="font-semibold text-white">LinkedIn:</span> Pronto SwiftLoad</li>
            </ul>
          </div>
          <ContactForm defaultMessage={pendingQuoteSummary} />
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-slate-400">
        <p>SwiftLoad — Africa&apos;s Intelligent Logistics Operating System.</p>
      </footer>
    </main>
  )
}
