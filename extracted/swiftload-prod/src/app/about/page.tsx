import Image from 'next/image'
import Link from 'next/link'
import { ContactForm } from '@/components/features/ContactForm'

const segments = [
  {
    title: 'Agriculture',
    description: 'Support for orchard owners, fruit and vegetable farmers, livestock farmers, poultry farms, feed suppliers, cooperatives, irrigation suppliers, fertilizer distributors, seed suppliers, and farm equipment dealers.',
    image: 'https://pyiduregtpbynsjrnhua.supabase.co/storage/v1/object/public/site-assets/01_Agriculture/agriculture_optionA.jpg',
  },
  {
    title: 'Driver Network',
    description: 'Verified professional driver profiles, a steady flow of jobs, secure escrow payments, and independent business growth.',
    image: 'https://pyiduregtpbynsjrnhua.supabase.co/storage/v1/object/public/site-assets/02_Driver_Recruitment/driver_recruitment_optionA.jpg',
  },
  {
    title: 'Business Customers',
    description: 'Centralized logistics management, real-time fleet visibility, live GPS tracking, digital proof of delivery, and operations analytics.',
    image: 'https://pyiduregtpbynsjrnhua.supabase.co/storage/v1/object/public/site-assets/03_Business_Customers/business_customers_optionA.jpg',
  },
  {
    title: 'Transport Company Partners',
    description: 'Fleet optimization software, direct freight matching, SADC-wide corridor access, and multi-vehicle dashboards.',
    image: 'https://pyiduregtpbynsjrnhua.supabase.co/storage/v1/object/public/site-assets/04_Transport_Companies/transport_companies_optionA.jpg',
  },
  {
    title: 'Platform Ecosystem',
    description: 'A verified transport network, transparent escrow safeguards, live route milestones, and AI-powered dispatch assistance.',
    image: 'https://pyiduregtpbynsjrnhua.supabase.co/storage/v1/object/public/site-assets/05_Social_Media_Stack/social_media_stack_optionA.jpg',
  },
]

const phaseTwo = ['Construction (sand, bricks, cement)', 'Wholesale & Retail (furniture, appliances, FMCG distribution)', 'Manufacturing (factory shipments, industrial supplies)']
const phaseThree = ['Mining support logistics', 'Enterprise fleet management', 'Government logistics', 'Long-haul and cross-border (SADC) transport', 'Courier and parcel delivery']
const goals = [
  '20–30 active business customers with recurring transport needs',
  '100+ verified drivers across vehicle categories',
  '10 transport company partners',
  '500+ successful deliveries',
  '95%+ on-time delivery rate',
  'Strong customer satisfaction, repeat bookings, and case studies from the agriculture sector',
]

export const dynamic = 'force-static'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.12),_transparent_40%)] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[rgba(8,14,26,0.9)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-[0.2em] text-white">SWIFTLOAD</Link>
          <nav className="flex items-center gap-6 text-sm text-slate-300">
            <Link href="/" className="transition hover:text-amber-400">Home</Link>
            <Link href="/#features" className="transition hover:text-amber-400">Features</Link>
            <Link href="/#contact" className="transition hover:text-amber-400">Contact</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="section-label text-xs uppercase tracking-[0.3em]">About SwiftLoad</p>
          <h1 className="t-h2 mb-6 text-white">Africa&apos;s Intelligent Logistics Operating System.</h1>
          <p className="max-w-2xl text-lg text-slate-300">
            SwiftLoad is a logistics-matching platform connecting businesses, farmers, transport providers, and customers across Botswana.
          </p>
          <p className="mt-4 max-w-2xl text-base text-slate-400">
            SwiftLoad launched as a logistics service powered by software, with bookings coordinated personally while the platform handles dispatch, tracking, proof of delivery, communication, payments, and analytics.
          </p>
        </div>
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 shadow-2xl">
          <Image src="https://pyiduregtpbynsjrnhua.supabase.co/storage/v1/object/public/site-assets/05_Social_Media_Stack/social_media_stack_optionA.jpg" alt="SwiftLoad ecosystem visuals for social media and marketing" width={800} height={720} className="h-full w-full object-cover" priority />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-8 shadow-xl">
          <h2 className="t-h3 mb-4 text-white">Our Story / Launch Philosophy</h2>
          <p className="text-slate-300">
            SwiftLoad did not launch as a pure app. It launched as a logistics service powered by software. Bookings can be coordinated personally, including by phone or WhatsApp, while the software becomes the operational backbone for booking management, driver assignment, live tracking, proof of delivery, customer communication, payments, and performance analytics.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-8 shadow-xl">
          <h2 className="t-h3 mb-4 text-white">How We Work Today</h2>
          <p className="text-slate-300">
            Today, the model is concierge-led: SwiftLoad coordinates bookings personally, then uses software to manage dispatch, live tracking, proof of delivery, payments, and performance analytics.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="t-h3 text-white">Who We Serve (Phase 1)</h2>
          <p className="text-sm text-slate-400">Current priority sectors</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {segments.map((segment) => (
            <article key={segment.title} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-lg">
              <Image src={segment.image} alt={segment.title} width={640} height={420} className="h-48 w-full object-cover" />
              <div className="p-6">
                <h3 className="mb-3 text-lg font-semibold text-white">{segment.title}</h3>
                <p className="text-sm text-slate-400">{segment.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-3xl border border-amber-400/20 bg-amber-500/10 p-8 shadow-xl">
          <h2 className="t-h3 mb-4 text-white">Founding 100</h2>
          <p className="text-slate-300">
            SwiftLoad is recruiting 100 verified drivers, 100 businesses, and 10 transport companies as founding members.
          </p>
          <p className="mt-3 text-slate-300">
            Founding member perks include a Founding Member badge, early feature access, priority support, introductory pricing, and in-platform recognition.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-8 shadow-xl">
            <h2 className="t-h3 mb-4 text-white">Where We&apos;re Headed</h2>
            <div className="space-y-4 text-slate-300">
              <div>
                <h3 className="mb-2 font-semibold text-white">Phase 2 — coming next</h3>
                <ul className="list-disc space-y-2 pl-5 text-sm">
                  {phaseTwo.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-white">Phase 3 — long-term horizon</h3>
                <ul className="list-disc space-y-2 pl-5 text-sm">
                  {phaseThree.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-8 shadow-xl">
            <h2 className="t-h3 mb-4 text-white">Our Goals</h2>
            <p className="mb-4 text-sm text-slate-400">Targets for the first year</p>
            <ul className="space-y-3 text-slate-300">
              {goals.map((goal) => <li key={goal} className="rounded-xl border border-white/10 bg-slate-900/80 p-3 text-sm">{goal}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-8 shadow-xl">
            <h2 className="t-h3 mb-4 text-white">Contact</h2>
            <ul className="space-y-3 text-sm text-slate-300">
              <li><span className="font-semibold text-white">Email:</span> <a href="mailto:Prontoswift@proton.me" className="text-amber-400 hover:underline">Prontoswift@proton.me</a></li>
              <li><span className="font-semibold text-white">X (Twitter):</span> Pronto Swift Load — @ProntoSwift</li>
              <li><span className="font-semibold text-white">Facebook:</span> Pronto Swiftloads</li>
              <li><span className="font-semibold text-white">LinkedIn:</span> Pronto SwiftLoad</li>
            </ul>
          </div>
          <ContactForm />
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-slate-400">
        <p>SwiftLoad — Africa&apos;s Intelligent Logistics Operating System.</p>
      </footer>
    </main>
  )
}
