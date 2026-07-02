import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    const message = typeof body?.message === 'string' ? body.message.trim() : ''

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Please provide your name, email, and a message.' }, { status: 400 })
    }

    if (!emailPattern.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    if (message.length < 10) {
      return NextResponse.json({ error: 'Please share a little more detail so we can help you.' }, { status: 400 })
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json({ error: 'Contact submissions are temporarily unavailable. Please email Prontoswift@proton.me directly.' }, { status: 503 })
    }

    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Contact submissions are temporarily unavailable. Please email Prontoswift@proton.me directly.' }, { status: 503 })
    }

    const { error } = await supabase.from('contact_submissions').insert({
      name,
      email,
      message,
      created_at: new Date().toISOString(),
    })

    if (error) {
      return NextResponse.json({ error: 'We could not save your request right now. Please try again shortly.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to submit contact form.' }, { status: 500 })
  }
}
