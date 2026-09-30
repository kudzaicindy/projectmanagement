-- Run in pgAdmin: PostgreSQL 18 → database "postgres" → Query Tool (as user postgres)
-- Fixes P1000 when DATABASE_URL uses estatepm / estatepm on 127.0.0.1:5432

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'estatepm') THEN
    CREATE ROLE estatepm WITH LOGIN PASSWORD 'estatepm' CREATEDB;
  ELSE
    ALTER ROLE estatepm WITH LOGIN PASSWORD 'estatepm';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'estatepm') THEN
    CREATE DATABASE estatepm OWNER estatepm;
  ELSE
    ALTER DATABASE estatepm OWNER TO estatepm;
  END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE estatepm TO estatepm;

-- Connect to database "estatepm" in a second query (or select estatepm in pgAdmin) and run:
-- GRANT ALL ON SCHEMA public TO estatepm;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO estatepm;
