# PostgreSQL (EstatePM)

EstatePM uses **PostgreSQL only** (Prisma). There is no SQLite or other database.

## Recommended: native PostgreSQL (port 5432)

You already have PostgreSQL installed on Windows. Use the local server on **127.0.0.1:5432**.

### One-time setup

From the repo root:

```powershell
npm run db:local:ps
```

Enter the **postgres** superuser password from your PostgreSQL install. This will:

1. Create role/database `estatepm` / `estatepm` (password `estatepm`)
2. Run Prisma migrations
3. Seed demo users
4. Set `apps/api/.env` → `DATABASE_URL` on port **5432**

### Run the app

```powershell
npm run dev
```

Wait for `Nest application successfully started`, then sign in (e.g. `pm@alamait.com` / `alamait123`).

### Connection string

```env
DATABASE_URL="postgresql://estatepm:estatepm@127.0.0.1:5432/estatepm?schema=public"
```

Use **127.0.0.1**, not `localhost`, to avoid IPv6 connection issues on Windows.

## Optional: Docker PostgreSQL (port 5434)

If you prefer an isolated database in Docker:

```powershell
npm run db:docker
```

Set `apps/api/.env`:

```env
DATABASE_URL="postgresql://estatepm:estatepm@127.0.0.1:5434/estatepm?schema=public"
```

Then `npm run db:setup` if the container is new.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run db:local:ps` | First-time native Postgres (prompts for postgres password) |
| `npm run db:local` | Same, when `POSTGRES_ADMIN_URL` is already set |
| `npm run db:setup` | Migrate + seed (database already exists) |
| `npm run db:migrate` | Create/apply dev migrations |
| `npm run db:studio` | Prisma Studio |
| `npm run db:portfolio` | Load portfolio overview + Property/Project rows; view `v_alamait_portfolio_overview` in pgAdmin |
| `npm run db:clean` | Delete all properties, projects, tasks, documents, audit (keeps users & portfolio tables) |
| `npm run db:docker` | Start Docker Postgres on 5434 |
| `npm run db:down` | Stop Docker Postgres |

## Troubleshooting

- **P1000 authentication failed** — Postgres is reachable but user `estatepm` is missing or the password does not match `apps/api/.env`.
  - **pgAdmin (PostgreSQL 18):** open database **postgres** → **Query Tool** → run `scripts/pgadmin-reset-estatepm.sql` → then on database **estatepm** run `GRANT ALL ON SCHEMA public TO estatepm;` → `npm run db:setup`.
  - Or run `npm run db:local:ps` and enter your **postgres** superuser password (resets role to `estatepm` / `estatepm` on port **5432**).
  - If you created the DB in pgAdmin with a **custom password**, put that same password in `DATABASE_URL`.
- **Two PostgreSQL versions:** On this machine PG **18** uses port **5432**, PG **13** uses **5433**. EstatePM `.env` targets **5432** (PG 18). Create `estatepm` on the server pgAdmin shows as **PostgreSQL 18**.
- **P1001 connection refused** — Start the Windows PostgreSQL service or Docker (`npm run db:docker`).
- **Wrong port** — Native **5432**, Docker **5434**; they must match `DATABASE_URL`.
