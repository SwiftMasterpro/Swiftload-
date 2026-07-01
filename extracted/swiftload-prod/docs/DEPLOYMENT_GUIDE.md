# Deployment Guide — Pronto SwiftLoad v2.0

## Prerequisites
- Node.js 18+
- Vercel account (team: Swift Support)
- Supabase project: pyiduregtpbynsjrnhua
- Stripe account with BWP currency enabled
- OpenAI account

## Step 1 — Database Migration
Apply migration 002 to Supabase:
```bash
# Via Supabase CLI
supabase db push --project-ref pyiduregtpbynsjrnhua

# Or paste contents of supabase/migrations/002_enhancements.sql
# into Supabase Dashboard → SQL Editor → Run
```

## Step 2 — Environment Variables
Set these in Vercel Dashboard → Project → Settings → Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
OPENAI_API_KEY
NEXT_PUBLIC_APP_URL=https://swiftload.co.bw
NEXT_PUBLIC_GOOGLE_MAPS_KEY         (optional for MVP)
```

## Step 3 — Deploy
```bash
cd /home/claude/swiftload-prod
npm install
npx vercel --prod --token=<YOUR_TOKEN>
```

Or connect GitHub repo → Vercel auto-deploys on push to main.

## Step 4 — Stripe Webhook
1. Go to Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://swiftload.co.bw/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `transfer.created`, `account.updated`
4. Copy signing secret → add as `STRIPE_WEBHOOK_SECRET` in Vercel

## Step 5 — Supabase Auth Settings
In Supabase Dashboard → Authentication → Settings:
- Site URL: `https://swiftload.co.bw`
- Redirect URLs: `https://swiftload.co.bw/auth/callback`
- Enable Google OAuth (add Client ID + Secret from Google Cloud Console)
- Enable Apple OAuth (requires Apple Developer account)

## Step 6 — Verify
```bash
curl https://swiftload.co.bw/api/health
# Expected: {"status":"healthy","db":"ok",...}
```

## Rollback
Vercel keeps all deployments. Instant rollback from Vercel Dashboard → Deployments → select previous → Promote to Production.
