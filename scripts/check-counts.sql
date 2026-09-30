SELECT (SELECT COUNT(*) FROM "Property") AS properties, (SELECT COUNT(*) FROM "Project") AS projects, (SELECT COUNT(*) FROM portfolio_site) AS portfolio_sites;
