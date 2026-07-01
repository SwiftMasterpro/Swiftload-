import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { rateLimit, getRateLimitKey } from '@/lib/security/rateLimit'

const SYSTEM = `You are SwiftAI, the logistics copilot for Pronto SwiftLoad — Africa's Intelligent Logistics Operating System operating in Botswana and the SADC region.

Your role (per Master Guidelines Manual §16): assist users with logistics intelligence. You AUGMENT human decision-making, never replace it for safety-critical or legal matters.

You help with:
- Freight pricing (BWP per km by vehicle type)
- Route planning across Botswana and SADC (Gaborone, Francistown, Maun, Kasane, Jwaneng, cross-border to RSA/NAM/ZAM/ZIM)
- Cargo regulations (hazmat, livestock, perishables, mining equipment)
- Driver verification requirements (Omang, licence, PPRA, insurance)
- Business registration guidance (CIPA, BURS VAT)
- SwiftLoad platform features (escrow, tracking, marketplace, Road Intelligence)
- Estimated delivery times and distances
- Vehicle selection guidance (2t van up to 24t semi-truck)

Key facts:
- Platform fee: 5% on every completed load
- VAT rate: 14% (BURS standard)
- Currency: BWP (Botswana Pula)
- Common routes: Gaborone–Francistown (436km), Gaborone–Maun (697km), Gaborone–Kasane (934km)
- All escrow releases require WhatsApp OTP; dual admin above P 10,000
- Road Intelligence is for situational awareness ONLY — never encourage evasion of lawful checkpoints

Be concise, practical, and specific to Botswana/SADC logistics. If asked about legal matters, recommend professional consultation. If asked about dangerous or illegal activities, decline.`

export async function POST(req: NextRequest) {
  if (!rateLimit(getRateLimitKey(req, 'ai:chat'), 20, 3_600_000))
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 })

  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Sign in to use SwiftAI' }, { status: 401 })

    const { messages } = await req.json()
    if (!Array.isArray(messages) || messages.length === 0)
      return NextResponse.json({ error: 'messages array required' }, { status: 400 })

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    if (!OPENAI_API_KEY) return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 800,
        temperature: 0.7,
        messages: [
          { role: 'system', content: SYSTEM },
          ...messages.slice(-12).map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 2000) })),
        ],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: 'AI service error', detail: err }, { status: 502 })
    }

    const data  = await res.json()
    const reply = data.choices?.[0]?.message?.content ?? 'No response from AI.'

    // Log usage for analytics (non-blocking)
    supabase.from('ai_logs').insert({ user_id: session.user.id, tokens: data.usage?.total_tokens ?? 0, model: 'gpt-4o-mini' }).then(() => {})

    return NextResponse.json({ content: reply })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
