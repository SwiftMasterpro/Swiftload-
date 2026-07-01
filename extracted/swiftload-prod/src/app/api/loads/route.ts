import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { loadSchema } from '@/lib/validation/schemas'
import { rateLimit, getRateLimitKey } from '@/lib/security/rateLimit'
import { BWP_PER_KM, PLATFORM_FEE_PCT, VAT_RATE } from '@/lib/utils/constants'

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = req.nextUrl
    const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit  = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)
    const offset = (page - 1) * limit

    let q = supabase
      .from('loads')
      .select('*,poster:profiles(full_name,rating,verified,avatar_url)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const status       = searchParams.get('status')
    const pickup_city  = searchParams.get('pickup_city')
    const dropoff_city = searchParams.get('dropoff_city')
    const vehicle_type = searchParams.get('vehicle_type')
    const cargo_type   = searchParams.get('cargo_type')
    const max_weight   = searchParams.get('max_weight')
    const q_text       = searchParams.get('q')

    if (status)       q = q.eq('status', status)
    if (pickup_city)  q = q.eq('pickup_city', pickup_city)
    if (dropoff_city) q = q.eq('dropoff_city', dropoff_city)
    if (vehicle_type) q = q.eq('vehicle_type', vehicle_type)
    if (cargo_type)   q = q.eq('cargo_type', cargo_type)
    if (max_weight)   q = q.lte('weight_tons', parseFloat(max_weight))
    if (q_text)       q = q.or(`title.ilike.%${q_text}%,pickup_city.ilike.%${q_text}%,dropoff_city.ilike.%${q_text}%`)

    const { data, count, error } = await q
    if (error) throw error
    return NextResponse.json({ loads: data ?? [], total: count ?? 0, page, pages: Math.ceil((count ?? 0) / limit) })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!rateLimit(getRateLimitKey(req, 'loads:post'), 10, 3_600_000))
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await req.json()
    const parsed = loadSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const { data: profile } = await supabase.from('profiles').select('id,role').eq('user_id', session.user.id).single()
    if (!profile || !['customer','business','fleet_owner','admin'].includes(profile.role))
      return NextResponse.json({ error: 'Not authorised to post loads' }, { status: 403 })

    const d = parsed.data
    const ratePerKm   = BWP_PER_KM[d.vehicle_type] ?? 10
    const estKm       = 300
    const estPrice    = Math.round(ratePerKm * estKm)
    const platformFee = Math.round(estPrice * PLATFORM_FEE_PCT)
    const vat         = Math.round((estPrice + platformFee) * VAT_RATE)

    const { data: load, error } = await supabase.from('loads').insert({
      poster_id: profile.id, ...d,
      estimated_price: estPrice, platform_fee: platformFee, vat,
      status: 'posted', bid_count: 0,
    }).select().single()

    if (error) throw error
    return NextResponse.json({ load }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
