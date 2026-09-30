-- Remove all demo / sample operational data from EstatePM.
-- Keeps: User accounts (login), portfolio overview tables (executive spreadsheet).
-- Run in pgAdmin on database "estatepm", or: npm run db:clean

BEGIN;

DELETE FROM "Task";
DELETE FROM "Document";
DELETE FROM "AuditLog";
DELETE FROM "Project";
DELETE FROM "Property";

COMMIT;

-- Optional: also clear executive portfolio (uncomment if you want a full empty slate)
-- TRUNCATE "portfolio_phase", "portfolio_site", "portfolio_overview_totals";
