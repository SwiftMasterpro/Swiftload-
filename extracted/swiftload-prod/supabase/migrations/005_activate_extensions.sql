-- ─────────────────────────────────────────────────────────────────────────────
-- PRONTO SWIFTLOAD — Migration 005: Activate All Extensions
-- Applied: 2025 | Supabase Project: pyiduregtpbynsjrnhua
-- ─────────────────────────────────────────────────────────────────────────────

-- ⭐⭐⭐⭐⭐ PostGIS — Maps, GPS, distance calculations, geofencing
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- ⭐⭐⭐⭐⭐ pg_cron — Scheduled jobs and maintenance
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ⭐⭐⭐⭐⭐ pgvector — AI-powered search and recommendations
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- ⭐⭐⭐⭐⭐ pg_stat_statements — Performance monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;

-- ⭐⭐⭐⭐⭐ pgcrypto — Encryption and secure tokens
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ⭐⭐⭐⭐⭐ uuid-ossp — Unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- ⭐⭐⭐⭐⭐ pg_trgm — Fast fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- ⭐⭐⭐⭐ pg_net — Async HTTP integrations from PostgreSQL
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ⭐⭐⭐⭐ tablefunc — Reporting and analytics (crosstab pivot tables)
CREATE EXTENSION IF NOT EXISTS tablefunc WITH SCHEMA extensions;

-- ⭐⭐⭐⭐ HypoPG — Hypothetical index testing without building real indexes
CREATE EXTENSION IF NOT EXISTS hypopg WITH SCHEMA extensions;

-- ⭐⭐⭐⭐ index_advisor — Automatic index recommendations
CREATE EXTENSION IF NOT EXISTS index_advisor;

-- ⭐⭐⭐⭐ unaccent — Better search for African names (strips accents)
CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA extensions;

-- ⭐⭐⭐⭐ fuzzystrmatch — Soundex/Levenshtein for duplicate detection
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA extensions;

-- ⭐⭐⭐⭐ btree_gin — GIN indexes for equality/range on common types
CREATE EXTENSION IF NOT EXISTS btree_gin WITH SCHEMA extensions;

-- ⭐⭐⭐⭐ btree_gist — GiST indexes for range types and exclusion constraints
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;

-- earthdistance + cube — Great-circle distance (pairs with PostGIS)
CREATE EXTENSION IF NOT EXISTS cube WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS earthdistance WITH SCHEMA extensions;
