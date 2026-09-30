-- One-time local Postgres setup (run as superuser via npm run db:local)
DO $$
BEGIN
  CREATE ROLE estatepm WITH LOGIN PASSWORD 'estatepm' CREATEDB;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE DATABASE estatepm OWNER estatepm;
EXCEPTION
  WHEN duplicate_database THEN NULL;
END
$$;
