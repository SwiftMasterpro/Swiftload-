import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { bidSchema } from '@/lib/validation/schemas'
import { rateLimit, getRateLimitKey } from '@/lib/security/rateLimit'

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = req.nextUrl
    const load_id  = searchParams.get('load_id')
    const driver_id = searchParams.get('driver_id')

    let q = supabase
      .from('bids')
      .select('*,driver:profiles!driver_id(id,full_name,rating,avatar_url,verified),vehicle:vehicles(*)')
      .order('amount', { ascending: true })

    if (load_id)   q = q.eq('load_id', load_id)
    if (driver_id) q = q.eq('driver_id', driver_id)

    const { data, error } = await q
    if (error) throw error
    return NextResponse.json({ bids: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!rateLimit(getRateLimitKey(req, 'bids:post'), 20, 3_600_000))
    return NextResponse.json({ error: 'Too many bids. Please slow down.' }, { status: 429 })

  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('id,role').eq('user_id', session.user.id).single()
    if (!profile || !['driver','admin'].includes(profile.role))
      return NextResponse.json({ error: 'Only drivers can place bids' }, { status: 403 })

    const body = await req.json()
    const parsed = bidSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    // Check load exists and is still open
    const { data: load } = await supabase.from('loads').select('id,status,poster_id').eq('id', parsed.data.load_id).single()
    if (!load) return NextResponse.json({ error: 'Load not found' }, { status: 404 })
    if (load.status !== 'posted') return NextResponse.json({ error: 'Load is no longer accepting bids' }, { status: 409 })
    if (load.poster_id === profile.id) return NextResponse.json({ error: 'Cannot bid on your own load' }, { status: 400 })

    // Check for duplicate bid
    const { data: existing } = await supabase.from('bids').select('id').eq('load_id', parsed.data.load_id).eq('driver_id', profile.id).single()
    if (existing) return NextResponse.json({ error: 'You have already bid on this load' }, { status: 409 })

    const { data: bid, error } = await supabase.from('bids').insert({
      load_id:   parsed.data.load_id,
      driver_id: profile.id,
      amount:    parsed.data.amount,
      message:   parsed.data.message ?? null,
      vehicle_id: parsed.data.vehicle_id ?? null,
      estimated_pickup:   parsed.data.estimated_pickup ?? null,
      estimated_delivery: parsed.data.estimated_delivery ?? null,
      status: 'pending',
    }).select().single()

    if (error) throw error

    // Increment bid count on load
    try {
      await supabase.rpc('increment_bid_count', { load_id: parsed.data.load_id })
    } catch {
      const { data } = await supabase.from('loads').select('bid_count').eq('id', parsed.data.load_id).single()
      await supabase.from('loads').update({ bid_count: (data?.bid_count ?? 0) + 1 }).eq('id', parsed.data.load_id)
    }

    return NextResponse.json({ bid }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { bid_id, action } = await req.json()
    if (!bid_id || !['accept','reject'].includes(action))
      return NextResponse.json({ error: 'bid_id and action (accept|reject) required' }, { status: 400 })

    const { data: bid } = await supabase.from('bids').select('*,load:loads(poster_id)').eq('id', bid_id).single()
    if (!bid) return NextResponse.json({ error: 'Bid not found' }, { status: 404 })

    const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', session.user.id).single()
    if (bid.load?.poster_id !== profile?.id)
      return NextResponse.json({ error: 'Only the load poster can accept/reject bids' }, { status: 403 })

    if (action === 'accept') {
      // Accept this bid, reject all others
      await supabase.from('bids').update({ status: 'accepted' }).eq('id', bid_id)
      await supabase.from('bids').update({ status: 'rejected' }).eq('load_id', bid.load_id).neq('id', bid_id)
      // Create booking
      const trackingCode = `SL${Date.now().toString(36).toUpperCase().slice(-6)}`
      await supabase.from('bookings').insert({
        load_id:      bid.load_id,
        driver_id:    bid.driver_id,
        customer_id:  profile!.id,
        amount:       bid.amount,
        tracking_code: trackingCode,
        status:       'confirmed',
      })
      await supabase.from('loads').update({ status: 'accepted' }).eq('id', bid.load_id)
    } else {
      await supabase.from('bids').update({ status: 'rejected' }).eq('id', bid_id)
    }

    return NextResponse.json({ success: true, action })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
