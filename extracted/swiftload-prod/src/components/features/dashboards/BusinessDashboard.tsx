'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { BusinessStats, Load } from '@/types'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { fmtBWP, fmtDate } from '@/lib/utils/format'

interface Props {
  profile: { full_name: string; company_name?: string }
  stats: BusinessStats
  loads: Load[]
}

export function BusinessDashboard({ profile, stats, loads }: Props) {
  const [tab, setTab] = useState<'orders' | 'fleet' | 'analytics'>('orders')
  return (
    <div style={{ padding: '0 24px 48px' }}>
      <div style={{ marginBottom: 28, paddingTop: 32 }}>
        <div className="t-eyebrow" style={{ marginBottom: 6 }}>Business Account</div>
        <h1 className="t-h2">{profile.company_name ?? profile.full_name}</h1>
        <p className="t-body t-small" style={{ marginTop: 4 }}>Operations overview · CIPA Verified</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { l: 'Total Loads',   v: stats.total_loads,           c: '#F59E0B' },
          { l: 'Total Spend',   v: fmtBWP(stats.total_spend),   c: '#F59E0B' },
          { l: 'On-Time Rate',  v: `${Math.round(stats.on_time_deliveries)}%`, c: '#10B981' },
        ].map(s => (
          <div key={s.l} className="card" style={{ padding: '20px 22px' }}>
            <div className="t-small" style={{ color: '#64748B', marginBottom: 6 }}>{s.l}</div>
            <div className="t-num" style={{ fontSize: 30, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        <Link href="/marketplace/post" className="btn btn-amber btn-md">+ Post Load</Link>
        <Link href="/fleet" className="btn btn-ghost btn-md">Manage Fleet</Link>
        <Link href="/messages" className="btn btn-ghost btn-md" style={{ color: '#94A3B8' }}>Messages</Link>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,.04)', borderRadius: 9, padding: 3, maxWidth: 400 }}>
        {(['orders', 'fleet', 'analytics'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px', borderRadius: 7, border: 'none', background: tab === t ? '#0E1825' : 'transparent', color: tab === t ? '#fff' : '#64748B', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 180ms', textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {loads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 24px' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
              <div style={{ color: '#64748B', marginBottom: 12 }}>No orders yet</div>
              <Link href="/marketplace/post" className="btn btn-amber btn-sm">Post First Load</Link>
            </div>
          ) : (
            <table className="table-base">
              <thead><tr><th>Order</th><th>Route</th><th>Date</th><th>Status</th><th>Budget</th><th>Bids</th></tr></thead>
              <tbody>
                {loads.map(l => (
                  <tr key={l.id}>
                    <td><div style={{ fontWeight: 600, fontSize: 13 }}>{l.title}</div><div className="t-small" style={{ color: '#64748B' }}>{l.cargo_type} · {l.weight_tons}t</div></td>
                    <td style={{ fontSize: 12 }}>{l.pickup_city} → {l.dropoff_city}</td>
                    <td><span className="t-small" style={{ color: '#64748B' }}>{fmtDate(l.pickup_date)}</span></td>
                    <td><StatusBadge status={l.status} /></td>
                    <td>{l.budget_max ? fmtBWP(l.budget_max) : '—'}</td>
                    <td><span className="badge badge-blue">{l.bid_count}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'fleet' && (
        <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>🚛</div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Fleet Command Centre</div>
          <p className="t-body t-small" style={{ maxWidth: 320, margin: '0 auto 20px' }}>Track vehicles, manage drivers, monitor maintenance and fuel costs in real time.</p>
          <Link href="/fleet" className="btn btn-amber btn-md">Open Fleet Dashboard</Link>
        </div>
      )}

      {tab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {[
            { l: 'Active Loads',      v: stats.active_loads,       c: '#3B82F6' },
            { l: 'Avg Cost/km',       v: `P ${stats.avg_cost_per_km.toFixed(2)}`, c: '#F59E0B' },
            { l: 'Preferred Carriers',v: stats.preferred_carriers, c: '#10B981' },
          ].map(s => (
            <div key={s.l} className="card" style={{ padding: '22px' }}>
              <div className="t-small" style={{ color: '#64748B', marginBottom: 8 }}>{s.l}</div>
              <div className="t-num" style={{ fontSize: 28, color: s.c }}>{s.v}</div>
            </div>
          ))}
          <div className="card" style={{ padding: '24px', gridColumn: '1/-1', textAlign: 'center', color: '#64748B' }}>
            📊 Full analytics charts available in Pro plan — <Link href="#pricing" style={{ color: '#F59E0B' }}>upgrade now</Link>
          </div>
        </div>
      )}
    </div>
  )
}
