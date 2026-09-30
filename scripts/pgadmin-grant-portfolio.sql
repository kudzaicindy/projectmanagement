-- Run once in pgAdmin as postgres on database estatepm (if npm run db:portfolio fails on ownership)
ALTER TABLE portfolio_site OWNER TO estatepm;
ALTER TABLE portfolio_phase OWNER TO estatepm;
ALTER TABLE portfolio_overview_totals OWNER TO estatepm;
GRANT ALL ON TABLE portfolio_site, portfolio_phase, portfolio_overview_totals TO estatepm;
