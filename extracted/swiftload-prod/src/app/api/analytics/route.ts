import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('id,role').eq('user_id', session.user.id).single()
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const isAdmin = ['admin', 'support'].includes(profile.role)
    if (isAdmin) {
      const [{ count: users }, { count: loads }, { count: bookings }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('loads').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
      ])
      return NextResponse.json({ role: 'admin', stats: { users, loads, bookings, revenue: 0 } })
    }

    const [{ data: myLoads }, { data: myBookings }] = await Promise.all([
      supabase.from('loads').select('status,created_at').eq('poster_id', profile.id),
      supabase.from('bookings').select('status,amount,created_at').or(`customer_id.eq.${profile.id},driver_id.eq.${profile.id}`),
    ])

    return NextResponse.json({
      role: profile.role,
      loads: {
        total:     myLoads?.length ?? 0,
        active:    myLoads?.filter(l => ['posted','bidding','accepted','in_transit'].includes(l.status)).length ?? 0,
        delivered: myLoads?.filter(l => l.status === 'delivered').length ?? 0,
      },
      bookings: {
        total:     myBookings?.length ?? 0,
        delivered: myBookings?.filter(b => b.status === 'delivered').length ?? 0,
        revenue:   myBookings?.filter(b => b.status === 'delivered').reduce((s, b) => s + (b.amount ?? 0), 0) ?? 0,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
