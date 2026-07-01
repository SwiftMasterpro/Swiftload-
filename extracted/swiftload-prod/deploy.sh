#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
# Pronto SwiftLoad — One-command Deploy Script
# Usage: ./deploy.sh
# Requires: Node.js 18+, Vercel CLI (npm i -g vercel), env vars set
# ──────────────────────────────────────────────────────────────────────────────
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; AMBER='\033[0;33m'; NC='\033[0m'
info()  { echo -e "${AMBER}[SwiftLoad]${NC} $1"; }
ok()    { echo -e "${GREEN}[✓]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

echo ""
echo "  ██████ ██     ██ ██ ███████ ████████ ██       ██████   █████  ██████  "
echo "  ██     ██     ██ ██ ██         ██    ██      ██    ██ ██   ██ ██   ██ "
echo "  ███████ ██   ██  ██ █████      ██    ██      ██    ██ ███████ ██   ██ "
echo "  ╚═════╝ ╚═════╝ ╚═╝ ╚═════╝   ╚═╝   ╚══════╝ ╚═════╝ ╚═╝ ╚═╝ ╚═╝  ╚═╝"
echo "  Pronto SwiftLoad — Africa's Logistics OS — Deploy v2.0"
echo ""

# ── 1. Check prerequisites ──────────────────────────────────────────────────
info "Checking prerequisites..."
command -v node  >/dev/null 2>&1 || error "Node.js not found. Install v18+ from nodejs.org"
command -v npm   >/dev/null 2>&1 || error "npm not found"
command -v vercel>/dev/null 2>&1 || { info "Installing Vercel CLI..."; npm install -g vercel; }
ok "Prerequisites met"

# ── 2. Install dependencies ─────────────────────────────────────────────────
info "Installing dependencies..."
npm install --legacy-peer-deps
ok "Dependencies installed"

# ── 3. Check required env vars ───────────────────────────────────────────────
info "Checking environment variables..."
REQUIRED_VARS=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "STRIPE_SECRET_KEY"
  "STRIPE_WEBHOOK_SECRET"
  "OPENAI_API_KEY"
  "NEXT_PUBLIC_APP_URL"
)
MISSING=0
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo -e "  ${RED}✗${NC} $var is not set"
    MISSING=$((MISSING+1))
  else
    echo -e "  ${GREEN}✓${NC} $var"
  fi
done
[ $MISSING -gt 0 ] && error "$MISSING required env vars missing. See docs/ENV_VARIABLES.md"
ok "All env vars present"

# ── 4. Type check ────────────────────────────────────────────────────────────
info "Running type check..."
npx tsc --noEmit && ok "TypeScript OK" || error "TypeScript errors found"

# ── 5. Build ─────────────────────────────────────────────────────────────────
info "Building Next.js app..."
npm run build
ok "Build successful"

# ── 6. Deploy to Vercel ──────────────────────────────────────────────────────
info "Deploying to Vercel (team: Swift Support)..."
vercel deploy --prod \
  --token="${VERCEL_TOKEN:-}" \
  --yes \
  --env NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --env NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  --env SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
  --env STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" \
  --env STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET" \
  --env OPENAI_API_KEY="$OPENAI_API_KEY" \
  --env NEXT_PUBLIC_APP_URL="$NEXT_PUBLIC_APP_URL"

ok "Deployed!"

# ── 7. Health check ──────────────────────────────────────────────────────────
info "Running health check..."
sleep 5
HEALTH=$(curl -sf "${NEXT_PUBLIC_APP_URL}/api/health" 2>/dev/null || echo "unreachable")
echo "  Health: $HEALTH"

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}  SwiftLoad v2.0 deployed successfully!${NC}"
echo -e "${GREEN}  URL: ${NEXT_PUBLIC_APP_URL}${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "  Next steps:"
echo "  1. Apply DB migration: paste supabase/migrations/002_enhancements.sql"
echo "     into Supabase Dashboard → SQL Editor"
echo "  2. Set Stripe webhook: ${NEXT_PUBLIC_APP_URL}/api/webhooks/stripe"
echo "  3. Enable Google OAuth in Supabase Auth settings"
echo ""
