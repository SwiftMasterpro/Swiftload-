'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Load } from '@/types'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SkeletonCard } from '@/components/shared/LoadingSpinner'
import { fmtBWP, fmtDate } from '@/lib/utils/format'
import { VEHICLE_TYPES, CARGO_TYPES, BW_CITIES } from '@/lib/utils/constants'
import { toast } from 'sonner'

export function Marketplace() {
  const supabase = createClient()
  const [loads, setLoads] = useState<Load[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cityFrom, setCityFrom] = useState('')
  const [cityTo, setCityTo] = useState('')
  const [vehicleType, setVehicleType] = useState('')
  const [cargoType, setCargoType] = useState('')
  const [maxWeight, setMaxWeight] = useState('')
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null)
  const [bidAmount, setBidAmount] = useState('')
  const [bidMsg, setBidMsg] = useState('')
  const [bidding, setBidding] = useState(false)

  const fetchLoads = async () => {
    setLoading(true)
    let q = supabase.from('loads').select('*').eq('status', 'posted').order('created_at', { ascending: false })
    if (cityFrom) q = q.eq('pickup_city', cityFrom)
    if (cityTo) q = q.eq('dropoff_city', cityTo)
    if (vehicleType) q = q.eq('vehicle_type', vehicleType)
    if (cargoType) q = q.eq('cargo_type', cargoType)
    if (maxWeight) q = q.lte('weight_tons', parseFloat(maxWeight))
    const { data } = await q.limit(40)
    let filtered = data ?? []
    if (search) filtered = filtered.filter((l: { title?: string | null; pickup_city?: string | null; dropoff_city?: string | null }) => (l.title ?? '').toLowerCase().includes(search.toLowerCase()) || (l.pickup_city ?? '').toLowerCase().includes(search.toLowerCase()) || (l.dropoff_city ?? '').toLowerCase().includes(search.toLowerCase()))
    setLoads(filtered)
    setLoading(false)
  }

  useEffect(() => { fetchLoads() }, [cityFrom, cityTo, vehicleType, cargoType, maxWeight])

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchLoads() }

  const submitBid = async () => {
    if (!selectedLoad || !bidAmount) return
    setBidding(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { toast.error('Sign in to bid'); setBidding(false); return }
    const { error } = await supabase.from('bids').insert({
      load_id: selectedLoad.id,
      driver_id: session.user.id,
      amount: parseFloat(bidAmount),
      message: bidMsg || null,
      status: 'pending',
    })
    if (error) { toast.error(error.message); setBidding(false); return }
    await supabase.from('loads').update({ bid_count: (selectedLoad.bid_count || 0) + 1 }).eq('id', selectedLoad.id)
    toast.success('Bid submitted! The shipper will review and contact you.')
    setSelectedLoad(null); setBidAmount(''); setBidMsg(''); setBidding(false)
    fetchLoads()
  }

  const clearFilters = () => { setCityFrom(''); setCityTo(''); setVehicleType(''); setCargoType(''); setMaxWeight(''); setSearch('') }
  const hasFilters = cityFrom || cityTo || vehicleType || cargoType || maxWeight || search

  const selStyle: React.CSSProperties = { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', color: '#fff', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none' }

  return (
    <div style={{ padding: '0 24px 48px' }}>
      <div style={{ paddingTop: 32, marginBottom: 28 }}>
        <div className="t-eyebrow" style={{ marginBottom: 6 }}>Freight Marketplace</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <h1 className="t-h2">Available Loads</h1>
          <Link href="/marketplace/post" className="btn btn-amber btn-md">+ Post a Load</Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 24 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search loads, cities, cargo…" className="input-base" style={{ height: 38 }} />
          </div>
          <select value={cityFrom} onChange={e => setCityFrom(e.target.value)} style={selStyle}>
            <option value="">From (any city)</option>
            {BW_CITIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={cityTo} onChange={e => setCityTo(e.target.value)} style={selStyle}>
            <option value="">To (any city)</option>
            {BW_CITIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={vehicleType} onChange={e => setVehicleType(e.target.value)} style={selStyle}>
            <option value="">Any vehicle</option>
            {VEHICLE_TYPES.map(v => <option key={v}>{v}</option>)}
          </select>
          <select value={cargoType} onChange={e => setCargoType(e.target.value)} style={selStyle}>
            <option value="">Any cargo</option>
            {CARGO_TYPES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input value={maxWeight} onChange={e => setMaxWeight(e.target.value)} type="number" placeholder="Max tons" style={{ ...selStyle, width: 100 }} />
          <button type="submit" className="btn btn-amber btn-md">Search</button>
          {hasFilters && <button type="button" onClick={clearFilters} className="btn btn-ghost btn-sm" style={{ color: '#64748B' }}>Clear</button>}
        </form>
      </div>

      {/* Results count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span className="t-small" style={{ color: '#64748B' }}>{loading ? '…' : `${loads.length} load${loads.length !== 1 ? 's' : ''} available`}</span>
        {hasFilters && <span className="badge badge-amber">Filtered</span>}
      </div>

      {/* Load cards */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} h={120} />)}
        </div>
      ) : loads.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>No loads found</div>
          <p className="t-body t-small" style={{ maxWidth: 300, margin: '0 auto 20px' }}>Try adjusting your filters, or be the first to post a load on this route.</p>
          <Link href="/marketplace/post" className="btn btn-amber btn-md">Post a Load</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loads.map(l => (
            <div key={l.id} className="card" style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, cursor: 'pointer' }}
              onClick={() => setSelectedLoad(l)}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                  <StatusBadge status={l.status} />
                  {l.bid_count > 0 && <span className="badge badge-blue">{l.bid_count} bids</span>}
                  {l.special_requirements?.length ? <span className="badge badge-amber">Special</span> : null}
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{l.title}</div>
                <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4 }}>
                  📍 <strong>{l.pickup_city}</strong> → <strong>{l.dropoff_city}</strong>
                  {l.distance_km && <span style={{ color: '#64748B', marginLeft: 8 }}>{l.distance_km} km</span>}
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span className="t-small" style={{ color: '#64748B' }}>📦 {l.cargo_type}</span>
                  <span className="t-small" style={{ color: '#64748B' }}>⚖️ {l.weight_tons}t</span>
                  <span className="t-small" style={{ color: '#64748B' }}>🚛 {l.vehicle_type}</span>
                  <span className="t-small" style={{ color: '#64748B' }}>📅 {fmtDate(l.pickup_date)}</span>
                </div>
              </div>
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                {l.budget_max && (
                  <div>
                    <div style={{ fontSize: 10, color: '#64748B', marginBottom: 2 }}>Budget up to</div>
                    <div className="t-num" style={{ fontSize: 24, color: '#F59E0B' }}>{fmtBWP(l.budget_max)}</div>
                  </div>
                )}
                <button onClick={e => { e.stopPropagation(); setSelectedLoad(l) }} className="btn btn-outline btn-sm" style={{ marginTop: 8 }}>
                  Bid Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bid Modal */}
      {selectedLoad && (
        <div onClick={() => setSelectedLoad(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}
          className="modal-bg">
          <div onClick={e => e.stopPropagation()} className="modal-box card" style={{ maxWidth: 480, width: '100%', padding: '28px 28px', position: 'relative' }}>
            <button onClick={() => setSelectedLoad(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 18 }}>✕</button>
            <div className="t-eyebrow" style={{ marginBottom: 6 }}>Place a bid</div>
            <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{selectedLoad.title}</h3>
            <p style={{ color: '#94A3B8', fontSize: 13, marginBottom: 20 }}>
              {selectedLoad.pickup_city} → {selectedLoad.dropoff_city} · {selectedLoad.weight_tons}t · {selectedLoad.vehicle_type}
            </p>
            {selectedLoad.budget_max && (
              <div style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.18)', borderRadius: 8, padding: '10px 14px', marginBottom: 18, fontSize: 13 }}>
                Budget: <strong style={{ color: '#F59E0B' }}>up to {fmtBWP(selectedLoad.budget_max)}</strong>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Your bid amount (BWP) *</label>
                <input value={bidAmount} onChange={e => setBidAmount(e.target.value)} type="number" placeholder="e.g. 3500" className="input-base" min="100" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Message to shipper (optional)</label>
                <textarea value={bidMsg} onChange={e => setBidMsg(e.target.value)} placeholder="Introduce yourself, your truck, your experience…" className="input-base" style={{ resize: 'vertical', minHeight: 80 }} rows={3} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setSelectedLoad(null)} className="btn btn-ghost btn-md" style={{ flex: '0 0 auto' }}>Cancel</button>
                <button onClick={submitBid} disabled={bidding || !bidAmount} className="btn btn-amber btn-lg" style={{ flex: 1, justifyContent: 'center' }}>
                  {bidding ? 'Submitting…' : `Submit Bid — ${bidAmount ? fmtBWP(parseFloat(bidAmount)) : 'P …'}`}
                </button>
              </div>
              <p style={{ fontSize: 11, color: '#64748B', textAlign: 'center' }}>🔒 5% platform fee applied on acceptance · Escrow protects payment</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
