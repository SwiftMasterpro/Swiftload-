import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { PLATFORM_FEE_PCT } from '@/lib/utils/constants'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { action, booking_id, otp_code, dispute_reason, amount } = await req.json()

    const { data: booking } = await supabase
      .from('bookings')
      .select('*,load:loads(*),driver:profiles!driver_id(stripe_account_id)')
      .eq('id', booking_id)
      .single()

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    const { data: profile } = await supabase.from('profiles').select('id,role').eq('user_id', session.user.id).single()

    // ── HOLD: create payment intent ─────────────────────────────────────────
    if (action === 'hold') {
      if (booking.customer_id !== profile?.id && profile?.role !== 'admin')
        return NextResponse.json({ error: 'Not authorised' }, { status: 403 })
      if (booking.status !== 'confirmed')
        return NextResponse.json({ error: 'Booking must be confirmed before payment' }, { status: 409 })

      const feeAmount  = Math.round(booking.amount * PLATFORM_FEE_PCT * 100)
      const intent     = await stripe.paymentIntents.create({
        amount:   Math.round(booking.amount * 100),
        currency: 'bwp',
        application_fee_amount: feeAmount,
        metadata: { booking_id, load_id: booking.load_id, driver_id: booking.driver_id },
        capture_method: 'manual', // hold, not capture yet
      })

      await supabase.from('escrow_transactions').insert({
        booking_id, load_id: booking.load_id,
        from_user_id: profile!.id, to_user_id: booking.driver_id,
        amount: booking.amount, platform_fee: booking.amount * PLATFORM_FEE_PCT,
        stripe_payment_intent_id: intent.id,
        status: 'held',
      })
      await supabase.from('bookings').update({ escrow_held: true }).eq('id', booking_id)

      return NextResponse.json({ client_secret: intent.client_secret })
    }

    // ── RELEASE: confirm delivery via OTP ───────────────────────────────────
    if (action === 'release') {
      if (booking.customer_id !== profile?.id && profile?.role !== 'admin')
        return NextResponse.json({ error: 'Only customer can confirm delivery' }, { status: 403 })

      // Validate OTP (stored in bookings.delivery_otp)
      if (profile?.role !== 'admin') {
        if (!otp_code) return NextResponse.json({ error: 'OTP required to release escrow' }, { status: 400 })
        if (booking.delivery_otp !== otp_code)
          return NextResponse.json({ error: 'Invalid OTP. Check your WhatsApp.' }, { status: 400 })
      }

      // Large releases require dual admin (>= P10,000)
      if (booking.amount >= 10_000 && profile?.role !== 'admin') {
        const { count } = await supabase.from('escrow_approvals').select('*', { count: 'exact', head: true }).eq('booking_id', booking_id)
        if ((count ?? 0) < 2)
          return NextResponse.json({ error: 'Payments ≥ P10,000 require dual admin approval' }, { status: 403 })
      }

      // Capture payment
      const { data: escrow } = await supabase.from('escrow_transactions').select('stripe_payment_intent_id').eq('booking_id', booking_id).single()
      if (escrow?.stripe_payment_intent_id) {
        await stripe.paymentIntents.capture(escrow.stripe_payment_intent_id)
      }

      // Transfer to driver (minus platform fee)
      const driverPayout = Math.round(booking.amount * (1 - PLATFORM_FEE_PCT))
      if (booking.driver?.stripe_account_id) {
        await stripe.transfers.create({
          amount:      driverPayout * 100,
          currency:    'bwp',
          destination: booking.driver.stripe_account_id,
          metadata:    { booking_id },
        })
      }

      await supabase.from('escrow_transactions').update({ status: 'released', released_at: new Date().toISOString() }).eq('booking_id', booking_id)
      await supabase.from('bookings').update({ status: 'delivered', delivery_confirmed_at: new Date().toISOString(), escrow_released: true }).eq('id', booking_id)
      await supabase.from('loads').update({ status: 'delivered' }).eq('id', booking.load_id)

      return NextResponse.json({ success: true, payout: driverPayout })
    }

    // ── DISPUTE ─────────────────────────────────────────────────────────────
    if (action === 'dispute') {
      if (booking.customer_id !== profile?.id && booking.driver_id !== profile?.id)
        return NextResponse.json({ error: 'Not a participant in this booking' }, { status: 403 })

      await supabase.from('escrow_transactions').update({ status: 'disputed' }).eq('booking_id', booking_id)
      await supabase.from('bookings').update({ status: 'disputed', disputed_at: new Date().toISOString() }).eq('id', booking_id)
      await supabase.from('support_tickets').insert({
        creator_id: profile!.id,
        category:   'dispute',
        subject:    `Escrow dispute — Booking ${booking_id.slice(-8)}`,
        body:       dispute_reason ?? 'Dispute raised — no reason provided',
        priority:   'high',
        status:     'open',
        booking_id,
      })

      return NextResponse.json({ success: true, message: 'Dispute filed. Our team will respond within 24 hours. Funds remain held.' })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
