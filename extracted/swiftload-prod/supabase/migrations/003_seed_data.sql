-- ─────────────────────────────────────────────────────────────────────────────
-- PRONTO SWIFTLOAD — Seed Data (Demo / Development Only)
-- DO NOT run in production with real user data
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Demo Profiles ────────────────────────────────────────────────────────────
-- Note: These use placeholder auth UUIDs. In real use, users register via the app.
-- Replace <customer_uuid>, <driver1_uuid> etc. with real Supabase auth.users UUIDs.

-- Demo Customer
INSERT INTO profiles (user_id, role, full_name, email, phone, city, country, verified, active, rating, rating_count)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'customer',    'Thabo Molefe',     'thabo@demo.swiftload.co.bw',  '+26771000001', 'Gaborone',    'BW', true, true, 4.8, 12),
  ('00000000-0000-0000-0000-000000000002', 'driver',      'Kabo Sithole',     'kabo@demo.swiftload.co.bw',   '+26771000002', 'Francistown', 'BW', true, true, 4.9, 34),
  ('00000000-0000-0000-0000-000000000003', 'driver',      'Neo Kgosi',        'neo@demo.swiftload.co.bw',    '+26771000003', 'Gaborone',    'BW', true, true, 4.7, 28),
  ('00000000-0000-0000-0000-000000000004', 'business',    'Naledi Traders',   'naledi@demo.swiftload.co.bw', '+26771000004', 'Gaborone',    'BW', true, true, 4.6, 8),
  ('00000000-0000-0000-0000-000000000005', 'fleet_owner', 'Mpho Transport',   'mpho@demo.swiftload.co.bw',   '+26771000005', 'Palapye',     'BW', true, true, 4.5, 5)
ON CONFLICT (user_id) DO NOTHING;

-- ── Demo Vehicles ─────────────────────────────────────────────────────────────
INSERT INTO vehicles (owner_id, registration, make, model, year, type, capacity_tons, body_type, fuel_type, status, insurance_expiry, licence_expiry)
SELECT
  p.id,
  'BW-' || left(p.id::text, 4) || '-001',
  'Isuzu', 'NQR 500', 2021,
  '8 Ton Truck', 8.0, 'Curtainsider', 'diesel', 'available',
  (NOW() + INTERVAL '8 months')::date,
  (NOW() + INTERVAL '14 months')::date
FROM profiles p WHERE p.email IN ('kabo@demo.swiftload.co.bw', 'neo@demo.swiftload.co.bw')
ON CONFLICT DO NOTHING;

-- ── Demo Loads ────────────────────────────────────────────────────────────────
INSERT INTO loads (
  poster_id, title, description, category, cargo_type,
  weight_tons, pickup_address, pickup_city, dropoff_address, dropoff_city,
  vehicle_type, budget_min, budget_max, pickup_date, status,
  estimated_price, platform_fee, vat, distance_km, bid_count
)
SELECT
  p.id,
  title, description, category, cargo_type,
  weight_tons, pickup_address, pickup_city, dropoff_address, dropoff_city,
  vehicle_type, budget_min, budget_max, pickup_date::date, 'posted',
  estimated_price, ROUND(estimated_price * 0.05), ROUND((estimated_price * 1.05) * 0.14),
  distance_km, 0
FROM profiles p, (VALUES
  ('thabo@demo.swiftload.co.bw',
   'Building materials — Gaborone to Francistown',
   'Cement bags, steel rods, roofing sheets. Careful handling required.',
   'construction', 'Building Materials',
   12.0, '45 Industrial Rd, Gaborone West', 'Gaborone',
   '12 Commerce Park, Francistown', 'Francistown',
   '14 Ton Truck', 4200, 6500, (NOW() + INTERVAL '2 days')::text,
   5500, 436),
  ('thabo@demo.swiftload.co.bw',
   'Agricultural produce — Maun to Gaborone',
   'Watermelons, 200 boxes. Refrigeration not required but shade important.',
   'agriculture', 'Agricultural Produce',
   8.0, 'Maun Agricultural Area', 'Maun',
   'Gaborone Fresh Produce Market', 'Gaborone',
   '8 Ton Truck', 6000, 8500, (NOW() + INTERVAL '1 day')::text,
   7200, 697),
  ('naledi@demo.swiftload.co.bw',
   'Retail goods — Gaborone to Palapye x3',
   'General merchandise, palleted, 3 pallets. Standard delivery.',
   'retail', 'Retail Goods',
   3.5, 'Masa Centre Warehouse, Gaborone', 'Gaborone',
   'Palapye Mall Loading Bay', 'Palapye',
   '4 Ton Truck', 1800, 2800, (NOW() + INTERVAL '3 days')::text,
   2400, 225),
  ('thabo@demo.swiftload.co.bw',
   'Mining equipment — Gaborone to Jwaneng',
   'Drill bits and safety equipment. Fragile — handle with care.',
   'mining', 'Mining Equipment',
   6.5, 'Industrial Site A, Gaborone', 'Gaborone',
   'Jwaneng Mine Gate 3', 'Jwaneng',
   '8 Ton Truck', 1200, 2000, (NOW() + INTERVAL '4 days')::text,
   1600, 95),
  ('naledi@demo.swiftload.co.bw',
   'Furniture removal — Gaborone to Maun',
   'Household furniture. 3 bedroom house. Needs 2 crew for loading.',
   'general', 'General Freight',
   5.0, '22 Broadhurst, Gaborone', 'Gaborone',
   '8 Sedia Street, Maun', 'Maun',
   '8 Ton Truck', 5500, 7800, (NOW() + INTERVAL '5 days')::text,
   6300, 697),
  ('thabo@demo.swiftload.co.bw',
   'Livestock transport — Lobatse to Maun',
   '12 cattle. Livestock trailer required. Water stops at Letlhakane.',
   'agriculture', 'Livestock',
   7.0, 'Lobatse Cattle Post', 'Lobatse',
   'Maun Cattle Post', 'Maun',
   '14 Ton Truck', 7000, 9500, (NOW() + INTERVAL '2 days')::text,
   8200, 745),
  ('naledi@demo.swiftload.co.bw',
   'Electronics — Gaborone to Kasane',
   'Flat-screen TVs and appliances. 40 cartons. Very fragile.',
   'retail', 'Electronics',
   2.0, 'Broadhurst Mall Warehouse', 'Gaborone',
   'Kasane Electronics Store', 'Kasane',
   '4 Ton Truck', 8000, 11000, (NOW() + INTERVAL '6 days')::text,
   9500, 934),
  ('thabo@demo.swiftload.co.bw',
   'Construction sand — Serowe to Gaborone',
   'River sand, 10 tons. Standard tipper load.',
   'construction', 'Bulk Cargo',
   10.0, 'Serowe Sand Quarry', 'Serowe',
   'Gaborone Building Site', 'Gaborone',
   'Tipper Truck', 2000, 3200, (NOW() + INTERVAL '1 day')::text,
   2600, 285),
  ('naledi@demo.swiftload.co.bw',
   'Refrigerated goods — Gaborone to Francistown',
   'Frozen chicken, needs refrigerated truck. 5 tons.',
   'retail', 'Refrigerated Goods',
   5.0, 'RCL Foods Gaborone', 'Gaborone',
   'Choppies Francistown DC', 'Francistown',
   'Refrigerated', 5500, 7500, (NOW() + INTERVAL '1 day')::text,
   6400, 436),
  ('thabo@demo.swiftload.co.bw',
   'Timber load — Gaborone to Orapa',
   'Timber planks, 8 tons. 6m lengths. Flatbed required.',
   'construction', 'Building Materials',
   8.0, 'Gaborone Timber Yard', 'Gaborone',
   'Orapa Construction Site', 'Orapa',
   'Flatbed', 4500, 6000, (NOW() + INTERVAL '3 days')::text,
   5200, 580)
) AS data(email, title, description, category, cargo_type, weight_tons, pickup_address, pickup_city, dropoff_address, dropoff_city, vehicle_type, budget_min, budget_max, pickup_date, estimated_price, distance_km)
WHERE p.email = data.email
ON CONFLICT DO NOTHING;

-- ── Demo Road Report ──────────────────────────────────────────────────────────
INSERT INTO road_reports (reporter_id, type, title, description, lat, lng, route, severity, anonymous, expires_at, active, verified_count, dismissed_count, company_visible)
SELECT
  p.id,
  'traffic', 'Heavy traffic near Phakalane turnoff',
  'Long queue building up. Allow extra 30 minutes.',
  -24.5281, 25.9133, 'A1 Gaborone–Francistown',
  2, false,
  NOW() + INTERVAL '3 hours',
  true, 3, 0, true
FROM profiles p WHERE p.email = 'kabo@demo.swiftload.co.bw'
ON CONFLICT DO NOTHING;

SELECT 'Seed data applied successfully' AS result;
