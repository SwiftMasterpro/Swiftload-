import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = req.nextUrl
    const tracking_code = searchParams.get('code')
    const booking_id    = searchParams.get('booking_id')

    if (!tracking_code && !booking_id)
      return NextResponse.json({ error: 'code or booking_id required' }, { status: 400 })

    let bookingQuery = supabase.from('bookings').select('*,load:loads(*),driver:profiles!driver_id(full_name,rating,avatar_url,phone)')
    if (tracking_code) bookingQuery = bookingQuery.eq('tracking_code', tracking_code.toUpperCase())
    else bookingQuery = bookingQuery.eq('id', booking_id!)
    const { data: booking, error: bErr } = await bookingQuery.single()
    if (bErr || !booking) return NextResponse.json({ error: 'Delivery not found' }, { status: 404 })

    const { data: updates } = await supabase
      .from('tracking_updates')
      .select('*')
      .eq('booking_id', booking.id)
      .order('created_at', { ascending: false })
      .limit(50)

    return NextResponse.json({ booking, updates: updates ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('id,role').eq('user_id', session.user.id).single()
    if (!profile || !['driver','admin'].includes(profile.role))
      return NextResponse.json({ error: 'Only drivers can post GPS updates' }, { status: 403 })

    const { booking_id, lat, lng, speed_kmh, heading, event, notes, photo_url } = await req.json()
    if (!booking_id || lat == null || lng == null)
      return NextResponse.json({ error: 'booking_id, lat, lng required' }, { status: 400 })

    // Verify driver owns this booking
    const { data: booking } = await supabase.from('bookings').select('id,driver_id,status').eq('id', booking_id).single()
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    if (booking.driver_id !== profile.id && profile.role !== 'admin')
      return NextResponse.json({ error: 'Not authorised for this booking' }, { status: 403 })

    const { data: update, error } = await supabase.from('tracking_updates').insert({
      booking_id, lat, lng,
      speed_kmh:  speed_kmh  ?? null,
      heading:    heading    ?? null,
      event:      event      ?? null,
      notes:      notes      ?? null,
      photo_url:  photo_url  ?? null,
    }).select().single()

    if (error) throw error

    // Auto-update booking status to in_transit if confirmed
    if (booking.status === 'confirmed') {
      await supabase.from('bookings').update({ status: 'in_transit', pickup_confirmed_at: new Date().toISOString() }).eq('id', booking_id)
    }

    return NextResponse.json({ update }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
