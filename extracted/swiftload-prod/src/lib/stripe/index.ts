import Stripe from 'stripe'
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  appInfo: { name: 'Pronto SwiftLoad', version: '2.0.0' },
})
export const PLATFORM_FEE_PCT = 0.05
export async function createPaymentIntent(amount: number, metadata: Record<string,string>) {
  const fee = Math.round(amount * PLATFORM_FEE_PCT * 100)
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'bwp',
    application_fee_amount: fee,
    metadata,
    automatic_payment_methods: { enabled: true },
  })
}
export async function createTransfer(amount: number, accountId: string, metadata: Record<string,string>) {
  return stripe.transfers.create({
    amount: Math.round(amount * 100),
    currency: 'bwp',
    destination: accountId,
    metadata,
  })
}
