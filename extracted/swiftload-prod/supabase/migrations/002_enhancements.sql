-- ─────────────────────────────────────────────────────────────────────────────
-- PRONTO SWIFTLOAD — Migration 002: Enhancements & Missing Tables
-- ─────────────────────────────────────────────────────────────────────────────

-- ── conversations table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participants     UUID[] NOT NULL,
  last_message     TEXT,
  last_message_at  TIMESTAMPTZ,
  load_id          UUID REFERENCES loads(id) ON DELETE SET NULL,
  booking_id       UUID REFERENCES bookings(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING gin(participants);

-- ── messages table ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content          TEXT NOT NULL,
  type             TEXT DEFAULT 'text' CHECK (type IN ('text','image','file','system')),
  media_url        TEXT,
  read_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- ── notifications table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  data        JSONB DEFAULT '{}',
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE read_at IS NULL;

-- ── escrow_transactions table ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id                        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id                UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  load_id                   UUID REFERENCES loads(id) ON DELETE SET NULL,
  from_user_id              UUID REFERENCES profiles(id) ON DELETE SET NULL,
  to_user_id                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  amount                    NUMERIC(12,2) NOT NULL,
  platform_fee              NUMERIC(12,2) DEFAULT 0,
  vat                       NUMERIC(12,2) DEFAULT 0,
  stripe_payment_intent_id  TEXT,
  stripe_transfer_id        TEXT,
  status                    TEXT DEFAULT 'pending' CHECK (status IN ('pending','held','released','refunded','disputed','failed')),
  released_at               TIMESTAMPTZ,
  disputed_at               TIMESTAMPTZ,
  created_at                TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_escrow_booking_id ON escrow_transactions(booking_id);

-- ── escrow_approvals (dual-admin for large releases) ─────────────────────────
CREATE TABLE IF NOT EXISTS escrow_approvals (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  admin_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  approved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id, admin_id)
);

-- ── ai_logs table ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_logs (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  model      TEXT DEFAULT 'gpt-4o-mini',
  tokens     INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Add missing columns to existing tables ────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_account_id       TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payouts_enabled  BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS delivery_otp            TEXT,
  ADD COLUMN IF NOT EXISTS trust_score             NUMERIC(4,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_at          TIMESTAMPTZ;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS escrow_held             BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS escrow_released         BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS delivery_otp            TEXT,
  ADD COLUMN IF NOT EXISTS disputed_at             TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivery_confirmed_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pickup_confirmed_at     TIMESTAMPTZ;

ALTER TABLE loads
  ADD COLUMN IF NOT EXISTS estimated_price         NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS platform_fee            NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS vat                     NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS distance_km             INTEGER,
  ADD COLUMN IF NOT EXISTS special_requirements    TEXT[];

ALTER TABLE road_reports
  ADD COLUMN IF NOT EXISTS company_visible         BOOLEAN DEFAULT TRUE;

ALTER TABLE support_tickets
  ADD COLUMN IF NOT EXISTS booking_id              UUID REFERENCES bookings(id) ON DELETE SET NULL;

-- ── Useful indexes ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_loads_status        ON loads(status);
CREATE INDEX IF NOT EXISTS idx_loads_pickup_city   ON loads(pickup_city);
CREATE INDEX IF NOT EXISTS idx_loads_dropoff_city  ON loads(dropoff_city);
CREATE INDEX IF NOT EXISTS idx_loads_created_at    ON loads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bids_load_id        ON bids(load_id);
CREATE INDEX IF NOT EXISTS idx_bids_driver_id      ON bids(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_driver_id  ON bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tracking   ON bookings(tracking_code);
CREATE INDEX IF NOT EXISTS idx_road_reports_active ON road_reports(active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_booking_id ON tracking_updates(booking_id);

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE conversations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_logs             ENABLE ROW LEVEL SECURITY;

-- Conversations: only participants can see
CREATE POLICY IF NOT EXISTS "conversations_participants" ON conversations
  FOR ALL USING (auth.uid()::text = ANY(SELECT p.user_id::text FROM profiles p WHERE p.id = ANY(participants)));

-- Messages: only conversation participants
CREATE POLICY IF NOT EXISTS "messages_participants" ON messages
  FOR ALL USING (conversation_id IN (
    SELECT id FROM conversations WHERE auth.uid()::text = ANY(
      SELECT p.user_id::text FROM profiles p WHERE p.id = ANY(participants)
    )
  ));

-- Notifications: own only
CREATE POLICY IF NOT EXISTS "notifications_own" ON notifications
  FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Escrow: own transactions only (or admin)
CREATE POLICY IF NOT EXISTS "escrow_own" ON escrow_transactions
  FOR SELECT USING (
    from_user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    to_user_id   IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin','support'))
  );

-- AI logs: own only
CREATE POLICY IF NOT EXISTS "ai_logs_own" ON ai_logs
  FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ── Helper function: increment bid count safely ───────────────────────────────
CREATE OR REPLACE FUNCTION increment_bid_count(load_id UUID)
RETURNS VOID LANGUAGE sql AS $$
  UPDATE loads SET bid_count = COALESCE(bid_count, 0) + 1 WHERE id = load_id;
$$;

-- ── Realtime: enable for key tables ──────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE tracking_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE road_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
