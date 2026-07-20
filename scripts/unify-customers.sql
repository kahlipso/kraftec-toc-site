-- One-time customer unification migration for Neon.
-- Run this AFTER deploying the code that uses the unified customers table.
-- It moves login details from customer_accounts into customers, repoints
-- sessions, verifies the migration, then removes customer_accounts.

DO $$
DECLARE
  session_fk TEXT;
BEGIN
  ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT;
  ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash TEXT;
  ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_salt TEXT;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customers_email_key') THEN
    ALTER TABLE customers ADD CONSTRAINT customers_email_key UNIQUE (email);
  END IF;

  -- A signed-up customer who has never booked gets a normal customers row.
  INSERT INTO customers (id, phone, name, email, password_hash, password_salt, created_at)
  SELECT id, phone, name, email, password_hash, password_salt, created_at
  FROM customer_accounts
  ON CONFLICT (phone) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    password_salt = EXCLUDED.password_salt;

  -- Sessions used to reference customer_accounts. Remove that old foreign key,
  -- then point every saved session at the matching customer record.
  SELECT conname INTO session_fk
  FROM pg_constraint
  WHERE conrelid = 'customer_sessions'::regclass AND contype = 'f'
  LIMIT 1;
  IF session_fk IS NOT NULL THEN
    EXECUTE format('ALTER TABLE customer_sessions DROP CONSTRAINT %I', session_fk);
  END IF;

  UPDATE customer_sessions s
  SET account_id = c.id
  FROM customer_accounts a
  JOIN customers c ON c.phone = a.phone
  WHERE s.account_id = a.id;

  -- Any session that cannot be mapped is invalidated rather than left orphaned.
  DELETE FROM customer_sessions WHERE account_id NOT IN (SELECT id FROM customers);

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customer_sessions_customer_id_fkey') THEN
    ALTER TABLE customer_sessions
      ADD CONSTRAINT customer_sessions_customer_id_fkey
      FOREIGN KEY (account_id) REFERENCES customers(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM customer_accounts a
    LEFT JOIN customers c ON c.phone = a.phone
    WHERE c.password_hash IS DISTINCT FROM a.password_hash
       OR c.password_salt IS DISTINCT FROM a.password_salt
       OR c.email IS DISTINCT FROM a.email
  ) THEN
    RAISE EXCEPTION 'Customer-account migration verification failed; customer_accounts was retained.';
  END IF;

  DROP TABLE customer_accounts;
END $$;
