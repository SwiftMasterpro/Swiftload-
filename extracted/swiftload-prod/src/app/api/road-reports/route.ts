import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { roadReportSchema } from '@/lib/validation/schemas'
import { rateLimit, getRateLimitKey } from '@/lib/security/rateLimit'

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = req.nextUrl
    const type   = searchParams.get('type')
    const active = searchParams.get('active') !== 'false'

    let q = supabase.from('road_reports').select('*').eq('active', active).order('created_at', { ascending: false }).limit(50)
    if (type) q = q.eq('type', type)
    const { data, error } = await q
    if (error) throw error
    return NextResponse.json({ reports: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  // 5 reports per 30 minutes per IP
  if (!rateLimit(getRateLimitKey(req, 'road-reports:post'), 5, 1_800_000))
    return NextResponse.json({ error: 'Too many reports. Please wait before submitting again.' }, { status: 429 })

  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Sign in to submit road reports' }, { status: 401 })

    const body = await req.json()
    const parsed = roadReportSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const d = parsed.data
    const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', session.user.id).single()

    // Calculate expiry based on severity
    const expiryHours = d.severity >= 5 ? 8 : d.severity === 4 ? 6 : d.severity === 3 ? 4 : 2
    const expires_at  = new Date(Date.now() + expiryHours * 3_600_000).toISOString()

    const { data: report, error } = await supabase.from('road_reports').insert({
      reporter_id:      d.anonymous ? null : (profile?.id ?? null),
      type:             d.type,
      title:            d.title,
      description:      d.description ?? null,
      lat:              d.lat,
      lng:              d.lng,
      route:            d.route ?? null,
      severity:         d.severity,
      anonymous:        d.anonymous,
      expires_at,
      verified_count:   0,
      dismissed_count:  0,
      active:           true,
      company_visible:  true,
    }).select().single()

    if (error) throw error
    return NextResponse.json({ report }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { report_id, action } = await req.json()
    if (!report_id || !['confirm','dismiss','deactivate'].includes(action))
      return NextResponse.json({ error: 'report_id and action required' }, { status: 400 })

    const { data: report } = await supabase.from('road_reports').select('*').eq('id', report_id).single()
    if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

    if (action === 'confirm') {
      await supabase.from('road_reports').update({ verified_count: (report.verified_count ?? 0) + 1 }).eq('id', report_id)
    } else if (action === 'dismiss') {
      const dc = (report.dismissed_count ?? 0) + 1
      await supabase.from('road_reports').update({ dismissed_count: dc, active: dc < 5 }).eq('id', report_id)
    } else if (action === 'deactivate') {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
      const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', session.user.id).single()
      if (!['admin','support'].includes(profile?.role ?? ''))
        return NextResponse.json({ error: 'Admin only' }, { status: 403 })
      await supabase.from('road_reports').update({ active: false }).eq('id', report_id)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
