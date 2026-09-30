-- =============================================================================
-- Alamait Portfolio Overview (executive spreadsheet → PostgreSQL)
-- Database: estatepm · Run in pgAdmin Query Tool or: npm run db:portfolio
--
-- Column mapping (spreadsheet → DB):
--   Project Name          → portfolio_site.name / portfolio_phase.name
--   % Complete            → percentComplete
--   Status                → status (COMPLETED | ONGOING | NOT_STARTED)
--   Total Budget (CapEx)    → budgetCapex
--   Actual Spend (TD)     → actualSpend
--   Est. to Complete      → estToComplete
--   Forecast Total        → forecastTotal
--   Variance              → variance  (negative = over budget, like ($6,715))
--   Cash Flow Need (30d)  → cashFlowNeed30d
--   Notes                 → notes
--
-- Also syncs EstatePM Property + Project rows (type DEVELOPMENT) for the app.
-- Query like the sheet: SELECT * FROM v_alamait_portfolio_overview;
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE "PortfolioRowStatus" AS ENUM ('COMPLETED', 'ONGOING', 'NOT_STARTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "portfolio_site" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "percentComplete" INTEGER,
    "status" "PortfolioRowStatus",
    "budgetCapex" DECIMAL(14,2),
    "actualSpend" DECIMAL(14,2),
    "estToComplete" DECIMAL(14,2),
    "forecastTotal" DECIMAL(14,2),
    "variance" DECIMAL(14,2),
    "cashFlowNeed30d" DECIMAL(14,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "portfolio_phase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL REFERENCES "portfolio_site"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "percentComplete" INTEGER,
    "status" "PortfolioRowStatus",
    "budgetCapex" DECIMAL(14,2),
    "actualSpend" DECIMAL(14,2),
    "estToComplete" DECIMAL(14,2),
    "forecastTotal" DECIMAL(14,2),
    "variance" DECIMAL(14,2),
    "cashFlowNeed30d" DECIMAL(14,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "portfolio_overview_totals" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'alamait-portfolio-totals',
    "budgetCapex" DECIMAL(14,2),
    "actualSpend" DECIMAL(14,2),
    "estToComplete" DECIMAL(14,2),
    "forecastTotal" DECIMAL(14,2),
    "variance" DECIMAL(14,2),
    "cashFlowNeed30d" DECIMAL(14,2),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "portfolio_phase_siteId_idx" ON "portfolio_phase"("siteId");

BEGIN;

DELETE FROM "Task" WHERE "projectId" LIKE 'alamait-proj-%' OR "projectId" = 'seed-project-1';
DELETE FROM "Document" WHERE "projectId" LIKE 'alamait-proj-%' OR "projectId" = 'seed-project-1';
DELETE FROM "Project" WHERE id LIKE 'alamait-proj-%' OR id = 'seed-project-1';
DELETE FROM "Property" WHERE id LIKE 'alamait-prop-%' OR id = 'seed-property-1';

-- Portfolio rows: upsert (works when tables were created in pgAdmin as postgres)

-- ---------- Sites (project names on spreadsheet) ----------
INSERT INTO "portfolio_site" (
  id, name, "sortOrder", "percentComplete", status,
  "budgetCapex", "actualSpend", "estToComplete", "forecastTotal", variance, "cashFlowNeed30d", notes, "updatedAt"
) VALUES
  ('christonbank-wall', 'Christonbank Wall', 1, 102, 'ONGOING',
   155171, 158686, 3200, 161886, -6715, 3200, 'Over budget on labour/transport', NOW()),
  ('belvedere', 'Belvedere', 2, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NOW()),
  ('newlands', 'Newlands', 3, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NOW()),
  ('avondale', 'Avondale', 4, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NOW()),
  ('st-kilda', 'St Kilda', 5, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NOW()),
  ('greendale', 'Greendale', 6, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NOW()),
  ('fife-avenue', 'Fife Avenue', 7, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NOW()),
  ('juliasdale-nyanga', 'Juliasdale Nyanga', 8, 2, 'ONGOING',
   NULL, NULL, NULL, 0, NULL, NULL, 'Awaiting approvals on locating of pegs payments', NOW()),
  ('shaw-cottage-nyanga', 'Shaw cottage Nyanga', 9, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  "sortOrder" = EXCLUDED."sortOrder",
  "percentComplete" = EXCLUDED."percentComplete",
  status = EXCLUDED.status,
  "budgetCapex" = EXCLUDED."budgetCapex",
  "actualSpend" = EXCLUDED."actualSpend",
  "estToComplete" = EXCLUDED."estToComplete",
  "forecastTotal" = EXCLUDED."forecastTotal",
  variance = EXCLUDED.variance,
  "cashFlowNeed30d" = EXCLUDED."cashFlowNeed30d",
  notes = EXCLUDED.notes,
  "updatedAt" = NOW();

-- ---------- Phases (indented rows on spreadsheet) ----------
INSERT INTO "portfolio_phase" (
  id, "siteId", name, "sortOrder", "percentComplete", status,
  "budgetCapex", "actualSpend", "estToComplete", "forecastTotal", variance, "cashFlowNeed30d", notes, "updatedAt"
) VALUES
  ('christonbank-p1', 'christonbank-wall', 'Phase 1 - Infrastructure', 1, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NOW()),
  ('christonbank-p2', 'christonbank-wall', 'Phase 2 - Housing Units', 2, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NOW()),

  ('st-kilda-p1', 'st-kilda', 'Phase 1- Permit', 1, 100, 'COMPLETED',
   5000, 5000, NULL, 5000, 0, NULL, NULL, NOW()),
  ('st-kilda-p2', 'st-kilda', 'Phase 2- Durawall designs and approvals', 2, 100, 'COMPLETED',
   700, 776, NULL, 776, -76, NULL,
   'Variance was due to changes on council rates and zesa approval fees', NOW()),
  ('st-kilda-p3', 'st-kilda', 'Phase 3- Sewer, Drainage, roads, architectural and structural designs and approvals', 3, 60, 'ONGOING',
   22589, NULL, NULL, 0, 22589, NULL, NULL, NOW()),
  ('st-kilda-p4', 'st-kilda', 'Phase 4- Construction of hostels', 4, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NOW()),

  ('greendale-p1', 'greendale', 'Phase 1', 1, 50, 'ONGOING',
   35344, NULL, 37100, 37100, -1757, NULL, NULL, NOW()),
  ('greendale-p2', 'greendale', 'Phase 2', 2, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NOW()),
  ('greendale-p3', 'greendale', 'Phase 3', 3, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NOW())
ON CONFLICT (id) DO UPDATE SET
  "siteId" = EXCLUDED."siteId",
  name = EXCLUDED.name,
  "sortOrder" = EXCLUDED."sortOrder",
  "percentComplete" = EXCLUDED."percentComplete",
  status = EXCLUDED.status,
  "budgetCapex" = EXCLUDED."budgetCapex",
  "actualSpend" = EXCLUDED."actualSpend",
  "estToComplete" = EXCLUDED."estToComplete",
  "forecastTotal" = EXCLUDED."forecastTotal",
  variance = EXCLUDED.variance,
  "cashFlowNeed30d" = EXCLUDED."cashFlowNeed30d",
  notes = EXCLUDED.notes,
  "updatedAt" = NOW();

INSERT INTO "portfolio_overview_totals" (
  id, "budgetCapex", "actualSpend", "estToComplete", "forecastTotal", variance, "cashFlowNeed30d", "updatedAt"
) VALUES (
  'alamait-portfolio-totals', 218804, 164462, 40300, 204762, 14041, 3200, NOW()
)
ON CONFLICT (id) DO UPDATE SET
  "budgetCapex" = EXCLUDED."budgetCapex",
  "actualSpend" = EXCLUDED."actualSpend",
  "estToComplete" = EXCLUDED."estToComplete",
  "forecastTotal" = EXCLUDED."forecastTotal",
  variance = EXCLUDED.variance,
  "cashFlowNeed30d" = EXCLUDED."cashFlowNeed30d",
  "updatedAt" = NOW();

-- ---------- EstatePM Property + Project (Portfolio / Projects in app) ----------
INSERT INTO "Property" (id, name, address, city, country, description, "createdAt", "updatedAt")
SELECT
  'alamait-prop-' || s.id,
  s.name,
  'Alamait development site',
  'Harare',
  'ZW',
  'From portfolio overview import',
  NOW(),
  NOW()
FROM "portfolio_site" s
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  city = EXCLUDED.city,
  country = EXCLUDED.country,
  description = EXCLUDED.description,
  "updatedAt" = NOW();

INSERT INTO "Project" (
  id, name, type, status, description, "budgetUsd",
  "propertyId", "managerId", "createdById", "createdAt", "updatedAt"
)
SELECT
  'alamait-proj-' || s.id,
  s.name,
  'DEVELOPMENT'::"ProjectType",
  CASE
    WHEN s.status = 'COMPLETED' THEN 'COMPLETED'::"ProjectStatus"
    WHEN s.status = 'ONGOING' OR s."percentComplete" IS NOT NULL THEN 'ACTIVE'::"ProjectStatus"
    ELSE 'DRAFT'::"ProjectStatus"
  END,
  COALESCE(s.notes, 'Alamait portfolio overview project'),
  NULLIF(COALESCE(s."budgetCapex", 0), 0),
  'alamait-prop-' || s.id,
  (SELECT id FROM "User" WHERE email = 'pm@alamait.com' LIMIT 1),
  (SELECT id FROM "User" WHERE email = 'pm@alamait.com' LIMIT 1),
  NOW(),
  NOW()
FROM "portfolio_site" s
WHERE EXISTS (SELECT 1 FROM "User" WHERE email = 'pm@alamait.com')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  description = EXCLUDED.description,
  "budgetUsd" = EXCLUDED."budgetUsd",
  "propertyId" = EXCLUDED."propertyId",
  "updatedAt" = NOW();

COMMIT;

-- ---------- Spreadsheet-style view (pgAdmin: SELECT * FROM v_alamait_portfolio_overview) ----------
CREATE OR REPLACE VIEW v_alamait_portfolio_overview AS
SELECT
  s."sortOrder" * 100 AS sort_key,
  s.name AS project_name,
  s."percentComplete" AS pct_complete,
  CASE s.status
    WHEN 'COMPLETED' THEN 'Completed'
    WHEN 'ONGOING' THEN 'On going'
    ELSE NULL
  END AS status_label,
  s."budgetCapex" AS budget_capex,
  s."actualSpend" AS actual_spend,
  s."estToComplete" AS est_to_complete,
  s."forecastTotal" AS forecast_total,
  s.variance,
  s."cashFlowNeed30d" AS cash_flow_30d,
  s.notes,
  'site'::TEXT AS row_kind
FROM "portfolio_site" s

UNION ALL

SELECT
  s."sortOrder" * 100 + p."sortOrder",
  p.name,
  p."percentComplete",
  CASE p.status
    WHEN 'COMPLETED' THEN 'Completed'
    WHEN 'ONGOING' THEN 'On going'
    ELSE NULL
  END,
  p."budgetCapex",
  p."actualSpend",
  p."estToComplete",
  p."forecastTotal",
  p.variance,
  p."cashFlowNeed30d",
  p.notes,
  'phase'::TEXT
FROM "portfolio_phase" p
JOIN "portfolio_site" s ON s.id = p."siteId"

UNION ALL

SELECT
  99999,
  'TOTALS'::TEXT,
  NULL,
  NULL,
  t."budgetCapex",
  t."actualSpend",
  t."estToComplete",
  t."forecastTotal",
  t.variance,
  t."cashFlowNeed30d",
  NULL,
  'totals'::TEXT
FROM "portfolio_overview_totals" t
WHERE t.id = 'alamait-portfolio-totals'

ORDER BY sort_key;
