'use client'
import { useState } from 'react'
import type { AdminStats } from '@/types'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { fmtBWP, fmtAgo } from '@/lib/utils/format'

interface Props { stats: AdminStats }

const PENDING = [
  { id: '1', name: 'Kabo Sithole',   role: 'driver',   joined: '2025-01-15T08:00:00Z', docs: 3 },
  { id: '2', name: 'Naledi Traders', role: 'business', joined: '2025-01-14T14:22:00Z', docs: 5 },
  { id: '3', name: 'Mpho Kgosi',     role: 'driver',   joined: '2025-01-14T09:10:00Z', docs: 2 },
]
const TXS = [
  { id: '1', user: 'Thabo M.',   amount: 8500,  type: 'escrow_hold',    status: 'held',     created: '2025-01-15T10:00:00Z' },
  { id: '2', user: 'Neo K.',     amount: 12200, type: 'escrow_release', status: 'released', created: '2025-01-15T09:30:00Z' },
  { id: '3', user: 'Mpho S.',    amount: 3400,  type: 'escrow_hold',    status: 'held',     created: '2025-01-15T08:45:00Z' },
  { id: '4', user: 'Kefilwe D.',  amount: 6800,  type: 'refund',         status: 'refunded', created: '2025-01-14T16:20:00Z' },
]

export function AdminDashboard({ stats }: Props) {
  const [tab, setTab] = useState<'overview' | 'users' | 'transactions' | 'disputes' | 'tickets' | 'forms'>('overview')
  const [searchUser, setSearchUser] = useState('')
  const [formKey, setFormKey] = useState('load-quote')
  const [formSubs, setFormSubs] = useState<any[]>([])
  const [formsLoading, setFormsLoading] = useState(false)

  const loadFormSubs = async (key: string) => {
    setFormsLoading(true)
    try {
      const res = await fetch(`/api/forms/submit?form_key=${key}&limit=30`)
      const data = await res.json()
      setFormSubs(data.submissions ?? [])
    } catch { setFormSubs([]) } finally { setFormsLoading(false) }
  }

  return (
    <div style={{ padding: '0 24px 48px' }}>
      <div style={{ marginBottom: 28, paddingTop: 32 }}>
        <div className="t-eyebrow" style={{ marginBottom: 6 }}>Platform Administration</div>
        <h1 className="t-h2">Admin Control Centre</h1>
        <p className="t-body t-small" style={{ marginTop: 4 }}>Manage users, payments, disputes, and platform health</p>
      </div>

      {/* Alert bar */}
      {(stats.open_tickets > 0 || stats.pending_verifications > 0) && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          {stats.pending_verifications > 0 && (
            <div style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 9, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>⏳</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#F59E0B' }}>{stats.pending_verifications} pending verifications</span>
              <button onClick={() => setTab('users')} className="btn btn-outline btn-sm">Review</button>
            </div>
          )}
          {stats.open_tickets > 0 && (
            <div style={{ background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 9, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>🎫</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#EF4444' }}>{stats.open_tickets} open tickets</span>
              <button onClick={() => setTab('tickets')} className="btn btn-danger btn-sm">View</button>
            </div>
          )}
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 14 }}>
        {[
          { l: 'Total Users',   v: stats.total_users,        c: '#F59E0B', icon: '👥' },
          { l: 'Active Today',  v: stats.active_users_today, c: '#10B981', icon: '✅' },
          { l: 'Total Loads',   v: stats.total_loads,        c: '#3B82F6', icon: '📦' },
          { l: 'Revenue Today', v: fmtBWP(stats.revenue_today), c: '#F59E0B', icon: '💰' },
        ].map(s => (
          <div key={s.l} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div className="t-small" style={{ color: '#64748B', marginBottom: 5 }}>{s.l}</div>
                <div className="t-num" style={{ fontSize: 28, color: s.c }}>{s.v}</div>
              </div>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { l: 'Transactions',   v: stats.total_transactions,    c: '#94A3B8' },
          { l: 'Active Loads',   v: stats.active_loads,          c: '#3B82F6' },
          { l: 'Pending KYC',    v: stats.pending_verifications, c: '#F59E0B' },
          { l: 'Open Tickets',   v: stats.open_tickets,          c: '#EF4444' },
        ].map(s => (
          <div key={s.l} className="card" style={{ padding: '14px 18px' }}>
            <div className="t-small" style={{ color: '#64748B', marginBottom: 4 }}>{s.l}</div>
            <div className="t-num" style={{ fontSize: 22, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,.07)', overflowX: 'auto' }}>
        {(['overview', 'users', 'transactions', 'disputes', 'tickets', 'forms'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid #F59E0B' : '2px solid transparent', color: tab === t ? '#F59E0B' : '#64748B', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 180ms', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Recent Transactions</div>
            {TXS.map(tx => (
              <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{tx.user}</div>
                  <div className="t-small" style={{ color: '#64748B', textTransform: 'capitalize' }}>{tx.type.replace(/_/g, ' ')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: '#F59E0B', fontSize: 13 }}>{fmtBWP(tx.amount)}</div>
                  <StatusBadge status={tx.status} />
                </div>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Pending Verifications</div>
            {PENDING.map(u => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                  <div className="t-small" style={{ color: '#64748B', textTransform: 'capitalize' }}>{u.role} · {u.docs} docs</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" style={{ color: '#10B981', borderColor: 'rgba(16,185,129,.2)' }}>✓ Approve</button>
                  <button className="btn btn-danger btn-sm">✗</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <input value={searchUser} onChange={e => setSearchUser(e.target.value)} placeholder="Search users…" className="input-base" style={{ maxWidth: 260 }} />
            <select className="input-base" style={{ maxWidth: 160 }}>
              <option value="">All roles</option>
              {['customer', 'driver', 'business', 'fleet_owner', 'admin'].map(r => <option key={r}>{r}</option>)}
            </select>
            <select className="input-base" style={{ maxWidth: 180 }}>
              <option value="">All status</option>
              {['pending', 'verified', 'suspended'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="table-base">
              <thead><tr><th>User</th><th>Role</th><th>Joined</th><th>Docs</th><th>Actions</th></tr></thead>
              <tbody>
                {PENDING.filter(u => !searchUser || u.name.toLowerCase().includes(searchUser.toLowerCase())).map(u => (
                  <tr key={u.id}>
                    <td><div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div></td>
                    <td><span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{u.role}</span></td>
                    <td><span className="t-small" style={{ color: '#64748B' }}>{fmtAgo(u.joined)}</span></td>
                    <td><span className="badge badge-amber">{u.docs} docs</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" style={{ color: '#10B981', borderColor: 'rgba(16,185,129,.2)' }}>Approve</button>
                        <button className="btn btn-danger btn-sm">Reject</button>
                        <button className="btn btn-ghost btn-sm">View KYC</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions */}
      {tab === 'transactions' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="table-base">
            <thead><tr><th>User</th><th>Type</th><th>Amount</th><th>Status</th><th>Time</th><th>Actions</th></tr></thead>
            <tbody>
              {TXS.map(tx => (
                <tr key={tx.id}>
                  <td style={{ fontWeight: 600, fontSize: 13 }}>{tx.user}</td>
                  <td style={{ fontSize: 12, textTransform: 'capitalize', color: '#94A3B8' }}>{tx.type.replace(/_/g, ' ')}</td>
                  <td style={{ fontWeight: 700, color: '#F59E0B' }}>{fmtBWP(tx.amount)}</td>
                  <td><StatusBadge status={tx.status} /></td>
                  <td><span className="t-small" style={{ color: '#64748B' }}>{fmtAgo(tx.created)}</span></td>
                  <td><button className="btn btn-ghost btn-sm">Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Disputes */}
      {tab === 'disputes' && (
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>⚖️</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>Dispute Resolution Centre</div>
          <p className="t-body t-small" style={{ maxWidth: 360, margin: '0 auto 20px' }}>
            Mediate escrow disputes between customers and drivers. Review evidence, GPS logs, photo audit trails, and OTP records.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[{ v: 0, l: 'Active disputes', c: '#EF4444' }, { v: 12, l: 'Resolved this month', c: '#10B981' }, { v: 2, l: 'Avg resolution days', c: '#F59E0B' }].map(s => (
              <div key={s.l} className="card" style={{ padding: '16px 24px', border: `1px solid ${s.c}22` }}>
                <div className="t-num" style={{ fontSize: 30, color: s.c }}>{s.v}</div>
                <div className="t-small" style={{ color: '#64748B', marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tickets */}
      {tab === 'tickets' && (
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🎫</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>Support Tickets</div>
          <p className="t-body t-small" style={{ maxWidth: 340, margin: '0 auto 20px' }}>Manage customer and driver support requests. Assign to staff, respond, escalate, and resolve within SLA.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[{ v: stats.open_tickets, l: 'Open', c: '#EF4444' }, { v: 3, l: 'In Progress', c: '#F59E0B' }, { v: 47, l: 'Closed', c: '#10B981' }].map(s => (
              <div key={s.l} className="card" style={{ padding: '16px 24px', border: `1px solid ${s.c}22` }}>
                <div className="t-num" style={{ fontSize: 30, color: s.c }}>{s.v}</div>
                <div className="t-small" style={{ color: '#64748B', marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Forms */}
      {tab === 'forms' && (
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,.04)', borderRadius: 9, padding: 3 }}>
              {[['load-quote','📦 Quotes'],['driver-register','🚛 Drivers'],['business-onboard','🏢 Business'],['general-enquiry','✉️ Enquiries']].map(([k, l]) => (
                <button key={k} onClick={() => { setFormKey(k); loadFormSubs(k) }}
                  style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: formKey === k ? '#0E1825' : 'transparent', color: formKey === k ? '#F59E0B' : '#64748B', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 180ms', whiteSpace: 'nowrap' }}>
                  {l}
                </button>
              ))}
            </div>
            <button onClick={() => loadFormSubs(formKey)} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>↻ Refresh</button>
            <a href="/forms" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">View Forms →</a>
          </div>
          {formSubs.length === 0 && !formsLoading ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>No submissions yet</div>
              <p className="t-small" style={{ color: '#64748B', maxWidth: 280, margin: '0 auto 14px' }}>Load the form submissions or check back after clients submit forms.</p>
              <button onClick={() => loadFormSubs(formKey)} className="btn btn-amber btn-sm">Load Submissions</button>
            </div>
          ) : formsLoading ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748B' }}>Loading submissions…</div>
          ) : (
            <div className="card" style={{ overflow: 'hidden' }}>
              <table className="table-base">
                <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Source</th><th>Submitted</th><th>Actions</th></tr></thead>
                <tbody>
                  {formSubs.map((s: any) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>{s.full_name ?? '—'}</td>
                      <td style={{ fontSize: 12, color: '#94A3B8' }}>{s.email ?? '—'}</td>
                      <td><span className={`badge ${s.status === 'new' ? 'badge-amber' : s.status === 'actioned' ? 'badge-green' : 'badge-mist'}`}>{s.status}</span></td>
                      <td><span className={`badge ${s.source === 'google_forms' ? 'badge-blue' : 'badge-mist'}`}>{s.source}</span></td>
                      <td className="t-small" style={{ color: '#64748B' }}>{new Date(s.created_at).toLocaleDateString('en-BW', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={async () => {
                            await fetch('/api/forms/submit', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ submission_id: s.id, status: 'actioned' }) })
                            loadFormSubs(formKey)
                          }} className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: '#10B981', borderColor: 'rgba(16,185,129,.2)' }}>
                            ✓ Action
                          </button>
                          <button onClick={() => { const d = JSON.stringify(s.data, null, 2); alert(d) }} className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ marginTop: 14, padding: '12px 16px', background: 'rgba(59,130,246,.06)', border: '1px solid rgba(59,130,246,.15)', borderRadius: 9, fontSize: 12, color: '#64748B' }}>
            📖 See <strong style={{ color: '#3B82F6' }}>/docs/GOOGLE_FORMS_SETUP.md</strong> for Google Forms webhook setup instructions.
            Webhook endpoint: <code style={{ color: '#F59E0B' }}>/api/forms/webhook</code>
          </div>
        </div>
      )}
    </div>
  )
}
