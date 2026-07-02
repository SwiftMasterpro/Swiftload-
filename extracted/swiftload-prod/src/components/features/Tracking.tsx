'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Booking, TrackingUpdate } from '@/types'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { fmtDateTime, fmtAgo } from '@/lib/utils/format'
import { toast } from 'sonner'

export function Tracking() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const [code, setCode] = useState(searchParams.get('code') ?? '')
  const [booking, setBooking] = useState<Booking | null>(null)
  const [updates, setUpdates] = useState<TrackingUpdate[]>([])
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

  const track = async (trackCode?: string) => {
    const c = (trackCode ?? code).trim().toUpperCase()
    if (!c) return
    setLoading(true); setNotFound(false)
    const { data: b } = await supabase.from('bookings').select('*,load:loads(*),driver:profiles(*)').eq('tracking_code', c).single()
    if (!b) { setNotFound(true); setLoading(false); return }
    setBooking(b)
    const { data: u } = await supabase.from('tracking_updates').select('*').eq('booking_id', b.id).order('created_at', { ascending: false }).limit(30)
    setUpdates(u ?? [])
    setLoading(false)
  }

  useEffect(() => { if (searchParams.get('code')) track(searchParams.get('code')!) }, [])

  useEffect(() => {
    if (!booking) return
    const channel = supabase.channel(`tracking:${booking.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tracking_updates', filter: `booking_id=eq.${booking.id}` },
        (payload: { new: TrackingUpdate }) => setUpdates(u => [payload.new as TrackingUpdate, ...u]))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [booking?.id])

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/tracking?code=${booking?.tracking_code}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
    toast.success('Tracking link copied — share with anyone!')
  }

  const latestUpdate = updates[0]
  const progressSteps = ['Confirmed', 'In Transit', 'Approaching', 'Delivered']
  const stepIndex = booking?.status === 'delivered' ? 3 : booking?.status === 'in_transit' ? (updates.length > 5 ? 2 : 1) : 0

  return (
    <div style={{ padding: '0 24px 48px' }}>
      <div style={{ paddingTop: 32, marginBottom: 28 }}>
        <div className="t-eyebrow" style={{ marginBottom: 6 }}>Live Tracking</div>
        <h1 className="t-h2">Track Your Delivery</h1>
        <p className="t-body t-small" style={{ marginTop: 4 }}>Enter a tracking code or share a link — no login required</p>
      </div>

      {/* Search input */}
      <div className="card" style={{ padding: '20px 22px', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && track()} placeholder="Enter tracking code e.g. SL98221" className="input-base" style={{ flex: 1, letterSpacing: 2, fontSize: 16, fontFamily: 'monospace' }} />
          <button onClick={() => track()} disabled={loading || !code} className="btn btn-amber btn-lg">
            {loading ? 'Searching…' : 'Track →'}
          </button>
        </div>
        {notFound && <p style={{ color: '#EF4444', fontSize: 13, marginTop: 10 }}>⚠️ No delivery found with that code. Check the code and try again.</p>}
      </div>

      {/* Tracking result */}
      {booking && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Header card */}
          <div className="card" style={{ padding: '22px 24px', border: booking.status === 'delivered' ? '1px solid rgba(16,185,129,.3)' : '1px solid rgba(245,158,11,.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 800, color: '#F59E0B', letterSpacing: 2 }}>{booking.tracking_code}</span>
                  <StatusBadge status={booking.status} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{booking.load?.title ?? 'Freight Delivery'}</div>
                <div style={{ fontSize: 13, color: '#94A3B8' }}>
                  📍 <strong>{booking.load?.pickup_city}</strong> → <strong>{booking.load?.dropoff_city}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={copyLink} className="btn btn-ghost btn-sm">
                  {copied ? '✓ Copied!' : '🔗 Share Link'}
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 8 }}>
              {progressSteps.map((step, i) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: i <= stepIndex ? '#F59E0B' : 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: i <= stepIndex ? '#080E1A' : '#64748B', border: i === stepIndex ? '2px solid #F59E0B' : 'none', boxShadow: i === stepIndex ? '0 0 0 4px rgba(245,158,11,.18)' : 'none', transition: 'all 400ms ease' }}>
                      {i < stepIndex ? '✓' : i + 1}
                    </div>
                    <div style={{ fontSize: 10, color: i <= stepIndex ? '#F59E0B' : '#64748B', fontWeight: 600, whiteSpace: 'nowrap' }}>{step}</div>
                  </div>
                  {i < progressSteps.length - 1 && (
                    <div style={{ height: 2, flex: 1, background: i < stepIndex ? '#F59E0B' : 'rgba(255,255,255,.08)', transition: 'background 400ms ease', marginBottom: 14 }} />
                  )}
                </div>
              ))}
            </div>

            {/* Driver info */}
            {booking.driver && (
              <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 9, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#080E1A', flexShrink: 0 }}>
                  {booking.driver.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) ?? 'DR'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{booking.driver.full_name}</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>Verified Driver · {booking.driver.rating?.toFixed(1) ?? '—'} ★</div>
                </div>
                {latestUpdate && (
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end' }}>
                      <span className="dot dot-green" style={{ animation: 'pulse 1.5s infinite' }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#10B981' }}>LIVE</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{fmtAgo(latestUpdate.created_at)}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Map */}
          <div className="map-container" style={{ height: 280, border: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {latestUpdate ? (
              <div style={{ textAlign: 'center', color: '#64748B' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📍</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Driver location: {latestUpdate.lat.toFixed(4)}, {latestUpdate.lng.toFixed(4)}</div>
                {latestUpdate.speed_kmh && <div className="t-small" style={{ marginTop: 4 }}>Speed: {Math.round(latestUpdate.speed_kmh)} km/h</div>}
                <div className="t-small" style={{ marginTop: 6 }}>Google Maps · Requires API key</div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748B' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🗺️</div>
                <div style={{ fontSize: 13 }}>Live map — GPS updates appear here when driver is en route</div>
              </div>
            )}
          </div>

          {/* Timeline */}
          {updates.length > 0 && (
            <div className="card" style={{ padding: '20px 22px' }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Event Timeline</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {updates.map((u, i) => (
                  <div key={u.id} style={{ display: 'flex', gap: 14, paddingBottom: 16, position: 'relative' }}>
                    {i < updates.length - 1 && <div style={{ position: 'absolute', left: 7, top: 16, width: 2, bottom: 0, background: 'rgba(255,255,255,.06)' }} />}
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: i === 0 ? '#F59E0B' : 'rgba(255,255,255,.12)', flexShrink: 0, marginTop: 2, boxShadow: i === 0 ? '0 0 0 3px rgba(245,158,11,.2)' : 'none' }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{u.event || (i === 0 ? 'GPS Update' : 'Location recorded')}</div>
                      {u.notes && <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 2 }}>{u.notes}</div>}
                      <div style={{ fontSize: 11, color: '#64748B' }}>{fmtDateTime(u.created_at)} · {u.lat.toFixed(3)}, {u.lng.toFixed(3)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!booking && !loading && !notFound && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🚛</div>
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Enter a tracking code above</h3>
          <p className="t-body t-small" style={{ maxWidth: 300, margin: '0 auto' }}>
            Your tracking code is on your booking confirmation. Share the link with anyone — no account needed.
          </p>
        </div>
      )}
    </div>
  )
}
