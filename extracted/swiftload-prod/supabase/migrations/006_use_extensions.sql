-- ─────────────────────────────────────────────────────────────────────────────
-- PRONTO SWIFTLOAD — Migration 006: Use Activated Extensions
-- Applied: 2025 | Supabase Project: pyiduregtpbynsjrnhua
-- ─────────────────────────────────────────────────────────────────────────────

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. POSTGIS — Spatial columns + triggers + geo-query functions
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE loads
  ADD COLUMN IF NOT EXISTS pickup_point  extensions.geometry(Point, 4326),
  ADD COLUMN IF NOT EXISTS dropoff_point extensions.geometry(Point, 4326);
ALTER TABLE road_reports     ADD COLUMN IF NOT EXISTS location extensions.geometry(Point, 4326);
ALTER TABLE tracking_updates ADD COLUMN IF NOT EXISTS point   extensions.geometry(Point, 4326);

CREATE INDEX IF NOT EXISTS idx_loads_pickup_geo  ON loads          USING GIST (pickup_point);
CREATE INDEX IF NOT EXISTS idx_loads_dropoff_geo ON loads          USING GIST (dropoff_point);
CREATE INDEX IF NOT EXISTS idx_road_reports_geo  ON road_reports   USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_tracking_geo      ON tracking_updates USING GIST (point);

CREATE OR REPLACE FUNCTION auto_set_load_geometry() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.pickup_lat  IS NOT NULL AND NEW.pickup_lng  IS NOT NULL THEN NEW.pickup_point  := extensions.ST_SetSRID(extensions.ST_MakePoint(NEW.pickup_lng::float8,  NEW.pickup_lat::float8),  4326); END IF;
  IF NEW.dropoff_lat IS NOT NULL AND NEW.dropoff_lng IS NOT NULL THEN NEW.dropoff_point := extensions.ST_SetSRID(extensions.ST_MakePoint(NEW.dropoff_lng::float8, NEW.dropoff_lat::float8), 4326); END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_loads_geometry ON loads;
CREATE TRIGGER trg_loads_geometry BEFORE INSERT OR UPDATE ON loads FOR EACH ROW EXECUTE FUNCTION auto_set_load_geometry();

CREATE OR REPLACE FUNCTION auto_set_report_geometry() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.location := extensions.ST_SetSRID(extensions.ST_MakePoint(NEW.lng::float8, NEW.lat::float8), 4326); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS trg_road_reports_geometry ON road_reports;
CREATE TRIGGER trg_road_reports_geometry BEFORE INSERT OR UPDATE ON road_reports FOR EACH ROW EXECUTE FUNCTION auto_set_report_geometry();

CREATE OR REPLACE FUNCTION auto_set_tracking_geometry() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.point := extensions.ST_SetSRID(extensions.ST_MakePoint(NEW.lng::float8, NEW.lat::float8), 4326); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS trg_tracking_geometry ON tracking_updates;
CREATE TRIGGER trg_tracking_geometry BEFORE INSERT OR UPDATE ON tracking_updates FOR EACH ROW EXECUTE FUNCTION auto_set_tracking_geometry();

-- Geo-query helpers
CREATE OR REPLACE FUNCTION loads_near(center_lat DOUBLE PRECISION, center_lng DOUBLE PRECISION, radius_km DOUBLE PRECISION DEFAULT 50)
RETURNS SETOF loads LANGUAGE sql STABLE AS $$
  SELECT * FROM loads WHERE status IN ('published','bidding') AND pickup_point IS NOT NULL
    AND extensions.ST_DWithin(pickup_point::extensions.geography, extensions.ST_SetSRID(extensions.ST_MakePoint(center_lng,center_lat),4326)::extensions.geography, radius_km*1000)
  ORDER BY extensions.ST_Distance(pickup_point::extensions.geography, extensions.ST_SetSRID(extensions.ST_MakePoint(center_lng,center_lat),4326)::extensions.geography);
$$;

CREATE OR REPLACE FUNCTION reports_near(center_lat DOUBLE PRECISION, center_lng DOUBLE PRECISION, radius_km DOUBLE PRECISION DEFAULT 30)
RETURNS SETOF road_reports LANGUAGE sql STABLE AS $$
  SELECT * FROM road_reports WHERE active=TRUE AND location IS NOT NULL
    AND extensions.ST_DWithin(location::extensions.geography, extensions.ST_SetSRID(extensions.ST_MakePoint(center_lng,center_lat),4326)::extensions.geography, radius_km*1000)
  ORDER BY extensions.ST_Distance(location::extensions.geography, extensions.ST_SetSRID(extensions.ST_MakePoint(center_lng,center_lat),4326)::extensions.geography);
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. PGVECTOR — AI embedding tables + HNSW indexes + match functions
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS load_embeddings (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  load_id UUID NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
  embedding extensions.vector(1536),
  model TEXT DEFAULT 'text-embedding-3-small',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(load_id)
);
CREATE TABLE IF NOT EXISTS profile_embeddings (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  embedding extensions.vector(1536),
  model TEXT DEFAULT 'text-embedding-3-small',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id)
);
CREATE INDEX IF NOT EXISTS idx_load_embeddings_hnsw    ON load_embeddings    USING hnsw (embedding extensions.vector_cosine_ops) WITH (m=16, ef_construction=64);
CREATE INDEX IF NOT EXISTS idx_profile_embeddings_hnsw ON profile_embeddings USING hnsw (embedding extensions.vector_cosine_ops) WITH (m=16, ef_construction=64);

CREATE OR REPLACE FUNCTION match_loads(query_embedding extensions.vector(1536), match_count INT DEFAULT 10, min_similarity FLOAT DEFAULT 0.7)
RETURNS TABLE (load_id UUID, similarity FLOAT) LANGUAGE sql STABLE AS $$
  SELECT le.load_id, 1-(le.embedding <=> query_embedding) AS similarity
  FROM load_embeddings le JOIN loads l ON l.id=le.load_id
  WHERE l.status IN('published','bidding') AND 1-(le.embedding <=> query_embedding)>min_similarity
  ORDER BY le.embedding <=> query_embedding LIMIT match_count;
$$;

CREATE OR REPLACE FUNCTION match_drivers(query_embedding extensions.vector(1536), match_count INT DEFAULT 5, min_similarity FLOAT DEFAULT 0.6)
RETURNS TABLE (profile_id UUID, similarity FLOAT) LANGUAGE sql STABLE AS $$
  SELECT pe.profile_id, 1-(pe.embedding <=> query_embedding) AS similarity
  FROM profile_embeddings pe JOIN profiles p ON p.id=pe.profile_id
  WHERE p.role='driver' AND 1-(pe.embedding <=> query_embedding)>min_similarity
  ORDER BY pe.embedding <=> query_embedding LIMIT match_count;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. PG_CRON — 5 scheduled maintenance jobs
-- ══════════════════════════════════════════════════════════════════════════════

SELECT cron.schedule('expire-road-reports', '*/30 * * * *', 'UPDATE road_reports SET active=FALSE WHERE active=TRUE AND expires_at<NOW()');
SELECT cron.schedule('cleanup-ai-logs',     '0 2 * * *',    'DELETE FROM ai_logs WHERE created_at<NOW()-INTERVAL ''90 days''');
SELECT cron.schedule('expire-stale-loads',  '0 3 * * *',    'UPDATE loads SET status=''cancelled'' WHERE status=''published'' AND pickup_date<CURRENT_DATE-INTERVAL ''7 days''');
SELECT cron.schedule('update-trust-scores', '0 * * * *',    'UPDATE profiles SET trust_score=ROUND(CAST((COALESCE(rating,0)*20+LEAST(COALESCE(rating_count,0),100)*0.5+CASE WHEN verified=TRUE THEN 20 ELSE 0 END) AS NUMERIC),1) WHERE role=''driver'' AND active=TRUE');
SELECT cron.schedule('weekly-vacuum',       '0 1 * * 0',    'VACUUM ANALYSE loads');

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. PG_TRGM — Trigram indexes for fast full-text search
-- ══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_loads_title_trgm   ON loads    USING gin (title        extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_loads_cargo_trgm   ON loads    USING gin (cargo_type   extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_name_trgm ON profiles USING gin (full_name    extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_loads_pcity_trgm   ON loads    USING gin (pickup_city  extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_loads_dcity_trgm   ON loads    USING gin (dropoff_city extensions.gin_trgm_ops);

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. PGCRYPTO — Secure token generators
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION generate_otp()
RETURNS TEXT LANGUAGE sql AS $$
  SELECT LPAD((floor(random()*900000)+100000)::int::text, 6, '0');
$$;

CREATE OR REPLACE FUNCTION generate_tracking_code()
RETURNS TEXT LANGUAGE sql AS $$
  SELECT 'SL' || UPPER(pg_catalog.encode(extensions.gen_random_bytes(4), 'hex'));
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. FUZZYSTRMATCH — Duplicate profile detection
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION find_duplicate_profiles(p_full_name TEXT, p_phone TEXT DEFAULT NULL)
RETURNS TABLE (id UUID, full_name TEXT, email TEXT, phone TEXT, sim REAL) LANGUAGE sql STABLE AS $$
  SELECT p.id, p.full_name, p.email, p.phone, extensions.similarity(p.full_name, p_full_name) AS sim
  FROM profiles p
  WHERE extensions.similarity(p.full_name, p_full_name)>0.5 OR (p_phone IS NOT NULL AND p.phone=p_phone)
  ORDER BY sim DESC LIMIT 10;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 7. BTREE_GIN — Composite GIN index for multi-column load filtering
-- ══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_loads_gin_composite
  ON loads USING gin (pickup_city, dropoff_city, vehicle_type) WITH (fastupdate=on);

-- ══════════════════════════════════════════════════════════════════════════════
-- 8. TABLEFUNC — Analytics reporting view
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW weekly_load_stats AS
SELECT DATE_TRUNC('week',created_at) AS week, pickup_city, dropoff_city,
  COUNT(*) AS load_count,
  COUNT(*) FILTER (WHERE status='delivered') AS delivered_count,
  ROUND(AVG(weight_tons::NUMERIC),1) AS avg_weight_tons,
  ROUND(AVG(budget_max::NUMERIC),0)  AS avg_budget_bwp
FROM loads WHERE created_at>NOW()-INTERVAL '90 days'
GROUP BY 1,2,3 ORDER BY 1 DESC,4 DESC;

-- ══════════════════════════════════════════════════════════════════════════════
-- 9. EARTHDISTANCE — Fast approx distance helper (complements PostGIS)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION approx_distance_km(lat1 FLOAT, lng1 FLOAT, lat2 FLOAT, lng2 FLOAT)
RETURNS FLOAT LANGUAGE sql IMMUTABLE AS $$
  SELECT (extensions.earth_distance(extensions.ll_to_earth(lat1,lng1), extensions.ll_to_earth(lat2,lng2))/1000.0)::FLOAT;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 10. RLS + REALTIME for new tables
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE load_embeddings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "le_public_read" ON load_embeddings    FOR SELECT USING (TRUE);
CREATE POLICY "le_admin_write" ON load_embeddings    FOR ALL    USING (EXISTS(SELECT 1 FROM profiles WHERE (user_id=auth.uid() OR id=auth.uid()) AND role IN('admin','super_admin')));
CREATE POLICY "pe_own_read"    ON profile_embeddings FOR SELECT USING (profile_id IN(SELECT id FROM profiles WHERE user_id=auth.uid() OR id=auth.uid()) OR EXISTS(SELECT 1 FROM profiles WHERE (user_id=auth.uid() OR id=auth.uid()) AND role IN('admin','super_admin')));
CREATE POLICY "pe_admin_write" ON profile_embeddings FOR ALL    USING (EXISTS(SELECT 1 FROM profiles WHERE (user_id=auth.uid() OR id=auth.uid()) AND role IN('admin','super_admin')));

ALTER PUBLICATION supabase_realtime ADD TABLE load_embeddings;
