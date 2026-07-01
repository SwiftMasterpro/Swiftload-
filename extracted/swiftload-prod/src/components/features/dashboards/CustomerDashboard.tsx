'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { CustomerStats, Load, Booking } from '@/types'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { fmtBWP, fmtDate } from '@/lib/utils/format'

interface Props {
  profile: { full_name: string; rating: number }
  stats: CustomerStats
  loads: Load[]
  bookings: Booking[]
}

export function CustomerDashboard({ profile, stats, loads, bookings }: Props) {
  const [tab, setTab] = useState<'loads' | 'bookings'>('loads')
  return (
    <div style={{ padding: '0 24px 48px' }}>
      <div style={{ marginBottom: 32, paddingTop: 32 }}>
        <div className="t-eyebrow" style={{ marginBottom: 6 }}>Welcome back</div>
        <h1 className="t-h2">{profile.full_name}</h1>
        <p className="t-body t-small" style={{ marginTop: 4 }}>Freight overview · {profile.rating.toFixed(1)} ★</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total Loads',    val: stats.total_loads,     color: '#F59E0B' },
          { label: 'Active',         val: stats.active_loads,    color: '#3B82F6' },
          { label: 'Completed',      val: stats.completed_loads, color: '#10B981' },
          { label: 'Total Spent',    val: fmtBWP(stats.total_spent), color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '18px 20px' }}>
            <div className="t-small" style={{ color: '#64748B', marginBottom: 6 }}>{s.label}</div>
            <div className="t-num" style={{ fontSize: 28, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        <Link href="/marketplace/post" className="btn btn-amber btn-md">+ Post a Load</Link>
        <Link href="/marketplace" className="btn btn-ghost btn-md">Browse Marketplace</Link>
        <Link href="/tracking" className="btn btn-ghost btn-md" style={{ color: '#94A3B8' }}>Track a Delivery</Link>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,.04)', borderRadius: 9, padding: 3, maxWidth: 320 }}>
        {(['loads', 'bookings'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, padding: '8px', borderRadius: 7, border: 'none', background: tab === t ? '#0E1825' : 'transparent', color: tab === t ? '#fff' : '#64748B', fontWeight: 600, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'inherit', transition: 'all 180ms ease' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'loads' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {loads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 24px' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
              <div style={{ color: '#64748B', marginBottom: 12, fontWeight: 600 }}>No loads yet</div>
              <Link href="/marketplace/post" className="btn btn-amber btn-sm">Post Your First Load</Link>
            </div>
          ) : (
            <table className="table-base">
              <thead><tr><th>Load</th><th>Route</th><th>Date</th><th>Status</th><th>Budget</th></tr></thead>
              <tbody>
                {loads.map(l => (
                  <tr key={l.id}>
                    <td><div style={{ fontWeight: 600, fontSize: 13 }}>{l.title}</div><div className="t-small" style={{ color: '#64748B' }}>{l.cargo_type} · {l.weight_tons}t</div></td>
                    <td style={{ fontSize: 12 }}>{l.pickup_city} → {l.dropoff_city}</td>
                    <td><span className="t-small" style={{ color: '#64748B' }}>{fmtDate(l.pickup_date)}</span></td>
                    <td><StatusBadge status={l.status} /></td>
                    <td>{l.budget_max ? fmtBWP(l.budget_max) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'bookings' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 24px' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🚛</div>
              <div style={{ color: '#64748B', fontWeight: 600 }}>No active bookings</div>
            </div>
          ) : (
            <table className="table-base">
              <thead><tr><th>Tracking #</th><th>Driver</th><th>Route</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: '#F59E0B' }}>{b.tracking_code}</span></td>
                    <td style={{ fontSize: 13 }}>{b.driver?.full_name ?? '—'}</td>
                    <td style={{ fontSize: 12 }}>{b.load?.pickup_city} → {b.load?.dropoff_city}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td><Link href={`/tracking?code=${b.tracking_code}`} className="btn btn-ghost btn-sm">Track</Link></td>
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
