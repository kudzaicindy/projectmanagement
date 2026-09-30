/**
 * Create estatepm role/database on local PostgreSQL (no Docker), then migrate + seed.
 *
 * Requires PostgreSQL installed and running on port 5432.
 * Set superuser URL once (password from PostgreSQL install):
 *   $env:POSTGRES_ADMIN_URL="postgresql://postgres:YOUR_PASSWORD@127.0.0.1:5432/postgres"
 *   npm run db:local
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const apiDir = join(root, 'apps', 'api');
const schema = join(apiDir, 'prisma', 'schema.prisma');
const sqlFile = join(root, 'scripts', 'setup-local-postgres.sql');

const adminUrl =
  process.env.POSTGRES_ADMIN_URL ??
  process.env.PGADMIN_URL ??
  'postgresql://postgres@127.0.0.1:5432/postgres';

function run(cmd, cwd = root) {
  execSync(cmd, { cwd, stdio: 'inherit', shell: true, env: process.env });
}

console.log('\nEstatePM — local PostgreSQL setup (no Docker)\n');

if (!existsSync(schema)) {
  console.error('Missing Prisma schema at apps/api/prisma/schema.prisma');
  process.exit(1);
}

console.log('Step 1/3: Create role and database (estatepm / estatepm)…');
try {
  run(
    `npx prisma db execute --url "${adminUrl}" --file "${sqlFile}" --schema "${schema}"`,
    apiDir,
  );
} catch {
  console.error(`
Could not connect as PostgreSQL admin.

1. Install PostgreSQL 16+ (https://www.postgresql.org/download/windows/ or: winget install PostgreSQL.PostgreSQL.16)
2. Ensure the service "postgresql-x64-16" is running.
3. Set your postgres superuser password, then run:

   PowerShell:
   $env:POSTGRES_ADMIN_URL="postgresql://postgres:YOUR_PASSWORD@127.0.0.1:5432/postgres"
   npm run db:local

See docs/LOCAL_DATABASE.md for details.
`);
  process.exit(1);
}

console.log('\nStep 2/3: Apply migrations…');
run('npm run db:migrate:deploy', apiDir);

console.log('\nStep 3/3: Seed demo data…');
run('npm run db:seed', apiDir);

const nativeUrl =
  'postgresql://estatepm:estatepm@127.0.0.1:5432/estatepm?schema=public';
const envPath = join(apiDir, '.env');
if (existsSync(envPath)) {
  const prev = readFileSync(envPath, 'utf8');
  const next = prev.replace(
    /DATABASE_URL="[^"]*"/,
    `DATABASE_URL="${nativeUrl}"`,
  );
  if (next !== prev) {
    writeFileSync(envPath, next, 'utf8');
    console.log('\nUpdated apps/api/.env → native PostgreSQL (port 5432).');
  }
} else {
  writeFileSync(
    envPath,
    `DATABASE_URL="${nativeUrl}"\nJWT_SECRET="change-me-in-dev"\nJWT_EXPIRES_IN="7d"\nPORT=3001\nUPLOAD_DIR="./uploads"\nCORS_ORIGIN="http://localhost:5173"\n`,
    'utf8',
  );
  console.log('\nCreated apps/api/.env for native PostgreSQL (port 5432).');
}

console.log('\nDone. Start the app with: npm run dev\n');
