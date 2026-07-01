# Deploy Pronto SwiftLoad — One Command

## Prerequisites
Your machine needs Node.js 18+ and internet access.

## Step 1: Set Environment Variables
```bash
export NEXT_PUBLIC_SUPABASE_URL="https://pyiduregtpbynsjrnhua.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_XLuZMcJTC7U6whFUtpHnvA_R_3DsYWG"
export SUPABASE_SERVICE_ROLE_KEY="<from Supabase Dashboard → Settings → API>"
export STRIPE_SECRET_KEY="<from Stripe Dashboard>"
export STRIPE_WEBHOOK_SECRET="<after creating webhook below>"
export NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="<from Stripe Dashboard>"
export OPENAI_API_KEY="<from OpenAI>"
export NEXT_PUBLIC_APP_URL="https://swiftload.co.bw"
```

## Step 2: Extract + Deploy
```bash
# Unzip the codebase
unzip swiftload-prod-v2.zip
cd swiftload-prod

# Install Vercel CLI if not already installed
npm install -g vercel

# Install dependencies
npm install --legacy-peer-deps

# Login to Vercel (Swift Support team)
vercel login

# Deploy to production (will create project on first run)
vercel --prod --team swift-support \
  --env NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --env NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  --env SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
  --env STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" \
  --env STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET" \
  --env NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" \
  --env OPENAI_API_KEY="$OPENAI_API_KEY" \
  --env NEXT_PUBLIC_APP_URL="$NEXT_PUBLIC_APP_URL"
```

## Step 3: After Deploy — Configure Stripe Webhook
1. Go to https://dashboard.stripe.com/webhooks → Add endpoint
2. URL: `https://swiftload.co.bw/api/webhooks/stripe`
3. Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `transfer.created`, `account.updated`
4. Copy Signing Secret → Add to Vercel: Settings → Environment Variables → `STRIPE_WEBHOOK_SECRET`
5. Redeploy: `vercel --prod`

## Step 4: Configure Auth
In Supabase Dashboard (https://supabase.com/dashboard/project/pyiduregtpbynsjrnhua):
- Authentication → URL Configuration → Site URL: `https://swiftload.co.bw`
- Add Redirect URL: `https://swiftload.co.bw/auth/callback`
- Enable Google OAuth: Providers → Google → Add Client ID + Secret
- Enable Apple OAuth: Providers → Apple

## Step 5: Verify
```bash
curl https://swiftload.co.bw/api/health
# Expected: {"status":"healthy","db":"ok",...}
```

## Database
The Supabase database (pyiduregtpbynsjrnhua) is already restored and has all 21 tables applied.
No further migration steps needed.
