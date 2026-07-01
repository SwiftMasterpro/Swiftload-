'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { DriverStats, Load, Booking } from '@/types'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { fmtBWP, fmtDate } from '@/lib/utils/format'

interface Props {
  profile: { full_name: string; rating: number }
  stats: DriverStats
  availableLoads: Load[]
  bookings: Booking[]
}

export function DriverDashboard({ profile, stats, availableLoads, bookings }: Props) {
  const [tab, setTab] = useState<'jobs' | 'available' | 'history'>('jobs')
  const activeBookings = bookings.filter(b => ['confirmed', 'in_transit'].includes(b.status))
  const historyBookings = bookings.filter(b => ['delivered', 'cancelled', 'disputed'].includes(b.status))

  return (
    <div style={{ padding: '0 24px 48px' }}>
      <div style={{ marginBottom: 28, paddingTop: 32 }}>
        <div className="t-eyebrow" style={{ marginBottom: 6 }}>Driver Dashboard</div>
        <h1 className="t-h2">{profile.full_name}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
          <span style={{ fontSize: 13, color: '#94A3B8' }}>Rating: <strong style={{ color: '#F59E0B' }}>{profile.rating.toFixed(1)} ★</strong></span>
          <span style={{ color: 'rgba(255,255,255,.15)' }}>|</span>
          <span style={{ fontSize: 13, color: '#94A3B8' }}>On-time: <strong style={{ color: '#10B981' }}>{Math.round(stats.on_time_rate)}%</strong></span>
          <span style={{ color: 'rgba(255,255,255,.15)' }}>|</span>
          <span style={{ fontSize: 13, color: '#94A3B8' }}>Acceptance: <strong style={{ color: '#3B82F6' }}>{Math.round(stats.acceptance_rate)}%</strong></span>
        </div>
      </div>

      {/* Earnings banner */}
      <div style={{ background: 'linear-gradient(135deg,rgba(245,158,11,.1),rgba(244,121,32,.05))', border: '1px solid rgba(245,158,11,.2)', borderRadius: 14, padding: '20px 24px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="t-eyebrow" style={{ marginBottom: 4 }}>Total Earned</div>
          <div className="t-num" style={{ fontSize: 40, color: '#F59E0B' }}>{fmtBWP(stats.total_earned)}</div>
        </div>
        <div style={{ display: 'flex', gap: 28 }}>
          {[
            { l: 'Total Trips',  v: stats.total_trips },
            { l: 'Acceptance',   v: `${Math.round(stats.acceptance_rate)}%` },
            { l: 'Active Now',   v: stats.active_trips },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div className="t-num" style={{ fontSize: 24, color: '#fff' }}>{s.v}</div>
              <div className="t-small" style={{ color: '#64748B' }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 9 }}>
          <Link href="/marketplace" className="btn btn-amber btn-md">Find Loads</Link>
          <Link href="/road-intelligence" className="btn btn-ghost btn-md" style={{ color: '#94A3B8' }}>Road Intel</Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,.04)', borderRadius: 9, padding: 3, maxWidth: 420 }}>
        {([['jobs', 'Active Jobs'], ['available', 'Available Loads'], ['history', 'History']] as const).map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, padding: '8px', borderRadius: 7, border: 'none', background: tab === t ? '#0E1825' : 'transparent', color: tab === t ? '#fff' : '#64748B', fontWeight: 600, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 180ms', whiteSpace: 'nowrap' }}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'jobs' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {activeBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 24px' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🚛</div>
              <div style={{ color: '#64748B', fontWeight: 600, marginBottom: 4 }}>No active jobs</div>
              <Link href="/marketplace" className="btn btn-amber btn-sm" style={{ marginTop: 8 }}>Browse Available Loads</Link>
            </div>
          ) : (
            <table className="table-base">
              <thead><tr><th>Tracking</th><th>Route</th><th>Pickup</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {activeBookings.map(b => (
                  <tr key={b.id}>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: '#F59E0B' }}>{b.tracking_code}</span></td>
                    <td style={{ fontSize: 12 }}>{b.load?.pickup_city} → {b.load?.dropoff_city}</td>
                    <td style={{ fontSize: 12, color: '#64748B' }}>{b.load?.pickup_date ? fmtDate(b.load.pickup_date) : '—'}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link href={`/tracking?code=${b.tracking_code}`} className="btn btn-ghost btn-sm">Update GPS</Link>
                        <Link href={`/messages`} className="btn btn-ghost btn-sm" style={{ color: '#94A3B8' }}>Message</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'available' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {availableLoads.slice(0, 12).map(l => (
            <div key={l.id} className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{l.title}</div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>{l.pickup_city} → {l.dropoff_city} · {l.weight_tons}t · {l.vehicle_type}</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{fmtDate(l.pickup_date)}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {l.budget_max && <div className="t-num" style={{ fontSize: 22, color: '#F59E0B', marginBottom: 4 }}>{fmtBWP(l.budget_max)}</div>}
                <div style={{ fontSize: 11, color: '#64748B', marginBottom: 8 }}>{l.bid_count} bids</div>
                <Link href={`/marketplace?load=${l.id}`} className="btn btn-outline btn-sm">Bid Now</Link>
              </div>
            </div>
          ))}
          {availableLoads.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '40px 24px', color: '#64748B' }}>
              <div style={{ marginBottom: 8 }}>No loads matching your profile right now</div>
              <Link href="/marketplace" className="btn btn-amber btn-sm" style={{ marginTop: 4 }}>View Full Marketplace</Link>
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {historyBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 24px', color: '#64748B' }}>No completed trips yet</div>
          ) : (
            <table className="table-base">
              <thead><tr><th>Route</th><th>Delivered</th><th>Status</th><th>Rating</th></tr></thead>
              <tbody>
                {historyBookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontSize: 12 }}>{b.load?.pickup_city} → {b.load?.dropoff_city}</td>
                    <td><span className="t-small" style={{ color: '#64748B' }}>{b.delivery_confirmed_at ? fmtDate(b.delivery_confirmed_at) : '—'}</span></td>
                    <td><StatusBadge status={b.status} /></td>
                    <td style={{ color: '#F59E0B', fontWeight: 700 }}>—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
