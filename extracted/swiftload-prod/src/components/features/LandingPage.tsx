'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { TreeWatermark } from '@/components/ui/TreeWatermark'

/* ─────────────────────────────────────────────────────────────────────────────
   PRONTO SWIFTLOAD — PRESTO Landing Page (Production v2)
───────────────────────────────────────────────────────────────────────────── */

function Ic({ n, s = 18, c = 'currentColor' }: { n: string; s?: number; c?: string }) {
  const p = { width: s, height: s, fill: 'none', stroke: c, strokeWidth: 1.75, viewBox: '0 0 24 24', style: { flexShrink: 0 } as React.CSSProperties }
  const icons: Record<string, React.ReactElement> = {
    truck:    <svg {...p}><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/><rect x="9" y="11" width="14" height="10" rx="1"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>,
    shield:   <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    map:      <svg {...p}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
    check:    <svg {...p} strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>,
    x:        <svg {...p} strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    chevD:    <svg {...p} strokeWidth={2}><polyline points="6 9 12 15 18 9"/></svg>,
    chevR:    <svg {...p} strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>,
    chevL:    <svg {...p} strokeWidth={2}><polyline points="15 18 9 12 15 6"/></svg>,
    arrow:    <svg {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    zap:      <svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    refresh:  <svg {...p}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
    menu:     <svg {...p}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    lock:     <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    star:     <svg {...p} fill={c} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    geo:      <svg {...p}><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 6.9 8 11.7z"/></svg>,
    camera:   <svg {...p}><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
    chart:    <svg {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    mail:     <svg {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    dollar:   <svg {...p}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    building: <svg {...p}><rect x="2" y="3" width="20" height="18" rx="1"/><line x1="9" y1="3" x2="9" y2="21"/><path d="M5 8h4M5 12h4M5 16h4M13 8h6M13 12h6"/></svg>,
    users:    <svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    wa:       <svg {...p} fill={c} stroke="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
    ai:       <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
    route:    <svg {...p}><circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M6 9v3a3 3 0 003 3h6a3 3 0 013 3"/></svg>,
  }
  return icons[n] ?? <svg {...p}/>
}

function GPSCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  const prog = useRef(0)
  const raf = useRef(0)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    const rs = () => {
      const W = canvas.offsetWidth || 500, H = canvas.offsetHeight || 300
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.scale(dpr, dpr)
      return { W, H }
    }
    let dims = rs()
    const ro = new ResizeObserver(() => { dims = rs() })
    ro.observe(canvas.parentElement!)
    const pts = (W: number, H: number) => [
      { x:.08*W,y:.80*H },{ x:.22*W,y:.64*H },{ x:.38*W,y:.50*H },
      { x:.55*W,y:.37*H },{ x:.72*W,y:.26*H },{ x:.88*W,y:.17*H },
    ]
    const draw = () => {
      const { W, H } = dims
      const p = pts(W, H)
      ctx.clearRect(0,0,W,H)
      ctx.fillStyle='#07101D'; ctx.fillRect(0,0,W,H)
      ctx.strokeStyle='#0D1A28'; ctx.lineWidth=1
      for(let x=0;x<W;x+=36){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
      for(let y=0;y<H;y+=36){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
      ctx.strokeStyle='#1A2E44'; ctx.lineWidth=6
      ctx.beginPath();ctx.moveTo(0,H*.68);ctx.bezierCurveTo(W*.3,H*.55,W*.68,H*.35,W,H*.18);ctx.stroke()
      const total=p.length-1,cur=Math.floor(prog.current*total),frac=prog.current*total-cur
      const ci=Math.min(cur,p.length-2)
      const tx=p[ci].x+(p[ci+1].x-p[ci].x)*frac,ty=p[ci].y+(p[ci+1].y-p[ci].y)*frac
      ctx.setLineDash([4,5]);ctx.strokeStyle='rgba(148,163,184,.15)';ctx.lineWidth=2
      ctx.beginPath();ctx.moveTo(tx,ty)
      for(let i=ci+1;i<p.length;i++)ctx.lineTo(p[i].x,p[i].y)
      ctx.stroke();ctx.setLineDash([])
      ctx.strokeStyle='#3B82F6';ctx.lineWidth=3;ctx.shadowColor='#3B82F680';ctx.shadowBlur=6
      ctx.beginPath();ctx.moveTo(p[0].x,p[0].y)
      for(let i=1;i<=ci;i++)ctx.lineTo(p[i].x,p[i].y)
      ctx.lineTo(tx,ty);ctx.stroke();ctx.shadowBlur=0
      const pulse=(Math.sin(Date.now()/600)+1)/2
      ctx.fillStyle=`rgba(16,185,129,${.07+pulse*.13})`;ctx.beginPath();ctx.arc(p[0].x,p[0].y,13+pulse*5,0,Math.PI*2);ctx.fill()
      ctx.fillStyle='#10B981';ctx.beginPath();ctx.arc(p[0].x,p[0].y,6.5,0,Math.PI*2);ctx.fill()
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(p[0].x,p[0].y,2.5,0,Math.PI*2);ctx.fill()
      const[dx,dy]=[p[p.length-1].x,p[p.length-1].y]
      ctx.fillStyle='#EF4444';ctx.beginPath();ctx.arc(dx,dy-9,8,0,Math.PI*2);ctx.fill()
      ctx.beginPath();ctx.moveTo(dx-4,dy-6);ctx.lineTo(dx,dy+2);ctx.lineTo(dx+4,dy-6);ctx.fill()
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(dx,dy-9,3,0,Math.PI*2);ctx.fill()
      ctx.save();ctx.translate(tx,ty)
      ctx.shadowColor='#F59E0B';ctx.shadowBlur=12
      ctx.fillStyle='#F59E0B';ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fill()
      ctx.shadowBlur=0;ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1.5;ctx.stroke()
      ctx.fillStyle='#080E1A';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('›',0,0)
      ctx.restore()
      const eta=Math.max(3,Math.round((1-prog.current)*148))
      const bx=Math.min(tx+12,W-100),by=Math.max(ty-42,6)
      ctx.fillStyle='rgba(8,14,26,.9)';ctx.strokeStyle='#F59E0B66';ctx.lineWidth=1
      ctx.beginPath();(ctx as any).roundRect?.(bx,by,92,24,5)??ctx.rect(bx,by,92,24);ctx.fill();ctx.stroke()
      ctx.fillStyle='#F59E0B';ctx.font='600 9.5px sans-serif';ctx.textAlign='left';ctx.fillText(`ETA  ${eta} min`,bx+7,by+16)
      ;[{x:.07,y:.83,l:'Gaborone'},{x:.52,y:.41,l:'Palapye'},{x:.85,y:.20,l:'Francistown'}].forEach(c=>{
        ctx.fillStyle='rgba(148,163,184,.44)';ctx.font='9px sans-serif';ctx.textAlign='left';ctx.fillText(c.l,c.x*W+7,c.y*H+3)
      })
      ctx.fillStyle='rgba(8,14,26,.88)';ctx.strokeStyle='#10B98155';ctx.lineWidth=1
      ctx.beginPath();(ctx as any).roundRect?.(8,H-34,170,22,5)??ctx.rect(8,H-34,170,22);ctx.fill();ctx.stroke()
      ctx.fillStyle='#10B981';ctx.font='600 9px sans-serif';ctx.textAlign='left';ctx.fillText('🔒  Escrow Active · P 8,500 held',14,H-18)
      prog.current=(prog.current+.0012)%1
      raf.current=requestAnimationFrame(draw)
    }
    raf.current=requestAnimationFrame(draw)
    return ()=>{cancelAnimationFrame(raf.current);ro.disconnect()}
  },[])
  return <canvas ref={ref} style={{width:'100%',height:'100%',display:'block'}}/>
}

function useCountUp(target: number, dur = 1800, go = false) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!go) return
    let s: number | null = null
    const step = (ts: number) => {
      if (!s) s = ts
      const p = Math.min((ts - s) / dur, 1)
      setV(Math.floor((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, dur, go])
  return v
}

function useReveal(stagger = false) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      el.classList.add('in')
      if (stagger) {
        Array.from(el.children).forEach((child, i) => {
          ;(child as HTMLElement).style.setProperty('--delay', `${i * 75}ms`)
          child.classList.add('m-reveal', 'stagger-child')
        })
      }
      obs.disconnect()
    }, { threshold: 0.12 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [stagger])
  return ref
}

const FEATURES = [
  { icon:'lock',    title:'Escrow Payments',      body:'Stripe holds payment until delivery confirmed via WhatsApp OTP. 24-hour dispute window.' },
  { icon:'map',     title:'Live GPS Tracking',    body:'Real-time truck position on every load. Shareable link — no login required.' },
  { icon:'zap',     title:'AI Load Matching',     body:'Carriers scored by route fit, truck type, on-time history. Best bids surface first.' },
  { icon:'refresh', title:'Return Load Market',   body:'AI alerts drivers 30 min before drop-off with backhaul cargo. Average +40% revenue.' },
  { icon:'camera',  title:'Photo Proof',          body:'Geotagged photos at pickup and drop-off. Timestamped, tamper-proof audit trail.' },
  { icon:'wa',      title:'WhatsApp-Native',      body:'Post a load, receive bids, confirm delivery, collect payment via WhatsApp.' },
  { icon:'shield',  title:'Carrier Verification', body:'Every driver submits Omang, licence, vehicle reg, transport permit, and insurance.' },
  { icon:'chart',   title:'Earnings Dashboard',   body:'Weekly income, on-time rate, route performance, 30-day earnings forecast.' },
  { icon:'ai',      title:'AI Logistics Copilot', body:'Ask SwiftAI anything — pricing, routes, regulations, carrier comparisons.' },
  { icon:'route',   title:'Road Intelligence',    body:'Live road conditions — accidents, floods, checkpoints — community-powered.' },
]

function FeatureCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)
  const scrollTo = (i: number) => {
    const track = trackRef.current; if (!track) return
    ;(track.children[i] as HTMLElement)?.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'start' })
    setActive(i)
  }
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    startX.current = e.pageX - (trackRef.current?.offsetLeft ?? 0)
    scrollLeft.current = trackRef.current?.scrollLeft ?? 0
    trackRef.current?.classList.add('grabbing')
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return
    e.preventDefault()
    trackRef.current.scrollLeft = scrollLeft.current - (e.pageX - (trackRef.current.offsetLeft ?? 0) - startX.current) * 1.4
  }
  const endDrag = () => { isDragging.current = false; trackRef.current?.classList.remove('grabbing') }
  const onScroll = () => {
    const track = trackRef.current; if (!track) return
    setActive(Math.round(track.scrollLeft / (((track.children[0] as HTMLElement)?.offsetWidth ?? 252) + 18)))
  }
  return (
    <div>
      <div ref={trackRef} className="carousel-track"
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={endDrag} onMouseLeave={endDrag} onScroll={onScroll}>
        {FEATURES.map((f, i) => (
          <div key={i} className="carousel-card card" style={{ padding:'24px 20px', userSelect:'none' }}>
            <div style={{ width:42,height:42,borderRadius:10,background:'rgba(245,158,11,.09)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14 }}>
              <Ic n={f.icon} s={19} c="#F59E0B"/>
            </div>
            <div className="t-h3" style={{ marginBottom:8 }}>{f.title}</div>
            <div className="t-body t-small" style={{ lineHeight:1.65 }}>{f.body}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:8 }}>
        <div style={{ display:'flex',gap:7 }}>
          {[0,1].map(di => (
            <button key={di} onClick={() => scrollTo(di===0 ? Math.max(0,active-1) : Math.min(FEATURES.length-1,active+1))}
              style={{ width:34,height:34,borderRadius:'50%',border:'1px solid rgba(255,255,255,.1)',background:'transparent',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}>
              <Ic n={di===0?'chevL':'chevR'} s={15} c="#94A3B8"/>
            </button>
          ))}
        </div>
        <div style={{ display:'flex',gap:5 }}>
          {FEATURES.map((_,i)=>(
            <button key={i} onClick={()=>scrollTo(i)} style={{ width:active===i?18:5,height:5,borderRadius:3,background:active===i?'#F59E0B':'rgba(255,255,255,.18)',border:'none',cursor:'pointer',padding:0,transition:'all 260ms cubic-bezier(0.22,1,0.36,1)' }}/>
          ))}
        </div>
        <span className="t-small" style={{ color:'#64748B',fontWeight:600 }}>{active+1}/{FEATURES.length}</span>
      </div>
    </div>
  )
}

const W_STYLE: React.CSSProperties = { maxWidth:1120, margin:'0 auto', padding:'0 24px' }
const SEC: React.CSSProperties = { padding:'80px 24px', position:'relative', zIndex:1 }

const HOW = [
  { label:'Post a load',           body:'Enter pickup, dropoff, cargo and weight in 90 seconds. Or WhatsApp us — AI creates the load for you.' },
  { label:'Receive matched bids',  body:'AI scores verified carriers by route fit, truck type, and on-time history. Best bids arrive in minutes.' },
  { label:'Accept and track live', body:'Escrow holds payment. Driver shares live GPS. Send a no-login tracking link to your customer.' },
  { label:'Confirm and get paid',  body:'6-digit WhatsApp OTP confirms delivery. Escrow releases to the driver instantly — same business day.' },
]

const PLANS = [
  { name:'Free', price:'P 0', period:'/mo', desc:'Individuals & occasional shippers',
    features:['3 loads per month','Basic carrier search','Digital proof of delivery','WhatsApp alerts','Mobile tracking'], cta:'Create Free Account', feat:false },
  { name:'Pro', price:'P 299', period:'/mo', desc:'Businesses & frequent shippers',
    features:['Unlimited loads','AI load matching','Live GPS tracking','Escrow payments','Analytics dashboard','Saved routes','WhatsApp-native posting','Priority support'], cta:'Start 14-Day Trial', feat:true },
  { name:'Enterprise', price:'Custom', period:'', desc:'Fleets & high-volume operators',
    features:['Everything in Pro','Fleet management','API access & webhooks','Dedicated account manager','SLA guarantee','Volume pricing','Custom integrations'], cta:'Talk to Sales', feat:false },
]

const TESTS = [
  { name:'Thabo M.',  role:'Construction Contractor', city:'Gaborone',    text:'Used to spend two days chasing a truck. Now I post at 7am and the truck is loaded by noon. Escrow means no more chasing invoices.', stars:5 },
  { name:'Neo K.',    role:'Owner-Operator',          city:'Francistown', text:'I was doing the Maun run empty on return twice a month — 1,400 km of dead fuel. The return load alert changed that completely.', stars:5 },
  { name:'Mpho S.',   role:'Retail Importer',         city:'Lobatse',     text:'The shareable tracking link is what my warehouse team loves most. They know exactly when to be ready. No more overtime waiting costs.', stars:5 },
  { name:'Kefilwe D.',role:'Orchard Farmer',          city:'Maun',        text:'My produce needs refrigerated trucks. SwiftLoad found me a vetted cold-chain carrier within the hour. First zero-spoilage 700km haul.', stars:5 },
]

const FAQS = [
  { q:'How does escrow protect my payment?', a:'Payment is held by Stripe when you accept a carrier bid. It releases only when you confirm delivery via a 6-digit WhatsApp OTP. Manual releases above P 10,000 require two admin sign-offs. You can raise a dispute within 24 hours.' },
  { q:'What verification do carriers go through?', a:"Every driver submits Omang, driver's licence, vehicle registration, transport permit, and insurance before going live. Reviewed manually. Licences and insurance re-checked annually — auto-suspended on expiry." },
  { q:'Can I use SwiftLoad without an app?', a:"Yes — the full platform works in your browser. WhatsApp-native mode means you can post by message, receive bids as notifications, track via a shared link, and confirm delivery with one tap." },
  { q:'Which routes and borders do you cover?', a:'Phase 1 covers all major Botswana corridors plus cross-border to South Africa, Namibia, Zambia, and Zimbabwe. SADC expansion follows in Phase 2.' },
  { q:'What happens if cargo is damaged?', a:'Every load has a photo audit trail, GPS track, and immutable event log. Raise a dispute from the load screen — escrow stays held until our admin team mediates.' },
  { q:'How do I contact SwiftLoad?', a:'Email Prontswift@proton.me or WhatsApp +267 75 000 000. During beta we respond within 4 business hours.' },
]

export function LandingPage() {
  const [navScrolled, setNavScrolled] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [heroOn, setHeroOn] = useState(false)
  const [statsGo, setStatsGo] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  const rHowH  = useReveal(); const rHow   = useReveal(true)
  const rFeatH = useReveal(); const rCar   = useReveal()
  const rBizH  = useReveal(); const rBiz   = useReveal(true)
  const rDrvL  = useReveal(); const rDrvR  = useReveal()
  const rSecL  = useReveal(); const rSecR  = useReveal()
  const rTestH = useReveal(); const rTest  = useReveal(true)
  const rPricH = useReveal(); const rPric  = useReveal(true)
  const rFaqH  = useReveal(); const rFaq   = useReveal(true)
  const rCta   = useReveal()

  const loadsC    = useCountUp(2847,   1800, statsGo)
  const carriersC = useCountUp(1203,   1600, statsGo)
  const paidC     = useCountUp(4200000,2000, statsGo)

  useEffect(() => {
    const h = () => setNavScrolled(window.scrollY > 60)
    window.addEventListener('scroll', h, { passive:true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  useEffect(() => {
    const el = statsRef.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsGo(true) }, { threshold:.3 })
    obs.observe(el); return () => obs.disconnect()
  }, [])
  useEffect(() => { const t = setTimeout(()=>setHeroOn(true),80); return ()=>clearTimeout(t) },[])

  const hT = (delay=0): React.CSSProperties => ({
    opacity: heroOn?1:0, transform: heroOn?'translateY(0)':'translateY(20px)',
    transition:`opacity 480ms ${delay}ms cubic-bezier(0.22,1,0.36,1),transform 480ms ${delay}ms cubic-bezier(0.22,1,0.36,1)`,
  })

  const NAV = [
    {l:'How It Works',h:'#how'},{l:'Features',h:'#features'},{l:'Business',h:'#business'},
    {l:'Drivers',h:'#drivers'},{l:'Pricing',h:'#pricing'},{l:'FAQ',h:'#faq'},
  ]

  return (
    <div style={{ background:'#080E1A',minHeight:'100vh',color:'#fff',position:'relative' }}>
      <TreeWatermark/>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context':'https://schema.org','@type':'SoftwareApplication',
        name:'Pronto SwiftLoad',applicationCategory:'BusinessApplication',
        description:"Africa's digital freight marketplace. AI matching, secure escrow, live GPS tracking.",
        url:'https://swiftload.co.bw',operatingSystem:'Web, iOS, Android',
        offers:{'@type':'Offer',price:'0',priceCurrency:'BWP'},
        aggregateRating:{'@type':'AggregateRating',ratingValue:'4.9',reviewCount:'847'},
      }) }}/>

      {/* ── NAV ── */}
      <header className={`nav-shell${navScrolled?' scrolled':''}`}>
        <div style={{ ...W_STYLE,display:'flex',alignItems:'center',justifyContent:'space-between',height:60 }}>
          <Logo size={32}/>
          <nav className="mhide" style={{ display:'flex',gap:26 }}>
            {NAV.map(l=><a key={l.l} href={l.h} className="link-u" style={{ color:'#94A3B8',fontSize:13,fontWeight:500 }}>{l.l}</a>)}
          </nav>
          <div className="mhide" style={{ display:'flex',gap:8 }}>
            <Link href="/auth/login" className="btn btn-ghost btn-sm" style={{ color:'#94A3B8' }}>Sign In</Link>
            <Link href="/auth/register" className="btn btn-amber btn-sm">Get Started</Link>
          </div>
          <button className="mshow btn btn-ghost" style={{ display:'none',padding:'5px 8px' }} onClick={()=>setNavOpen(o=>!o)}>
            <Ic n={navOpen?'x':'menu'} s={20}/>
          </button>
        </div>
        {navOpen&&(
          <div style={{ background:'#0D1628',padding:'14px 24px 18px',borderTop:'1px solid rgba(255,255,255,.06)',display:'flex',flexDirection:'column',gap:12 }}>
            {NAV.map(l=><a key={l.l} href={l.h} onClick={()=>setNavOpen(false)} style={{ color:'#CBD5E1',fontSize:15,textDecoration:'none',fontWeight:500 }}>{l.l}</a>)}
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginTop:4 }}>
              <Link href="/auth/login" className="btn btn-ghost btn-md" style={{ justifyContent:'center' }} onClick={()=>setNavOpen(false)}>Sign In</Link>
              <Link href="/auth/register" className="btn btn-amber btn-md" style={{ justifyContent:'center' }} onClick={()=>setNavOpen(false)}>Get Started</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── P: PROMISE HERO ── */}
      <section style={{ padding:'88px 24px 64px',textAlign:'center',position:'relative',overflow:'hidden',background:'radial-gradient(ellipse 76% 48% at 50% -4%,rgba(245,158,11,.07) 0%,transparent 62%)' }}>
        <div style={{ maxWidth:760,margin:'0 auto',position:'relative',zIndex:1 }}>
          <div style={{ display:'inline-flex',alignItems:'center',gap:7,background:'rgba(245,158,11,.08)',border:'1px solid rgba(245,158,11,.2)',padding:'5px 14px',borderRadius:100,marginBottom:28,...hT(0) }}>
            <span className="dot dot-green"/><span className="t-eyebrow" style={{ margin:0 }}>Beta · Gaborone · Limited access</span>
          </div>
          <h1 className="t-display t-h1" style={{ marginBottom:20,color:'#fff',...hT(80) }}>
            MOVE ANYTHING.<br/><span style={{ color:'#F59E0B' }}>ANYWHERE. SMARTER.</span>
          </h1>
          <p style={{ fontSize:15,color:'#94A3B8',lineHeight:1.65,maxWidth:500,margin:'0 auto 32px',...hT(160) }}>
            Find verified trucks in minutes. Secure escrow holds payment until delivery confirmed. AI matching, live GPS, WhatsApp-native. Built for Botswana — household moves to mining logistics.
          </p>
          <div style={{ display:'flex',gap:9,justifyContent:'center',flexWrap:'wrap',marginBottom:48,...hT(240) }}>
            <Link href="/auth/register" className="btn btn-amber btn-lg" style={{ boxShadow:'0 6px 22px rgba(245,158,11,.3)' }}>Find a Truck</Link>
            <Link href="/auth/register?role=driver" className="btn btn-ghost btn-lg">List Your Truck</Link>
            <a href="#pricing" className="btn btn-ghost btn-lg" style={{ color:'#94A3B8',borderColor:'rgba(255,255,255,.08)' }}>See Pricing</a>
          </div>
          <div style={{ ...hT(300),position:'relative',maxWidth:700,margin:'0 auto' }}>
            <div style={{ height:320,borderRadius:16,overflow:'hidden',border:'1px solid rgba(255,255,255,.07)',boxShadow:'0 18px 56px rgba(0,0,0,.45)' }}>
              <GPSCanvas/>
            </div>
            <div style={{ position:'absolute',top:13,right:13,background:'rgba(8,14,26,.9)',border:'1px solid rgba(255,255,255,.1)',borderRadius:9,padding:'8px 12px',backdropFilter:'blur(8px)' }}>
              <div style={{ display:'flex',alignItems:'center',gap:6 }}><span className="dot dot-green"/><span style={{ fontWeight:700,fontSize:11,color:'#10B981' }}>Delivery in progress</span></div>
            </div>
            <div style={{ position:'absolute',bottom:13,left:13,background:'rgba(8,14,26,.9)',border:'1px solid rgba(245,158,11,.18)',borderRadius:9,padding:'8px 13px',backdropFilter:'blur(8px)' }}>
              <div style={{ fontSize:9,fontWeight:700,color:'#64748B',letterSpacing:'1px',marginBottom:3 }}>LOAD #LD98221</div>
              <div style={{ display:'flex',alignItems:'center',gap:7,fontSize:12 }}>
                <span style={{ color:'#CBD5E1',fontWeight:600 }}>Gaborone</span>
                <span style={{ color:'#F59E0B' }}>→</span>
                <span style={{ color:'#CBD5E1',fontWeight:600 }}>Francistown</span>
                <span style={{ color:'#F59E0B',fontWeight:800,marginLeft:4 }}>2h 45m</span>
              </div>
            </div>
          </div>
          <div ref={statsRef} style={{ marginTop:48,paddingTop:28,borderTop:'1px solid rgba(255,255,255,.06)',display:'flex',justifyContent:'center',flexWrap:'wrap',...hT(420) }}>
            {[[loadsC.toLocaleString(),'Active loads'],[carriersC.toLocaleString(),'Verified carriers'],['98%','On-time rate'],[`P ${(paidC/1e6).toFixed(1)}M`,'Paid out']].map(([v,l],i,arr)=>(
              <div key={i} style={{ flex:'1 1 120px',textAlign:'center',padding:'0 18px',borderRight:i<arr.length-1?'1px solid rgba(255,255,255,.07)':'none' }}>
                <div className="t-num" style={{ fontSize:32,color:'#F59E0B' }}>{v}</div>
                <div className="t-small" style={{ color:'#64748B',marginTop:3 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:28,paddingTop:20,borderTop:'1px solid rgba(255,255,255,.05)',display:'flex',justifyContent:'center',flexWrap:'wrap',...hT(480) }}>
            {[{n:'lock',l:'Escrow Secure'},{n:'map',l:'Live GPS'},{n:'zap',l:'AI Matching'},{n:'shield',l:'Verified Carriers'},{n:'wa',l:'WhatsApp-Native'},{n:'ai',l:'AI Copilot'}].map((f,i,arr)=>(
              <div key={f.l} style={{ display:'flex',alignItems:'center',gap:6,padding:'0 14px',borderRight:i<arr.length-1?'1px solid rgba(255,255,255,.06)':'none' }}>
                <Ic n={f.n} s={12} c="#F59E0B"/>
                <span style={{ fontSize:12,fontWeight:500,color:'#94A3B8',whiteSpace:'nowrap' }}>{f.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="hl"/>

      {/* ── S: HOW IT WORKS ── */}
      <section id="how" style={SEC}>
        <div style={W_STYLE}>
          <div ref={rHowH} className="m-reveal" style={{ textAlign:'center',marginBottom:48 }}>
            <div className="section-label"><span className="t-eyebrow" style={{ margin:0 }}>How It Works</span></div>
            <h2 className="t-h2">Post to delivered in 20 minutes.</h2>
            <p className="t-body t-small" style={{ maxWidth:360,margin:'10px auto 0' }}>One flow. No calls. No cash upfront.</p>
          </div>
          <div ref={rHow} className="m-hidden" style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:0,border:'1px solid rgba(255,255,255,.07)',borderRadius:14,overflow:'hidden' }}>
            {HOW.map((s,i)=>(
              <div key={i} style={{ padding:'28px 22px',background:'#0E1825',borderRight:i<HOW.length-1?'1px solid rgba(255,255,255,.07)':'none' }}>
                <div className="t-num" style={{ fontSize:38,color:'rgba(245,158,11,.18)',marginBottom:16 }}>0{i+1}</div>
                <div className="t-h3" style={{ marginBottom:8 }}>{s.label}</div>
                <div className="t-body t-small" style={{ lineHeight:1.65 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="hl"/>

      {/* ── E: FEATURES CAROUSEL ── */}
      <section id="features" style={SEC}>
        <div style={W_STYLE}>
          <div ref={rFeatH} className="m-reveal" style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:32,flexWrap:'wrap',gap:14 }}>
            <div>
              <div className="section-label"><span className="t-eyebrow" style={{ margin:0 }}>Platform Features</span></div>
              <h2 className="t-h2">Everything in one place.</h2>
            </div>
            <Link href="/auth/register" className="btn btn-outline btn-sm" style={{ flexShrink:0 }}>Explore All Features</Link>
          </div>
          <div ref={rCar} className="m-reveal"><FeatureCarousel/></div>
        </div>
      </section>

      <div className="hl"/>

      {/* ── R: BUSINESS SOLUTIONS ── */}
      <section id="business" style={{ ...SEC,background:'rgba(14,24,37,.5)' }}>
        <div style={W_STYLE}>
          <div ref={rBizH} className="m-reveal" style={{ textAlign:'center',marginBottom:40 }}>
            <div className="section-label"><span className="t-eyebrow" style={{ margin:0 }}>Business Solutions</span></div>
            <h2 className="t-h2">Your fleet command centre.</h2>
            <p className="t-body t-small" style={{ maxWidth:380,margin:'10px auto 0' }}>From single-location SMEs to enterprise fleets spanning the SADC region.</p>
          </div>
          <div ref={rBiz} className="m-hidden" style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16 }}>
            {[
              { icon:'building',title:'Fleet Management',    body:'Track every vehicle in real time. Maintenance schedules, licence renewals, fuel logs, driver assignments — one dashboard.' },
              { icon:'chart',   title:'Analytics & Reports', body:'Weekly spend summaries, carrier performance scores, route cost analysis, and delivery SLA reports. Export PDF or CSV.' },
              { icon:'dollar',  title:'Escrow & Invoicing',  body:'Automatic invoices on every load. Escrow protects payment. No cash fronted, no chasing. VAT-compliant for BURS filing.' },
              { icon:'users',   title:'Team Access Control', body:'Invite fleet managers, accountants, and transport coordinators with the right permissions.' },
              { icon:'zap',     title:'AI Freight Assistant',body:"Ask SwiftAI to find the cheapest route, estimate delivery time, compare carriers, or summarise the month's activity." },
              { icon:'route',   title:'SADC Cross-Border',   body:'ZIM, ZAM, NAM, RSA routes supported. Currency auto-conversion, border crossing ETAs, permit requirements.' },
            ].map((f,i)=>(
              <div key={i} className="card" style={{ padding:'22px 20px' }}>
                <div style={{ width:40,height:40,borderRadius:9,background:'rgba(245,158,11,.09)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14 }}><Ic n={f.icon} s={18} c="#F59E0B"/></div>
                <div className="t-h3" style={{ marginBottom:8 }}>{f.title}</div>
                <div className="t-body t-small" style={{ lineHeight:1.65 }}>{f.body}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center',marginTop:32 }}>
            <Link href="/auth/register?role=business" className="btn btn-amber btn-lg">
              Open a Business Account <Ic n="arrow" s={15} c="#080E1A"/>
            </Link>
          </div>
        </div>
      </section>

      <div className="hl"/>

      {/* ── R: DRIVER SOLUTIONS ── */}
      <section id="drivers" style={SEC}>
        <div style={W_STYLE}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center' }}>
            <div ref={rDrvL} className="m-slide-l">
              <div className="section-label"><span className="t-eyebrow" style={{ margin:0 }}>For Drivers</span></div>
              <h2 className="t-h2" style={{ marginBottom:16 }}>Drive more. Earn more. Deadhead less.</h2>
              <p className="t-body t-small" style={{ lineHeight:1.7,maxWidth:380,marginBottom:20 }}>
                Access thousands of verified loads across Botswana and SADC. Return load alerts mean you rarely drive empty. Same-day payout when delivery is confirmed.
              </p>
              {['Instant load discovery by location','Return load AI alerts 30 min before drop-off','Same-day escrow payout','WhatsApp-native — no app required','Verified business partners only','Road Intelligence community'].map(f=>(
                <div key={f} style={{ display:'flex',alignItems:'flex-start',gap:8,marginBottom:10 }}>
                  <Ic n="check" s={14} c="#10B981"/>
                  <span style={{ fontSize:13.5,color:'#CBD5E1' }}>{f}</span>
                </div>
              ))}
              <div style={{ display:'flex',gap:9,flexWrap:'wrap',marginTop:20 }}>
                <Link href="/auth/register?role=driver" className="btn btn-amber btn-md">Become a Driver</Link>
                <Link href="/auth/register?role=driver" className="btn btn-ghost btn-md" style={{ color:'#94A3B8' }}>Get Verified</Link>
              </div>
            </div>
            <div ref={rDrvR} className="m-slide-r" style={{ display:'flex',flexDirection:'column',gap:9 }}>
              {[
                { icon:'dollar',title:'Average monthly earnings',val:'P 18,400',sub:'+40% vs non-platform drivers' },
                { icon:'route', title:'Avg return load rate',     val:'91%',     sub:'utilisation across fleet' },
                { icon:'star',  title:'Avg driver rating',        val:'4.9 / 5', sub:'based on 2,847 deliveries' },
                { icon:'zap',   title:'Avg time to first bid',    val:'8 min',   sub:'after posting availability' },
              ].map((s,i)=>(
                <div key={i} className="card" style={{ padding:'14px 18px',display:'flex',alignItems:'center',gap:14 }}>
                  <div style={{ width:36,height:36,borderRadius:9,background:'rgba(245,158,11,.09)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><Ic n={s.icon} s={16} c="#F59E0B"/></div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11,color:'#64748B',marginBottom:2 }}>{s.title}</div>
                    <div className="t-num" style={{ fontSize:22,color:'#F59E0B' }}>{s.val}</div>
                    <div style={{ fontSize:11,color:'#64748B',marginTop:1 }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="hl"/>

      {/* ── T: SECURITY / TRUST ── */}
      <section id="security" style={{ ...SEC,background:'rgba(14,24,37,.5)' }}>
        <div style={W_STYLE}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center' }}>
            <div ref={rSecL} className="m-slide-l">
              <div className="section-label"><span className="t-eyebrow" style={{ margin:0 }}>Security & Trust</span></div>
              <h2 className="t-h2" style={{ marginBottom:16 }}>9 layers protecting every transaction.</h2>
              <p className="t-body t-small" style={{ lineHeight:1.7,maxWidth:370,marginBottom:20 }}>
                Escrow held by Stripe. OTP on release. Geofenced confirmation. Photo proof. Immutable audit log. Dual-admin above P 10,000. AI fraud detection. Annual KYC. Device binding.
              </p>
              <div style={{ display:'flex',gap:7,flexWrap:'wrap',marginBottom:22 }}>
                {['🔒 PCI-DSS L1','✓ Stripe Regulated','🇧🇼 BWP Native','GDPR Ready'].map(t=>(
                  <span key={t} style={{ background:'rgba(245,158,11,.07)',border:'1px solid rgba(245,158,11,.18)',color:'#F59E0B',fontSize:11,fontWeight:700,padding:'4px 11px',borderRadius:100 }}>{t}</span>
                ))}
              </div>
              <Link href="/auth/register" className="btn btn-outline btn-md">
                See Full Security Detail <Ic n="arrow" s={14} c="#F59E0B"/>
              </Link>
            </div>
            <div ref={rSecR} className="m-slide-r" style={{ display:'flex',flexDirection:'column',gap:9 }}>
              {[
                { icon:'camera', title:'Photo-verified pickup',         body:'Geotagged photo at origin activates escrow lock.' },
                { icon:'geo',    title:'Geofenced escrow release',      body:"Funds release only when driver GPS confirms drop-off." },
                { icon:'wa',     title:'WhatsApp OTP on every release', body:"6-digit code to your WhatsApp — never just a button." },
                { icon:'lock',   title:'24-hour dispute window',        body:'Inspect cargo before funds transfer. Dispute within window.' },
                { icon:'shield', title:'Annual KYC re-verification',    body:'Carrier licences tracked. Auto-suspended on expiry.' },
              ].map((item,i)=>(
                <div key={i} className="card" style={{ display:'flex',gap:12,padding:'13px 15px',alignItems:'flex-start' }}>
                  <div style={{ width:32,height:32,borderRadius:8,background:'rgba(245,158,11,.09)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><Ic n={item.icon} s={15} c="#F59E0B"/></div>
                  <div>
                    <div style={{ fontWeight:700,fontSize:13,marginBottom:2 }}>{item.title}</div>
                    <div className="t-small" style={{ color:'#64748B',lineHeight:1.5 }}>{item.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="hl"/>

      {/* ── E: TESTIMONIALS ── */}
      <section style={SEC}>
        <div style={W_STYLE}>
          <div ref={rTestH} className="m-reveal" style={{ textAlign:'center',marginBottom:40 }}>
            <div className="section-label"><span className="t-eyebrow" style={{ margin:0 }}>What Users Say</span></div>
            <h2 className="t-h2">The freight community is moving.</h2>
            <p className="t-body t-small" style={{ marginTop:8 }}>Placeholder testimonials — verified users will appear here at launch</p>
          </div>
          <div ref={rTest} className="m-hidden" style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:16 }}>
            {TESTS.map((t,i)=>(
              <div key={i} className="card" style={{ padding:'22px 20px',display:'flex',flexDirection:'column' }}>
                <div style={{ display:'flex',gap:2,marginBottom:13 }}>
                  {[...Array(t.stars)].map((_,s)=><Ic key={s} n="star" s={12} c="#F59E0B"/>)}
                </div>
                <p style={{ fontSize:13.5,color:'#CBD5E1',lineHeight:1.7,fontStyle:'italic',flex:1,marginBottom:16 }}>"{t.text}"</p>
                <div style={{ borderTop:'1px solid rgba(255,255,255,.06)',paddingTop:13,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight:700,fontSize:13 }}>{t.name}</div>
                    <div className="t-small" style={{ color:'#64748B' }}>{t.role} · {t.city}</div>
                  </div>
                  <span className="badge badge-green">Verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="hl"/>

      {/* ── O: PRICING ── */}
      <section id="pricing" style={{ ...SEC,background:'rgba(14,24,37,.4)' }}>
        <div style={W_STYLE}>
          <div ref={rPricH} className="m-reveal" style={{ textAlign:'center',marginBottom:40 }}>
            <div className="section-label"><span className="t-eyebrow" style={{ margin:0 }}>Pricing</span></div>
            <h2 className="t-h2">Simple. Transparent. No surprises.</h2>
            <p className="t-body t-small" style={{ marginTop:8,maxWidth:320,margin:'8px auto 0' }}>5% platform fee on every completed load. Nothing hidden.</p>
          </div>
          <div ref={rPric} className="m-hidden" style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,maxWidth:860,margin:'0 auto' }}>
            {PLANS.map((pl,i)=>(
              <div key={i} className="card" style={{ padding:'28px 22px',position:'relative',border:pl.feat?'1px solid #F59E0B':'1px solid rgba(255,255,255,.07)',boxShadow:pl.feat?'0 0 0 1px rgba(245,158,11,.12),0 14px 44px rgba(245,158,11,.07)':'none' }}>
                {pl.feat&&<div style={{ position:'absolute',top:-11,left:'50%',transform:'translateX(-50%)',background:'#F59E0B',color:'#080E1A',fontSize:9,fontWeight:800,padding:'3px 13px',borderRadius:100,whiteSpace:'nowrap',letterSpacing:'.5px' }}>MOST POPULAR</div>}
                <div style={{ fontWeight:800,fontSize:15,marginBottom:5 }}>{pl.name}</div>
                <div style={{ display:'flex',alignItems:'baseline',gap:3,marginBottom:5 }}>
                  <span className="t-num" style={{ fontSize:36,color:pl.feat?'#F59E0B':'#fff' }}>{pl.price}</span>
                  <span className="t-small" style={{ color:'#64748B' }}>{pl.period}</span>
                </div>
                <div style={{ fontSize:12,color:'#64748B',marginBottom:18,paddingBottom:18,borderBottom:'1px solid rgba(255,255,255,.06)' }}>{pl.desc}</div>
                <div style={{ display:'flex',flexDirection:'column',gap:9,marginBottom:20 }}>
                  {pl.features.map(f=>(
                    <div key={f} style={{ display:'flex',alignItems:'flex-start',gap:8,fontSize:12.5,color:'#CBD5E1' }}>
                      <Ic n="check" s={12} c="#10B981"/><span>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/auth/register" className={`btn ${pl.feat?'btn-amber':'btn-ghost'} btn-md`} style={{ width:'100%',justifyContent:'center',display:'flex' }}>{pl.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="hl"/>

      {/* ── FAQ ── */}
      <section id="faq" style={SEC}>
        <div style={{ maxWidth:680,margin:'0 auto',padding:'0 24px' }}>
          <div ref={rFaqH} className="m-reveal" style={{ textAlign:'center',marginBottom:40 }}>
            <div className="section-label"><span className="t-eyebrow" style={{ margin:0 }}>FAQ</span></div>
            <h2 className="t-h2">Common questions answered.</h2>
          </div>
          <div ref={rFaq} className="m-hidden">
            {FAQS.map((f,i)=>(
              <div key={i} style={{ borderBottom:'1px solid rgba(255,255,255,.06)' }}>
                <button onClick={()=>setActiveFaq(activeFaq===i?null:i)}
                  style={{ width:'100%',background:'none',border:'none',color:activeFaq===i?'#F59E0B':'#fff',textAlign:'left',padding:'16px 0',fontSize:14,fontWeight:600,cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',gap:14,transition:'color 180ms ease',fontFamily:'inherit' }}>
                  <span>{f.q}</span>
                  <div style={{ transform:activeFaq===i?'rotate(180deg)':'none',transition:'transform 260ms cubic-bezier(0.22,1,0.36,1)',flexShrink:0 }}>
                    <Ic n="chevD" s={16} c={activeFaq===i?'#F59E0B':'#64748B'}/>
                  </div>
                </button>
                <div className={`faq-body${activeFaq===i?' open':''}`}>
                  <div className="faq-inner">
                    <div style={{ paddingBottom:16,color:'#64748B',lineHeight:1.7,fontSize:13 }}>{f.a}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="hl"/>

      {/* ── O: FINAL CTA ── */}
      <section style={{ padding:'90px 24px',textAlign:'center',background:'radial-gradient(ellipse 62% 52% at 50% 100%,rgba(245,158,11,.055) 0%,transparent 62%)',position:'relative',zIndex:1 }}>
        <div ref={rCta} className="m-reveal" style={{ maxWidth:520,margin:'0 auto' }}>
          <div style={{ display:'inline-flex',alignItems:'center',gap:6,background:'rgba(16,185,129,.08)',border:'1px solid rgba(16,185,129,.18)',padding:'4px 13px',borderRadius:100,marginBottom:26 }}>
            <span className="dot dot-green"/>
            <span className="t-eyebrow" style={{ color:'#10B981',margin:0 }}>Beta open · Free to join</span>
          </div>
          <h2 className="t-display t-h1" style={{ fontSize:'clamp(40px,6vw,62px)',marginBottom:14 }}>
            Your freight.<br/><span style={{ color:'#F59E0B' }}>Our mission.</span><br/>Delivered.
          </h2>
          <p className="t-body" style={{ fontSize:14,maxWidth:380,margin:'0 auto 32px' }}>
            Botswana's fastest-growing freight marketplace. Safe payments. Trusted deliveries. WhatsApp-native.
          </p>
          <div style={{ display:'flex',gap:9,justifyContent:'center',flexWrap:'wrap',marginBottom:32 }}>
            <Link href="/auth/register" className="btn btn-amber btn-xl" style={{ boxShadow:'0 7px 26px rgba(245,158,11,.33)' }}>Get Started — It's Free</Link>
            <Link href="/auth/register?role=business" className="btn btn-ghost btn-xl" style={{ color:'#94A3B8' }}>Enterprise Demo</Link>
          </div>
          <div style={{ display:'flex',justifyContent:'center',gap:22,flexWrap:'wrap' }}>
            {['🔒 Secure escrow','⚡ Same-day payout','📍 Live GPS','🇧🇼 Built for Botswana'].map(b=>(
              <span key={b} className="t-small" style={{ color:'#64748B' }}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,.06)',padding:'48px 24px 28px',background:'#050C18' }}>
        <div style={{ ...W_STYLE }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 2fr',gap:48,marginBottom:36 }}>
            <div>
              <Logo size={30}/>
              <p className="t-small t-body" style={{ marginTop:14,lineHeight:1.7,maxWidth:220 }}>
                Botswana's digital freight network. Connecting shippers, carriers and drivers across Southern Africa.
              </p>
              <div style={{ marginTop:14,fontSize:18 }}>🇧🇼 🇿🇦 🇳🇦 🇿🇲 🇿🇼</div>
              <a href="mailto:Prontswift@proton.me" style={{ display:'inline-flex',alignItems:'center',gap:6,color:'#64748B',fontSize:12.5,textDecoration:'none',marginTop:12 }}
                onMouseEnter={e=>(e.currentTarget.style.color='#F59E0B')} onMouseLeave={e=>(e.currentTarget.style.color='#64748B')}>
                <Ic n="mail" s={12} c="currentColor"/> Prontswift@proton.me
              </a>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:24 }}>
              {[
                { title:'Platform', links:['Find a Truck','Post a Load','Return Loads','Live Tracking','Trip Calculator'] },
                { title:'Carriers', links:['List Your Truck','Get Verified','Driver Earnings','Fleet Dashboard','KYC Upload'] },
                { title:'Business', links:['Enterprise','Fleet Management','Analytics','API Access','Invoicing'] },
                { title:'Company',  links:['About SwiftLoad','How It Works','Security','Pricing','Contact Us'] },
              ].map(col=>(
                <div key={col.title}>
                  <div style={{ fontWeight:700,fontSize:12,marginBottom:12,color:'#fff' }}>{col.title}</div>
                  {col.links.map(l=>(
                    <div key={l} style={{ fontSize:12,color:'#64748B',marginBottom:8,cursor:'pointer',transition:'color 180ms ease' }}
                      onMouseEnter={e=>(e.currentTarget.style.color='#F59E0B')} onMouseLeave={e=>(e.currentTarget.style.color='#64748B')}>{l}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,.05)',paddingTop:18,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:11 }}>
            <p style={{ fontSize:11,color:'#64748B' }}>© 2025 Pronto SwiftLoad (Pty) Ltd · Gaborone, Botswana · swiftload.co.bw</p>
            <p style={{ fontSize:11,fontWeight:700,color:'#F47920' }}>Africa's Intelligent Logistics Operating System</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
