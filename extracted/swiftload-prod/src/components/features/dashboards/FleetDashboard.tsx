'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { FleetStats, Vehicle } from '@/types'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { fmtDate } from '@/lib/utils/format'

interface Props {
  profile: { full_name: string; company_name?: string }
  stats: FleetStats
  vehicles: Vehicle[]
}

export function FleetDashboard({ profile, stats, vehicles }: Props) {
  const [tab, setTab] = useState<'vehicles' | 'maintenance' | 'drivers'>('vehicles')
  const isExpired = (d?: string) => d && new Date(d) < new Date()
  const expiringSoon = (d?: string) => { if (!d) return false; const diff = new Date(d).getTime() - Date.now(); return diff > 0 && diff < 30 * 86400000 }

  return (
    <div style={{ padding: '0 24px 48px' }}>
      <div style={{ marginBottom: 28, paddingTop: 32 }}>
        <div className="t-eyebrow" style={{ marginBottom: 6 }}>Fleet Operations</div>
        <h1 className="t-h2">{profile.company_name ?? profile.full_name}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { l: 'Total Vehicles',   v: stats.total_vehicles,               c: '#F59E0B' },
          { l: 'Active Now',       v: stats.active_vehicles,              c: '#10B981' },
          { l: 'Maintenance Due',  v: stats.maintenance_due,              c: stats.maintenance_due > 0 ? '#EF4444' : '#10B981' },
          { l: 'Utilisation',      v: `${Math.round(stats.avg_utilisation)}%`, c: '#3B82F6' },
        ].map(s => (
          <div key={s.l} className="card" style={{ padding: '18px 20px' }}>
            <div className="t-small" style={{ color: '#64748B', marginBottom: 5 }}>{s.l}</div>
            <div className="t-num" style={{ fontSize: 28, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {stats.maintenance_due > 0 && (
        <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#EF4444' }}>{stats.maintenance_due} vehicle{stats.maintenance_due !== 1 ? 's' : ''} requiring attention</div>
            <div className="t-small" style={{ color: '#64748B' }}>Review maintenance schedule to prevent downtime</div>
          </div>
          <button onClick={() => setTab('maintenance')} className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }}>View Now</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        <button className="btn btn-amber btn-md">+ Add Vehicle</button>
        <Link href="/marketplace" className="btn btn-ghost btn-md">Find Loads</Link>
        <Link href="/road-intelligence" className="btn btn-ghost btn-md" style={{ color: '#94A3B8' }}>Road Intel</Link>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,.04)', borderRadius: 9, padding: 3, maxWidth: 380 }}>
        {(['vehicles', 'maintenance', 'drivers'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px', borderRadius: 7, border: 'none', background: tab === t ? '#0E1825' : 'transparent', color: tab === t ? '#fff' : '#64748B', fontWeight: 600, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 180ms', textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'vehicles' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {vehicles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 24px' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🚛</div>
              <div style={{ color: '#64748B', marginBottom: 12 }}>No vehicles registered</div>
              <button className="btn btn-amber btn-sm">Register First Vehicle</button>
            </div>
          ) : (
            <table className="table-base">
              <thead><tr><th>Vehicle</th><th>Type</th><th>Capacity</th><th>Status</th><th>Insurance</th><th>Disc</th></tr></thead>
              <tbody>
                {vehicles.map(v => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{v.registration}</div>
                      <div className="t-small" style={{ color: '#64748B' }}>{v.make} {v.model} · {v.year}</div>
                    </td>
                    <td style={{ fontSize: 12 }}>{v.type}</td>
                    <td style={{ fontSize: 12 }}>{v.capacity_tons}t</td>
                    <td><StatusBadge status={v.status} /></td>
                    <td>
                      {v.insurance_expiry ? (
                        <span className="t-small" style={{ color: isExpired(v.insurance_expiry) ? '#EF4444' : expiringSoon(v.insurance_expiry) ? '#F59E0B' : '#64748B' }}>
                          {isExpired(v.insurance_expiry) ? '⚠️ ' : ''}{fmtDate(v.insurance_expiry)}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      {v.licence_expiry ? (
                        <span className="t-small" style={{ color: isExpired(v.licence_expiry) ? '#EF4444' : expiringSoon(v.licence_expiry) ? '#F59E0B' : '#64748B' }}>
                          {isExpired(v.licence_expiry) ? '⚠️ ' : ''}{fmtDate(v.licence_expiry)}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'maintenance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {vehicles.filter(v => v.status === 'maintenance' || isExpired(v.insurance_expiry) || isExpired(v.licence_expiry)).map(v => (
            <div key={v.id} className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(239,68,68,.18)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{v.registration} — {v.make} {v.model}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                  {v.status === 'maintenance' && <span className="badge badge-amber">In maintenance</span>}
                  {isExpired(v.insurance_expiry) && <span className="badge badge-red">Insurance expired</span>}
                  {isExpired(v.licence_expiry) && <span className="badge badge-red">Disc expired</span>}
                  {expiringSoon(v.insurance_expiry) && !isExpired(v.insurance_expiry) && <span className="badge badge-amber">Insurance expiring</span>}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm">Resolve</button>
            </div>
          ))}
          {vehicles.filter(v => v.status === 'maintenance' || isExpired(v.insurance_expiry) || isExpired(v.licence_expiry)).length === 0 && (
            <div className="card" style={{ padding: '32px 24px', textAlign: 'center', color: '#10B981' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
              <div style={{ fontWeight: 700 }}>All vehicles in good standing</div>
            </div>
          )}
        </div>
      )}

      {tab === 'drivers' && (
        <div className="card" style={{ padding: '28px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>👷</div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Driver Management</div>
          <p className="t-body t-small" style={{ color: '#64748B', maxWidth: 300, margin: '0 auto 16px' }}>Assign drivers to vehicles, track performance, manage schedules and KYC status.</p>
          <div className="t-num" style={{ fontSize: 28, color: '#F59E0B', marginBottom: 4 }}>{stats.drivers_count}</div>
          <div className="t-small" style={{ color: '#64748B' }}>drivers in your fleet</div>
        </div>
      )}
    </div>
  )
}
