SELECT 'User' AS t, COUNT(*)::text AS n FROM "User"
UNION ALL SELECT 'Property', COUNT(*)::text FROM "Property"
UNION ALL SELECT 'Project', COUNT(*)::text FROM "Project"
UNION ALL SELECT 'pm_user', COALESCE((SELECT id FROM "User" WHERE email = 'pm@alamait.com' LIMIT 1), 'NONE');
