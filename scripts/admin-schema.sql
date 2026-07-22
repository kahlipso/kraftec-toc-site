-- Kraftec founder admin console migration. Run this entire file once in the
-- Neon SQL Editor. It is one PostgreSQL DO statement because Neon’s editor
-- executes prepared statements one at a time.

DO $$
BEGIN
  ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'confirmed', 'in_progress', 'completed', 'cancelled'));
  ALTER TABLE bookings ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
  ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

  ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS booking_id TEXT UNIQUE;
  ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE;
  ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
  ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

  ALTER TABLE pros ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
  ALTER TABLE pros ADD COLUMN IF NOT EXISTS service_radius_miles DOUBLE PRECISION NOT NULL DEFAULT 15;
  ALTER TABLE pros ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'idle'
    CHECK (status IN ('idle', 'working', 'finishing'));

  CREATE TABLE IF NOT EXISTS quote_benchmarks (
    trade_slug TEXT PRIMARY KEY,
    config JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Demo coverage radius + status per seeded pro, so the map shows all 3 states.
  UPDATE pros SET service_radius_miles = 12, status = 'working' WHERE id = 'martinez-reyes';
  UPDATE pros SET service_radius_miles = 20, status = 'finishing' WHERE id = 'desert-cool';
  UPDATE pros SET service_radius_miles = 15, status = 'idle' WHERE id = 'valley-air';
  UPDATE pros SET service_radius_miles = 18, status = 'idle' WHERE id = 'sunwest';

END $$;
/