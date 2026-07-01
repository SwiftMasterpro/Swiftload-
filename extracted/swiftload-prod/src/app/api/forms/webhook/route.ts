import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createHmac } from 'crypto'

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/forms/webhook
   
   Receives Google Forms responses forwarded by a Google Apps Script.
   
   Setup in Google Forms:
   1. Open your Google Form → Extensions → Apps Script
   2. Paste the Apps Script from /docs/GOOGLE_FORMS_SETUP.md
   3. Set trigger: onFormSubmit → run webhook function
   4. Set WEBHOOK_URL = https://swiftload.co.bw/api/forms/webhook
   5. Set WEBHOOK_SECRET = (match GOOGLE_FORMS_WEBHOOK_SECRET env var)
   
   Payload format (sent by Apps Script):
   {
     "form_key": "load-quote",
     "response_id": "unique-google-response-id",
     "timestamp": "2025-01-15T10:00:00Z",
     "respondent_email": "user@example.com",  // if email collection enabled
     "answers": {
       "Full name": "Thabo Molefe",
       "Email": "thabo@example.com",
       ...
     },
     "hmac": "sha256-hex-signature"
   }
───────────────────────────────────────────────────────────────────────────── */

function verifyHmac(payload: string, signature: string, secret: string): boolean {
  if (!secret || !signature) return false
  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  return expected === signature
}

// Field name mappings from Google Form questions to our DB columns
const FIELD_MAPS: Record<string, Record<string, string>> = {
  'load-quote': {
    'Full name': 'full_name', 'Full Name': 'full_name',
    'Email address': 'email', 'Email': 'email',
    'Phone number': 'phone', 'Phone': 'phone',
    'Company name': 'company',
    'Pickup city': 'pickup_city', 'Pickup City': 'pickup_city',
    'Dropoff city': 'dropoff_city', 'Dropoff City': 'dropoff_city',
    'Cargo type': 'cargo_type', 'Cargo Type': 'cargo_type',
    'Weight (tons)': 'weight_tons',
    'Vehicle type': 'vehicle_type', 'Vehicle Type': 'vehicle_type',
    'Preferred pickup date': 'pickup_date',
    'Maximum budget (BWP)': 'budget_max',
    'Flexible dates?': 'flexible_dates',
    'Special instructions': 'notes',
  },
  'driver-register': {
    'Full name': 'full_name', 'Full Name': 'full_name',
    'Email address': 'email', 'Email': 'email',
    'Phone number': 'phone', 'Phone': 'phone',
    'Home city': 'home_city',
    'Omang / National ID': 'omang_number',
    'Licence class': 'licence_class',
    'Licence expiry date': 'licence_expiry',
    'Vehicle make': 'vehicle_make',
    'Vehicle model': 'vehicle_model',
    'Vehicle year': 'vehicle_year',
    'Registration number': 'vehicle_reg',
    'Vehicle type': 'vehicle_type',
    'Capacity (tons)': 'capacity_tons',
    'Years of experience': 'years_experience',
    'Has insurance?': 'has_insurance',
    'Insurance expiry': 'insurance_expiry',
    'Preferred routes': 'routes_preferred',
  },
  'business-onboard': {
    'Company name': 'company_name',
    'Contact name': 'contact_name', 'Full name': 'contact_name',
    'Email address': 'email', 'Email': 'email',
    'Phone number': 'phone', 'Phone': 'phone',
    'CIPA registration number': 'cipa_reg',
    'Industry': 'industry',
    'Monthly load volume': 'monthly_loads',
    'Fleet size': 'fleet_size',
    'Primary routes': 'routes',
    'Additional notes': 'notes',
  },
  'general-enquiry': {
    'Full name': 'full_name', 'Full Name': 'full_name',
    'Email address': 'email', 'Email': 'email',
    'Phone number': 'phone', 'Phone': 'phone',
    'Subject': 'subject',
    'Category': 'category',
    'Message': 'message',
  },
}

function mapAnswers(form_key: string, answers: Record<string, string>): Record<string, any> {
  const map  = FIELD_MAPS[form_key] ?? {}
  const data: Record<string, any> = {}
  for (const [question, answer] of Object.entries(answers)) {
    const key = map[question] ?? map[question.trim()]
    if (key) {
      // Type coercions
      if (['weight_tons','budget_max','capacity_tons'].includes(key)) data[key] = parseFloat(answer) || null
      else if (['vehicle_year','years_experience','fleet_size'].includes(key)) data[key] = parseInt(answer) || null
      else if (['has_insurance','flexible_dates'].includes(key)) data[key] = ['yes','true','1'].includes(answer.toLowerCase())
      else if (key === 'routes_preferred' || key === 'routes') data[key] = answer.split(',').map(s => s.trim()).filter(Boolean)
      else data[key] = answer
    }
  }
  return data
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const body    = JSON.parse(rawBody)
    const { form_key, response_id, timestamp, respondent_email, answers, hmac } = body

    // ── Verify HMAC signature ─────────────────────────────────────────────────
    const secret = process.env.GOOGLE_FORMS_WEBHOOK_SECRET ?? ''
    if (secret) {
      const payloadToSign = `${form_key}:${response_id}:${timestamp}`
      if (!verifyHmac(payloadToSign, hmac ?? '', secret)) {
        console.warn('[Google Forms Webhook] Invalid HMAC signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    // ── Validate ──────────────────────────────────────────────────────────────
    if (!form_key || !answers || typeof answers !== 'object')
      return NextResponse.json({ error: 'form_key and answers required' }, { status: 400 })

    const VALID_KEYS = ['load-quote', 'driver-register', 'business-onboard', 'general-enquiry']
    if (!VALID_KEYS.includes(form_key))
      return NextResponse.json({ error: 'Unknown form_key' }, { status: 400 })

    const supabase = createAdminClient()

    // ── Map answers to DB fields ──────────────────────────────────────────────
    const mapped = mapAnswers(form_key, answers)
    const email  = mapped.email ?? respondent_email ?? null
    const name   = mapped.full_name ?? mapped.contact_name ?? null

    // ── Insert form_submission ────────────────────────────────────────────────
    const { data: existing } = await supabase.from('form_submissions')
      .select('id').eq('google_response_id', response_id).single()

    if (existing) {
      return NextResponse.json({ success: true, duplicate: true, submission_id: existing.id })
    }

    const { data: submission, error: subErr } = await supabase.from('form_submissions').insert({
      form_key,
      source:             'google_forms',
      status:             'new',
      email,
      full_name:          name,
      phone:              mapped.phone ?? null,
      data:               { ...mapped, raw_answers: answers },
      google_response_id: response_id ?? null,
    }).select('id').single()

    if (subErr) throw subErr

    // ── Insert into type-specific table ───────────────────────────────────────
    if (form_key === 'load-quote' && mapped.pickup_city && mapped.dropoff_city) {
      try {
        await supabase.from('load_quote_requests').insert({
          submission_id: submission.id,
          full_name:     name ?? '',
          email:         email ?? '',
          ...mapped,
        })
      } catch (e) {
        console.error('[LQR insert]', e)
      }
    }
    if (form_key === 'driver-register' && name && email) {
      try {
        await supabase.from('driver_registration_requests').insert({
          submission_id: submission.id,
          full_name:     name,
          email,
          phone:         mapped.phone ?? '',
          ...mapped,
        })
      } catch (e) {
        console.error('[DRR insert]', e)
      }
    }
    if (form_key === 'business-onboard' && mapped.company_name) {
      try {
        await supabase.from('business_onboarding_requests').insert({
          submission_id: submission.id,
          company_name:  mapped.company_name ?? '',
          contact_name:  name ?? '',
          email:         email ?? '',
          phone:         mapped.phone ?? '',
          ...mapped,
        })
      } catch (e) {
        console.error('[BOR insert]', e)
      }
    }
    if (form_key === 'general-enquiry' && name && email) {
      try {
        await supabase.from('general_enquiries').insert({
          submission_id: submission.id,
          full_name:     name,
          email,
          subject:       mapped.subject ?? 'Google Forms enquiry',
          message:       mapped.message ?? JSON.stringify(answers),
          category:      mapped.category ?? 'general',
          phone:         mapped.phone ?? null,
        })
      } catch (e) {
        console.error('[GE insert]', e)
      }
    }

    console.log(`[Google Forms Webhook] Received ${form_key} from ${email ?? 'unknown'} — ID: ${submission.id}`)
    return NextResponse.json({ success: true, submission_id: submission.id })
  } catch (err: any) {
    console.error('[Google Forms Webhook] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Google Forms verification challenge (some webhooks do a GET first)
export async function GET(req: NextRequest) {
  const challenge = req.nextUrl.searchParams.get('challenge')
  if (challenge) return new Response(challenge, { status: 200 })
  return NextResponse.json({ status: 'ok', service: 'SwiftLoad Google Forms Webhook' })
}
