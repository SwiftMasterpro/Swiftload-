-- ═══════════════════════════════════════════════════════════════════════
-- PRONTO SWIFTLOAD — Production Database Schema
-- Supabase Project: pyiduregtpbynsjrnhua
-- ═══════════════════════════════════════════════════════════════════════

-- ── Extensions ──────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ── Enums ───────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('customer','driver','business','fleet_owner','admin','support');
CREATE TYPE load_status AS ENUM ('draft','posted','bidding','assigned','pickup_pending','in_transit','delivered','confirmed','disputed','cancelled');
CREATE TYPE escrow_status AS ENUM ('pending','held','released','refunded','disputed');
CREATE TYPE verification_status AS ENUM ('pending','under_review','approved','rejected','expired');
CREATE TYPE road_report_type AS ENUM ('police_checkpoint','roadblock','accident','traffic','breakdown','flood','construction','weighbridge','fuel_shortage','dangerous_road','unsafe_area','road_closure');
CREATE TYPE vehicle_type AS ENUM ('bakkie_1t','van_2t','truck_4t','truck_8t','truck_14t','semi_24t','flatbed','refrigerated','crane');
CREATE TYPE message_type AS ENUM ('text','image','file','location','voice');
CREATE TYPE doc_type AS ENUM ('omang','license','vehicle_reg','transport_permit','insurance','roadworthy');

-- ── Profiles ─────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  full_name       TEXT NOT NULL DEFAULT '',
  phone           TEXT,
  avatar_url      TEXT,
  role            user_role NOT NULL DEFAULT 'customer',
  company_name    TEXT,
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  rating          NUMERIC(3,2) DEFAULT 5.0,
  total_trips     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role     ON profiles(role);

-- ── Driver documents ─────────────────────────────────────────────────
CREATE TABLE driver_documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id       UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  type            doc_type NOT NULL,
  url             TEXT NOT NULL,
  is_verified     BOOLEAN DEFAULT FALSE,
  expiry_date     DATE,
  uploaded_at     TIMESTAMPTZ DEFAULT NOW(),
  verified_at     TIMESTAMPTZ,
  UNIQUE(driver_id, type)
);

-- ── Vehicles ─────────────────────────────────────────────────────────
CREATE TABLE vehicles (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id            UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  registration        TEXT UNIQUE NOT NULL,
  make                TEXT NOT NULL,
  model               TEXT NOT NULL,
  year                INTEGER,
  type                vehicle_type NOT NULL,
  capacity_kg         INTEGER NOT NULL,
  capacity_m3         NUMERIC(8,2),
  color               TEXT,
  photos              TEXT[] DEFAULT '{}',
  is_available        BOOLEAN DEFAULT TRUE,
  current_driver_id   UUID REFERENCES profiles(user_id),
  insurance_expiry    DATE,
  roadworthy_expiry   DATE,
  last_service_date   DATE,
  verification_status verification_status DEFAULT 'pending',
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_vehicles_owner ON vehicles(owner_id);
CREATE INDEX idx_vehicles_type  ON vehicles(type);

-- ── Loads ─────────────────────────────────────────────────────────────
CREATE TABLE loads (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poster_id               UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  title                   TEXT NOT NULL,
  description             TEXT,
  cargo_type              TEXT NOT NULL DEFAULT 'general',
  weight_kg               NUMERIC(10,2) NOT NULL,
  volume_m3               NUMERIC(8,2),
  pickup_address          TEXT NOT NULL,
  pickup_lat              DOUBLE PRECISION,
  pickup_lng              DOUBLE PRECISION,
  delivery_address        TEXT NOT NULL,
  delivery_lat            DOUBLE PRECISION,
  delivery_lng            DOUBLE PRECISION,
  pickup_date             TIMESTAMPTZ NOT NULL,
  delivery_deadline       TIMESTAMPTZ,
  required_vehicle_type   vehicle_type,
  status                  load_status NOT NULL DEFAULT 'posted',
  budget_min              NUMERIC(12,2),
  budget_max              NUMERIC(12,2),
  accepted_bid_id         UUID,
  distance_km             NUMERIC(10,2),
  estimated_duration_hours NUMERIC(6,2),
  photos                  TEXT[] DEFAULT '{}',
  special_requirements    TEXT,
  view_count              INTEGER DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_loads_poster    ON loads(poster_id);
CREATE INDEX idx_loads_status    ON loads(status);
CREATE INDEX idx_loads_pickup    ON loads(pickup_date);
CREATE INDEX idx_loads_created   ON loads(created_at DESC);
CREATE INDEX idx_loads_type      ON loads(required_vehicle_type);

-- ── Bids ──────────────────────────────────────────────────────────────
CREATE TABLE bids (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  load_id             UUID NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
  driver_id           UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  vehicle_id          UUID REFERENCES vehicles(id),
  amount              NUMERIC(12,2) NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'BWP',
  message             TEXT,
  estimated_arrival   TIMESTAMPTZ,
  status              TEXT NOT NULL DEFAULT 'pending',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(load_id, driver_id)
);
CREATE INDEX idx_bids_load   ON bids(load_id);
CREATE INDEX idx_bids_driver ON bids(driver_id);
CREATE INDEX idx_bids_status ON bids(status);

-- ── Bookings ──────────────────────────────────────────────────────────
CREATE TABLE bookings (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  load_id             UUID NOT NULL REFERENCES loads(id),
  driver_id           UUID NOT NULL REFERENCES profiles(user_id),
  customer_id         UUID NOT NULL REFERENCES profiles(user_id),
  bid_id              UUID NOT NULL REFERENCES bids(id),
  status              load_status NOT NULL DEFAULT 'assigned',
  pickup_otp          TEXT,
  delivery_otp        TEXT,
  pickup_confirmed_at TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  confirmed_at        TIMESTAMPTZ,
  pickup_photos       TEXT[] DEFAULT '{}',
  delivery_photos     TEXT[] DEFAULT '{}',
  driver_notes        TEXT,
  dispute_reason      TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_bookings_load     ON bookings(load_id);
CREATE INDEX idx_bookings_driver   ON bookings(driver_id);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_status   ON bookings(status);

-- ── Tracking ──────────────────────────────────────────────────────────
CREATE TABLE tracking_updates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  speed_kmh   NUMERIC(5,2),
  heading     INTEGER,
  status_note TEXT,
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tracking_booking   ON tracking_updates(booking_id);
CREATE INDEX idx_tracking_timestamp ON tracking_updates(timestamp DESC);

-- ── Escrow ────────────────────────────────────────────────────────────
CREATE TABLE escrow (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id                UUID UNIQUE NOT NULL REFERENCES bookings(id),
  amount                    NUMERIC(12,2) NOT NULL,
  platform_fee              NUMERIC(12,2) NOT NULL,
  driver_payout             NUMERIC(12,2) NOT NULL,
  currency                  TEXT NOT NULL DEFAULT 'BWP',
  status                    escrow_status NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id  TEXT,
  stripe_transfer_id        TEXT,
  held_at                   TIMESTAMPTZ,
  released_at               TIMESTAMPTZ,
  dispute_reason            TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Wallet ────────────────────────────────────────────────────────────
CREATE TABLE wallets (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID UNIQUE NOT NULL REFERENCES profiles(user_id),
  balance           NUMERIC(14,2) NOT NULL DEFAULT 0,
  currency          TEXT NOT NULL DEFAULT 'BWP',
  stripe_account_id TEXT,
  is_active         BOOLEAN DEFAULT TRUE,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── Road Reports ──────────────────────────────────────────────────────
CREATE TABLE road_reports (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id           UUID REFERENCES profiles(user_id),
  type                  road_report_type NOT NULL,
  lat                   DOUBLE PRECISION NOT NULL,
  lng                   DOUBLE PRECISION NOT NULL,
  location_description  TEXT,
  notes                 TEXT,
  photo_url             TEXT,
  severity              INTEGER NOT NULL DEFAULT 3 CHECK (severity BETWEEN 1 AND 5),
  is_anonymous          BOOLEAN DEFAULT FALSE,
  is_active             BOOLEAN DEFAULT TRUE,
  expires_at            TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '8 hours'),
  verification_count    INTEGER DEFAULT 0,
  upvotes               INTEGER DEFAULT 0,
  downvotes             INTEGER DEFAULT 0,
  company_visible       BOOLEAN DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_road_reports_type   ON road_reports(type);
CREATE INDEX idx_road_reports_active ON road_reports(is_active, expires_at);
CREATE INDEX idx_road_reports_coords ON road_reports(lat, lng);

-- ── Messages ──────────────────────────────────────────────────────────
CREATE TABLE conversations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id  UUID REFERENCES bookings(id),
  load_id     UUID REFERENCES loads(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES profiles(user_id),
  PRIMARY KEY (conversation_id, user_id)
);
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES profiles(user_id),
  content         TEXT NOT NULL,
  type            message_type NOT NULL DEFAULT 'text',
  file_url        TEXT,
  location_lat    DOUBLE PRECISION,
  location_lng    DOUBLE PRECISION,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_messages_conv ON messages(conversation_id, created_at DESC);

-- ── Notifications ─────────────────────────────────────────────────────
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'system',
  data        JSONB DEFAULT '{}',
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ── Reviews ───────────────────────────────────────────────────────────
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id  UUID NOT NULL REFERENCES bookings(id),
  reviewer_id UUID NOT NULL REFERENCES profiles(user_id),
  reviewee_id UUID NOT NULL REFERENCES profiles(user_id),
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(booking_id, reviewer_id)
);

-- ── Audit Logs ────────────────────────────────────────────────────────
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES profiles(user_id),
  action      TEXT NOT NULL,
  table_name  TEXT,
  record_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_user    ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ── Subscriptions ─────────────────────────────────────────────────────
CREATE TABLE subscriptions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID UNIQUE NOT NULL REFERENCES profiles(user_id),
  plan                  TEXT NOT NULL DEFAULT 'free',
  stripe_subscription_id TEXT,
  status                TEXT NOT NULL DEFAULT 'active',
  current_period_end    TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ══════════════════════════════════════════════════════════════════════

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated  BEFORE UPDATE ON profiles  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_loads_updated     BEFORE UPDATE ON loads     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_bookings_updated  BEFORE UPDATE ON bookings  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO wallets (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update driver rating on new review
CREATE OR REPLACE FUNCTION update_rating_on_review()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET rating = (SELECT AVG(rating) FROM reviews WHERE reviewee_id = NEW.reviewee_id),
      total_trips = (SELECT COUNT(*) FROM reviews WHERE reviewee_id = NEW.reviewee_id)
  WHERE user_id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_rating AFTER INSERT ON reviews FOR EACH ROW EXECUTE FUNCTION update_rating_on_review();

-- Auto-expire road reports
CREATE OR REPLACE FUNCTION expire_road_reports()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE road_reports SET is_active = FALSE WHERE expires_at < NOW() AND is_active = TRUE;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE loads               ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids                ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_updates    ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow              ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets             ENABLE ROW LEVEL SECURITY;
ALTER TABLE road_reports        ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews             ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_documents    ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles            ENABLE ROW LEVEL SECURITY;

-- Profiles: users see their own; admins see all
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public can read basic profiles" ON profiles FOR SELECT USING (TRUE);

-- Loads: public can read posted; owners manage theirs
CREATE POLICY "Public read posted loads" ON loads FOR SELECT USING (status = 'posted' OR poster_id = auth.uid());
CREATE POLICY "Owners manage loads" ON loads FOR ALL USING (poster_id = auth.uid());
CREATE POLICY "Authenticated insert loads" ON loads FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Bids: drivers see their bids; load owners see bids on their loads
CREATE POLICY "Drivers manage own bids" ON bids FOR ALL USING (driver_id = auth.uid());
CREATE POLICY "Load owners see bids" ON bids FOR SELECT USING (
  load_id IN (SELECT id FROM loads WHERE poster_id = auth.uid())
);

-- Bookings: parties see their bookings
CREATE POLICY "Parties see bookings" ON bookings FOR SELECT USING (
  driver_id = auth.uid() OR customer_id = auth.uid()
);
CREATE POLICY "Parties update bookings" ON bookings FOR UPDATE USING (
  driver_id = auth.uid() OR customer_id = auth.uid()
);

-- Tracking: booking parties see tracking
CREATE POLICY "Parties see tracking" ON tracking_updates FOR SELECT USING (
  booking_id IN (SELECT id FROM bookings WHERE driver_id = auth.uid() OR customer_id = auth.uid())
);
CREATE POLICY "Driver inserts tracking" ON tracking_updates FOR INSERT WITH CHECK (
  booking_id IN (SELECT id FROM bookings WHERE driver_id = auth.uid())
);

-- Escrow: booking parties see it
CREATE POLICY "Parties see escrow" ON escrow FOR SELECT USING (
  booking_id IN (SELECT id FROM bookings WHERE driver_id = auth.uid() OR customer_id = auth.uid())
);

-- Wallet: own wallet only
CREATE POLICY "Own wallet" ON wallets FOR ALL USING (user_id = auth.uid());

-- Road reports: public read active; auth users insert
CREATE POLICY "Public read road reports" ON road_reports FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Auth users report" ON road_reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Reporters manage own" ON road_reports FOR UPDATE USING (reporter_id = auth.uid());

-- Messages: conversation participants
CREATE POLICY "Participants see messages" ON messages FOR SELECT USING (
  conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid())
);
CREATE POLICY "Participants send messages" ON messages FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid())
);

-- Notifications: own only
CREATE POLICY "Own notifications" ON notifications FOR ALL USING (user_id = auth.uid());

-- Reviews: own reviews
CREATE POLICY "Own reviews" ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "Insert own review" ON reviews FOR INSERT WITH CHECK (reviewer_id = auth.uid());

-- Documents: own documents; admins all
CREATE POLICY "Own documents" ON driver_documents FOR ALL USING (driver_id = auth.uid());

-- Vehicles: public read; owners manage
CREATE POLICY "Public read vehicles" ON vehicles FOR SELECT USING (TRUE);
CREATE POLICY "Owners manage vehicles" ON vehicles FOR ALL USING (owner_id = auth.uid());

-- ══════════════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars',   'avatars',   TRUE),
  ('documents', 'documents', FALSE),
  ('load-photos', 'load-photos', TRUE),
  ('delivery-proof', 'delivery-proof', FALSE);

-- Public read for avatars and load photos
CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Auth upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
CREATE POLICY "Public read load photos" ON storage.objects FOR SELECT USING (bucket_id = 'load-photos');
CREATE POLICY "Auth upload load photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'load-photos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Own documents" ON storage.objects FOR ALL USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ══════════════════════════════════════════════════════════════════════
-- SEED DATA
-- ══════════════════════════════════════════════════════════════════════

-- Botswana cities for auto-complete (reference data)
CREATE TABLE IF NOT EXISTS bw_locations (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL,
  lat   DOUBLE PRECISION NOT NULL,
  lng   DOUBLE PRECISION NOT NULL
);

INSERT INTO bw_locations (name, lat, lng) VALUES
  ('Gaborone',     -24.6282, 25.9231),
  ('Francistown',  -21.1667, 27.5167),
  ('Maun',         -19.9833, 23.4167),
  ('Kasane',       -17.8000, 25.1500),
  ('Jwaneng',      -24.6020, 24.7310),
  ('Lobatse',      -25.2200, 25.6800),
  ('Selebi-Phikwe',-22.0000, 27.8333),
  ('Serowe',       -22.3833, 26.7167),
  ('Mahalapye',    -23.1000, 26.8167),
  ('Palapye',      -22.5500, 27.1333),
  ('Kanye',        -24.9697, 25.3444),
  ('Molepolole',   -24.4068, 25.4949);
