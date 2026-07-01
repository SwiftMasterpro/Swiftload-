import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { rateLimit, getRateLimitKey } from '@/lib/security/rateLimit'

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/forms/submit
   Body: { form_key, ...form_data }
   Saves to form_submissions + type-specific table.
   No auth required — public form submission.
───────────────────────────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  // 10 submissions per hour per IP
  if (!rateLimit(getRateLimitKey(req, 'forms:submit'), 10, 3_600_000))
    return NextResponse.json({ error: 'Too many submissions. Please wait before trying again.' }, { status: 429 })

  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body     = await req.json()
    const { form_key, ...data } = body

    const VALID_KEYS = ['load-quote', 'driver-register', 'business-onboard', 'general-enquiry']
    if (!VALID_KEYS.includes(form_key))
      return NextResponse.json({ error: 'Invalid form_key' }, { status: 400 })

    // Check session — link to profile if logged in
    const { data: { session } } = await supabase.auth.getSession()
    let profile_id: string | null = null
    if (session) {
      const { data: p } = await supabase.from('profiles').select('id').eq('user_id', session.user.id).single()
      profile_id = p?.id ?? null
    }

    // ── Insert base submission ────────────────────────────────────────────────
    const { data: submission, error: subErr } = await supabase
      .from('form_submissions')
      .insert({
        form_key,
        source:     'native',
        status:     'new',
        profile_id,
        email:      data.email     ?? null,
        phone:      data.phone     ?? null,
        full_name:  data.full_name ?? data.contact_name ?? null,
        data:       data,
      })
      .select('id')
      .single()

    if (subErr) throw subErr

    // ── Insert into type-specific table ───────────────────────────────────────
    if (form_key === 'load-quote') {
      await supabase.from('load_quote_requests').insert({
        submission_id:  submission.id,
        full_name:      data.full_name      || '',
        email:          data.email          || '',
        phone:          data.phone          || null,
        company:        data.company        || null,
        pickup_city:    data.pickup_city    || '',
        dropoff_city:   data.dropoff_city   || '',
        cargo_type:     data.cargo_type     || '',
        weight_tons:    data.weight_tons    ? parseFloat(data.weight_tons)  : null,
        vehicle_type:   data.vehicle_type   || null,
        pickup_date:    data.pickup_date    || null,
        flexible_dates: data.flexible_dates || false,
        budget_max:     data.budget_max     ? parseFloat(data.budget_max)   : null,
        notes:          data.notes          || null,
      })
    }

    if (form_key === 'driver-register') {
      await supabase.from('driver_registration_requests').insert({
        submission_id:      submission.id,
        full_name:          data.full_name          || '',
        email:              data.email              || '',
        phone:              data.phone              || '',
        omang_number:       data.omang_number       || null,
        licence_class:      data.licence_class      || null,
        licence_expiry:     data.licence_expiry     || null,
        vehicle_make:       data.vehicle_make       || null,
        vehicle_model:      data.vehicle_model      || null,
        vehicle_year:       data.vehicle_year       ? parseInt(data.vehicle_year)       : null,
        vehicle_reg:        data.vehicle_reg        || null,
        vehicle_type:       data.vehicle_type       || null,
        capacity_tons:      data.capacity_tons      ? parseFloat(data.capacity_tons)    : null,
        home_city:          data.home_city          || null,
        routes_preferred:   data.routes_preferred   || [],
        years_experience:   data.years_experience   ? parseInt(data.years_experience)   : null,
        has_insurance:      data.has_insurance      || false,
        insurance_expiry:   data.insurance_expiry   || null,
      })
    }

    if (form_key === 'business-onboard') {
      await supabase.from('business_onboarding_requests').insert({
        submission_id:  submission.id,
        company_name:   data.company_name    || '',
        contact_name:   data.contact_name    || '',
        email:          data.email           || '',
        phone:          data.phone           || '',
        cipa_reg:       data.cipa_reg        || null,
        industry:       data.industry        || null,
        fleet_size:     data.fleet_size      ? parseInt(data.fleet_size) : null,
        monthly_loads:  data.monthly_loads   || null,
        routes:         data.routes          || [],
        needs_escrow:   data.needs_escrow    ?? true,
        needs_fleet:    data.needs_fleet     ?? false,
        needs_api:      data.needs_api       ?? false,
        notes:          data.notes           || null,
      })
    }

    if (form_key === 'general-enquiry') {
      await supabase.from('general_enquiries').insert({
        submission_id:  submission.id,
        full_name:      data.full_name  || '',
        email:          data.email      || '',
        phone:          data.phone      || null,
        subject:        data.subject    || '',
        category:       data.category   || 'general',
        message:        data.message    || '',
      })
    }

    // ── Notify admins via notification table (real-time) ─────────────────────
    try {
      await supabase.from('notifications').insert({
        user_id:    profile_id ?? '00000000-0000-0000-0000-000000000000', // system placeholder
        type:       'form_submission',
        title:      `New ${form_key} submission`,
        body:       `From: ${data.full_name ?? data.contact_name ?? data.email ?? 'Anonymous'}`,
        data:       { submission_id: submission.id, form_key },
      })
    } catch {
      // non-blocking
    }

    return NextResponse.json({ success: true, submission_id: submission.id }, { status: 201 })
  } catch (err: any) {
    console.error('[Forms API]', err)
    return NextResponse.json({ error: err.message ?? 'Submission failed' }, { status: 500 })
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/forms/submit?form_key=load-quote
   Admin endpoint — returns recent submissions for a given form
───────────────────────────────────────────────────────────────────────────── */
export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', session.user.id).single()
    if (!['admin', 'super_admin'].includes(profile?.role ?? ''))
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const { searchParams } = req.nextUrl
    const form_key  = searchParams.get('form_key')
    const status    = searchParams.get('status')
    const limit     = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100)

    let q = supabase.from('form_submissions').select('*').order('created_at', { ascending: false }).limit(limit)
    if (form_key) q = q.eq('form_key', form_key)
    if (status)   q = q.eq('status', status)

    const { data, error } = await q
    if (error) throw error

    return NextResponse.json({ submissions: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   PATCH /api/forms/submit
   Admin: update submission status / add notes
───────────────────────────────────────────────────────────────────────────── */
export async function PATCH(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('id,role').eq('user_id', session.user.id).single()
    if (!['admin', 'super_admin'].includes(profile?.role ?? ''))
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const { submission_id, status, notes } = await req.json()
    if (!submission_id) return NextResponse.json({ error: 'submission_id required' }, { status: 400 })

    const { error } = await supabase.from('form_submissions').update({
      status:       status  ?? undefined,
      notes:        notes   ?? undefined,
      actioned_by:  profile!.id,
      actioned_at:  new Date().toISOString(),
    }).eq('id', submission_id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
