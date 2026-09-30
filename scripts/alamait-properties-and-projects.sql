-- Loads Alamait sites into Property + Project (Portfolio page in app).
-- Safe to run as estatepm — does not touch portfolio_* tables.
-- Run: npm run db:properties  OR after db:clean when portfolio import fails.

BEGIN;

DELETE FROM "Task" WHERE "projectId" LIKE 'alamait-proj-%';
DELETE FROM "Document" WHERE "projectId" LIKE 'alamait-proj-%';
DELETE FROM "Project" WHERE id LIKE 'alamait-proj-%';
DELETE FROM "Property" WHERE id LIKE 'alamait-prop-%';

INSERT INTO "Property" (id, name, address, city, country, description, "createdAt", "updatedAt") VALUES
  ('alamait-prop-christonbank-wall', 'Christonbank Wall', 'Alamait development site', 'Harare', 'ZW', 'Portfolio overview import', NOW(), NOW()),
  ('alamait-prop-belvedere', 'Belvedere', 'Alamait development site', 'Harare', 'ZW', 'Portfolio overview import', NOW(), NOW()),
  ('alamait-prop-newlands', 'Newlands', 'Alamait development site', 'Harare', 'ZW', 'Portfolio overview import', NOW(), NOW()),
  ('alamait-prop-avondale', 'Avondale', 'Alamait development site', 'Harare', 'ZW', 'Portfolio overview import', NOW(), NOW()),
  ('alamait-prop-st-kilda', 'St Kilda', 'Alamait development site', 'Harare', 'ZW', 'Portfolio overview import', NOW(), NOW()),
  ('alamait-prop-greendale', 'Greendale', 'Alamait development site', 'Harare', 'ZW', 'Portfolio overview import', NOW(), NOW()),
  ('alamait-prop-fife-avenue', 'Fife Avenue', 'Alamait development site', 'Harare', 'ZW', 'Portfolio overview import', NOW(), NOW()),
  ('alamait-prop-juliasdale-nyanga', 'Juliasdale Nyanga', 'Alamait development site', 'Nyanga', 'ZW', 'Portfolio overview import', NOW(), NOW()),
  ('alamait-prop-shaw-cottage-nyanga', 'Shaw cottage Nyanga', 'Alamait development site', 'Nyanga', 'ZW', 'Portfolio overview import', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, "updatedAt" = NOW();

INSERT INTO "Project" (
  id, name, type, status, description, "budgetUsd",
  "propertyId", "managerId", "createdById", "createdAt", "updatedAt"
)
SELECT v.id, v.name, 'DEVELOPMENT'::"ProjectType", v.status::"ProjectStatus", v.description, v.budget,
  v.prop_id,
  u.id, u.id, NOW(), NOW()
FROM (VALUES
  ('alamait-proj-christonbank-wall', 'Christonbank Wall', 'ACTIVE', 'Over budget on labour/transport', 155171, 'alamait-prop-christonbank-wall'),
  ('alamait-proj-belvedere', 'Belvedere', 'DRAFT', 'Alamait portfolio site', NULL, 'alamait-prop-belvedere'),
  ('alamait-proj-newlands', 'Newlands', 'DRAFT', 'Alamait portfolio site', NULL, 'alamait-prop-newlands'),
  ('alamait-proj-avondale', 'Avondale', 'DRAFT', 'Alamait portfolio site', NULL, 'alamait-prop-avondale'),
  ('alamait-proj-st-kilda', 'St Kilda', 'ACTIVE', 'Alamait portfolio site', 28589, 'alamait-prop-st-kilda'),
  ('alamait-proj-greendale', 'Greendale', 'ACTIVE', 'Alamait portfolio site', 35344, 'alamait-prop-greendale'),
  ('alamait-proj-fife-avenue', 'Fife Avenue', 'DRAFT', 'Alamait portfolio site', NULL, 'alamait-prop-fife-avenue'),
  ('alamait-proj-juliasdale-nyanga', 'Juliasdale Nyanga', 'ACTIVE', 'Awaiting approvals on locating of pegs payments', NULL, 'alamait-prop-juliasdale-nyanga'),
  ('alamait-proj-shaw-cottage-nyanga', 'Shaw cottage Nyanga', 'DRAFT', 'Alamait portfolio site', NULL, 'alamait-prop-shaw-cottage-nyanga')
) AS v(id, name, status, description, budget, prop_id)
CROSS JOIN (SELECT id FROM "User" WHERE email = 'pm@alamait.com' LIMIT 1) u
WHERE u.id IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  description = EXCLUDED.description,
  "budgetUsd" = EXCLUDED."budgetUsd",
  "updatedAt" = NOW();

COMMIT;
