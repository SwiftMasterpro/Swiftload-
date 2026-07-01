'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RoadReport, ReportType, Severity } from '@/types'
import { REPORT_TYPES } from '@/lib/utils/constants'
import { fmtAgo } from '@/lib/utils/format'
import { toast } from 'sonner'

/* ─────────────────────────────────────────────────────────────────────────────
   Road Intelligence — SwiftLoad's Flagship Innovation (per Master Guidelines §13)
   Legal note: This system provides operational road awareness ONLY.
   It does NOT encourage evasion of lawful checkpoints or any illegal activity.
   All reports are community-sourced and may not be accurate.
───────────────────────────────────────────────────────────────────────────── */

const SEVERITY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Low',      color: '#10B981' },
  2: { label: 'Moderate', color: '#F59E0B' },
  3: { label: 'High',     color: '#F47920' },
  4: { label: 'Serious',  color: '#EF4444' },
  5: { label: 'Critical', color: '#DC2626' },
}

export function RoadIntelligence() {
  const supabase = createClient()
  const [reports, setReports] = useState<RoadReport[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterType, setFilterType] = useState<string>('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Form state
  const [type, setType] = useState<ReportType>('traffic')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [route, setRoute] = useState('')
  const [severity, setSeverity] = useState<Severity>(2)
  const [anonymous, setAnonymous] = useState(false)
  const [locating, setLocating] = useState(false)
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      const [{ data: reps }, { data: { session } }] = await Promise.all([
        supabase.from('road_reports').select('*').eq('active', true).order('created_at', { ascending: false }).limit(30),
        supabase.auth.getSession(),
      ])
      setReports(reps ?? [])
      setIsLoggedIn(!!session)
      setLoading(false)
    }
    load()
  }, [])

  const getLocation = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); setLocating(false); toast.success('Location captured') },
      () => { setLocating(false); toast.error('Could not get your location — ensure location access is enabled') }
    )
  }

  const autoFillTitle = (t: string) => {
    const rt = REPORT_TYPES.find(r => r.id === t)
    if (rt && !title) setTitle(rt.label + (route ? ` — ${route}` : ''))
  }

  const submitReport = async () => {
    if (!lat || !lng) { toast.error('Location required — use the Get Location button'); return }
    if (!title) { toast.error('Please enter a title'); return }
    setSubmitting(true)
    const { data: { session } } = await supabase.auth.getSession()
    const expires = new Date(); expires.setHours(expires.getHours() + (severity >= 4 ? 6 : severity === 3 ? 4 : 2))
    const { error } = await supabase.from('road_reports').insert({
      reporter_id: anonymous ? null : (session?.user.id ?? null),
      type, title, description: desc || null, lat, lng, route: route || null,
      severity, anonymous, expires_at: expires.toISOString(),
      verified_count: 0, dismissed_count: 0, company_visible: true, active: true,
    })
    if (error) { toast.error(error.message); setSubmitting(false); return }
    toast.success('Report submitted. Thank you for keeping the roads safe! 🚛')
    setShowForm(false); setTitle(''); setDesc(''); setRoute(''); setLat(null); setLng(null); setSeverity(2)
    const { data: fresh } = await supabase.from('road_reports').select('*').eq('active', true).order('created_at', { ascending: false }).limit(30)
    setReports(fresh ?? [])
    setSubmitting(false)
  }

  const filtered = filterType ? reports.filter(r => r.type === filterType) : reports
  const rt = REPORT_TYPES

  return (
    <div style={{ padding: '0 24px 48px' }}>
      <div style={{ paddingTop: 32, marginBottom: 28 }}>
        <div className="t-eyebrow" style={{ marginBottom: 6 }}>Road Intelligence</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="t-h2">Live Road Conditions</h1>
            <p className="t-body t-small" style={{ marginTop: 4 }}>Community-powered alerts · Updated in real time · Drive informed</p>
          </div>
          <button onClick={() => isLoggedIn ? setShowForm(true) : toast.error('Sign in to report road conditions')} className="btn btn-amber btn-md">
            + Report Condition
          </button>
        </div>
      </div>

      {/* Legal disclaimer */}
      <div style={{ background: 'rgba(59,130,246,.06)', border: '1px solid rgba(59,130,246,.18)', borderRadius: 10, padding: '11px 16px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>ℹ️</span>
        <p style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.5, margin: 0 }}>
          <strong style={{ color: '#3B82F6' }}>Road Intelligence is for situational awareness only.</strong> Reports are community-submitted and may be inaccurate. Always comply with all lawful authority instructions. Do not use this system to evade checkpoints, roadblocks, or any law enforcement. SwiftLoad does not encourage or condone illegal activity.
        </p>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { l: 'Active Reports',    v: reports.length,                        c: '#F59E0B' },
          { l: 'Critical Alerts',   v: reports.filter(r=>r.severity>=4).length, c: '#EF4444' },
          { l: 'Verified',          v: reports.filter(r=>r.verified_count>0).length, c: '#10B981' },
        ].map(s => (
          <div key={s.l} className="card" style={{ padding: '14px 20px', flex: '1 1 120px' }}>
            <div className="t-num" style={{ fontSize: 26, color: s.c }}>{s.v}</div>
            <div className="t-small" style={{ color: '#64748B' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Type filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        <button onClick={() => setFilterType('')} className="btn btn-sm" style={{ background: !filterType ? '#F59E0B' : 'rgba(255,255,255,.04)', color: !filterType ? '#080E1A' : '#94A3B8', border: '1px solid rgba(255,255,255,.1)', whiteSpace: 'nowrap' }}>All</button>
        {rt.map(r => (
          <button key={r.id} onClick={() => setFilterType(filterType === r.id ? '' : r.id)} className="btn btn-sm"
            style={{ background: filterType === r.id ? '#F59E0B' : 'rgba(255,255,255,.04)', color: filterType === r.id ? '#080E1A' : '#94A3B8', border: '1px solid rgba(255,255,255,.1)', whiteSpace: 'nowrap' }}>
            {r.emoji} {r.label}
          </button>
        ))}
      </div>

      {/* Reports feed */}
      {loading ? (
        <div style={{ color: '#64748B', textAlign: 'center', padding: '32px 0' }}>Loading reports…</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛣️</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>No active reports</div>
          <p className="t-body t-small" style={{ maxWidth: 280, margin: '0 auto 20px' }}>Roads are clear, or no conditions have been reported recently.</p>
          <button onClick={() => isLoggedIn ? setShowForm(true) : null} className="btn btn-outline btn-md">Be first to report</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(r => {
            const rt = REPORT_TYPES.find(x => x.id === r.type)
            const sev = SEVERITY_LABELS[r.severity]
            return (
              <div key={r.id} className="card" style={{ padding: '16px 20px', borderLeft: `3px solid ${sev.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{ fontSize: 16 }}>{rt?.emoji ?? '⚠️'}</span>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{r.title}</span>
                      <span style={{ background: `${sev.color}18`, border: `1px solid ${sev.color}33`, color: sev.color, fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 100 }}>{sev.label}</span>
                      {r.verified_count > 0 && <span className="badge badge-green">✓ {r.verified_count} confirmed</span>}
                    </div>
                    {r.description && <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 6, lineHeight: 1.5 }}>{r.description}</p>}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {r.route && <span className="t-small" style={{ color: '#64748B' }}>📍 {r.route}</span>}
                      <span className="t-small" style={{ color: '#64748B' }}>🕐 {fmtAgo(r.created_at)}</span>
                      {r.anonymous && <span className="t-small" style={{ color: '#64748B' }}>Anonymous</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={async () => {
                      await supabase.from('road_reports').update({ verified_count: (r.verified_count||0)+1 }).eq('id', r.id)
                      setReports(rs => rs.map(x => x.id===r.id ? { ...x, verified_count:(x.verified_count||0)+1 } : x))
                      toast.success('Confirmed — thanks!')
                    }} className="btn btn-ghost btn-sm" style={{ color: '#10B981', borderColor: 'rgba(16,185,129,.2)', fontSize: 12 }}>
                      ✓ Confirm
                    </button>
                    <button onClick={async () => {
                      await supabase.from('road_reports').update({ dismissed_count: (r.dismissed_count||0)+1 }).eq('id', r.id)
                      setReports(rs => rs.map(x => x.id===r.id ? { ...x, dismissed_count:(x.dismissed_count||0)+1 } : x))
                      toast.info('Marked as outdated')
                    }} className="btn btn-ghost btn-sm" style={{ color: '#64748B', fontSize: 12 }}>
                      Gone
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Map placeholder */}
      <div className="map-container" style={{ height: 260, marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,.07)' }}>
        <div style={{ textAlign: 'center', color: '#64748B' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🗺️</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Live Map View</div>
          <div className="t-small">Google Maps integration — requires API key in environment</div>
        </div>
      </div>

      {/* Submit Form Modal */}
      {showForm && (
        <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }} className="modal-bg">
          <div onClick={e => e.stopPropagation()} className="modal-box card" style={{ maxWidth: 500, width: '100%', padding: '28px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setShowForm(false)} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 18 }}>✕</button>
            <div className="t-eyebrow" style={{ marginBottom: 6 }}>Submit Road Report</div>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>What are you seeing on the road?</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 8 }}>Condition type *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7 }}>
                  {REPORT_TYPES.map(r => (
                    <button key={r.id} onClick={() => { setType(r.id as ReportType); autoFillTitle(r.id) }}
                      style={{ padding: '8px 6px', borderRadius: 8, border: type === r.id ? '1px solid #F59E0B' : '1px solid rgba(255,255,255,.08)', background: type === r.id ? 'rgba(245,158,11,.09)' : 'rgba(255,255,255,.02)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
                      <span style={{ fontSize: 18 }}>{r.emoji}</span>
                      <span style={{ fontSize: 9.5, color: type === r.id ? '#F59E0B' : '#94A3B8', fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Title *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Checkpoint on A1 near Mahalapye" className="input-base" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Route / Road</label>
                  <input value={route} onChange={e => setRoute(e.target.value)} placeholder="e.g. A1, Gaborone–Francistown" className="input-base" />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Severity</label>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setSeverity(n as Severity)}
                        style={{ width: 36, height: 36, borderRadius: 8, border: severity === n ? '1px solid ' + SEVERITY_LABELS[n].color : '1px solid rgba(255,255,255,.08)', background: severity === n ? SEVERITY_LABELS[n].color + '18' : 'transparent', color: SEVERITY_LABELS[n].color, fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
                        {n}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: SEVERITY_LABELS[severity].color, marginTop: 4 }}>{SEVERITY_LABELS[severity].label}</div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Details (optional)</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Any extra details that help other drivers…" className="input-base" rows={2} style={{ resize: 'vertical' }} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 8 }}>Your GPS location *</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button onClick={getLocation} disabled={locating} className="btn btn-ghost btn-sm">
                    {locating ? '📍 Locating…' : lat ? '✓ Location captured' : '📍 Get My Location'}
                  </button>
                  {lat && lng && <span className="t-small" style={{ color: '#10B981' }}>{lat.toFixed(4)}, {lng.toFixed(4)}</span>}
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} style={{ accentColor: '#F59E0B' }} />
                <span style={{ fontSize: 13, color: '#94A3B8' }}>Submit anonymously (your name won't be shown)</span>
              </label>

              <div style={{ background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.14)', borderRadius: 8, padding: '10px 14px', fontSize: 11, color: '#94A3B8', lineHeight: 1.6 }}>
                ⚖️ <strong>Legal reminder:</strong> This report provides road awareness only. Always follow lawful authority instructions. Reports expire automatically after 2–6 hours based on severity.
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowForm(false)} className="btn btn-ghost btn-md">Cancel</button>
                <button onClick={submitReport} disabled={submitting || !lat || !title} className="btn btn-amber btn-lg" style={{ flex: 1, justifyContent: 'center' }}>
                  {submitting ? 'Submitting…' : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
