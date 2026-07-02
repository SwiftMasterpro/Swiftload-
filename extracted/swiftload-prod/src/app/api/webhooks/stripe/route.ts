import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body    = await req.text()
  const sig     = headers().get('stripe-signature')
  const secret  = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !secret)
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret)
  } catch (err: any) {
    console.error('[Stripe Webhook] Invalid signature:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  const supabase = createAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured yet.' }, { status: 503 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as any
        const { booking_id } = pi.metadata ?? {}
        if (booking_id) {
          await supabase.from('escrow_transactions').update({ status: 'held', stripe_payment_intent_id: pi.id }).eq('booking_id', booking_id)
          await supabase.from('bookings').update({ escrow_held: true }).eq('id', booking_id)
        }
        break
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as any
        const { booking_id } = pi.metadata ?? {}
        if (booking_id) {
          await supabase.from('escrow_transactions').update({ status: 'failed' }).eq('booking_id', booking_id)
          await supabase.from('bookings').update({ escrow_held: false }).eq('id', booking_id)
        }
        break
      }
      case 'transfer.created': {
        const transfer = event.data.object as any
        const { booking_id } = transfer.metadata ?? {}
        if (booking_id) {
          await supabase.from('escrow_transactions').update({
            status: 'released',
            stripe_transfer_id: transfer.id,
            released_at: new Date().toISOString(),
          }).eq('booking_id', booking_id)
        }
        break
      }
      case 'account.updated': {
        const account = event.data.object as any
        if (account.charges_enabled) {
          await supabase.from('profiles').update({
            stripe_account_id: account.id,
            stripe_payouts_enabled: true,
          }).eq('stripe_account_id', account.id)
        }
        break
      }
      default:
        console.log(`[Stripe Webhook] Unhandled: ${event.type}`)
    }
  } catch (err: any) {
    console.error('[Stripe Webhook] Handler error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
