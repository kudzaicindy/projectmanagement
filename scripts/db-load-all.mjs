/**
 * Load Alamait properties/projects on every local Postgres URL (5432 + 5434).
 * Use when Portfolio/Projects are empty due to API pointing at a different port.
 */
import { execSync } from 'node:child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const apiDir = join(root, 'apps', 'api');
const sql = join(root, 'scripts', 'alamait-properties-and-projects.sql');

const urls = [
  'postgresql://estatepm:estatepm@127.0.0.1:5432/estatepm?schema=public',
  'postgresql://estatepm:estatepm@127.0.0.1:5434/estatepm?schema=public',
];

for (const url of urls) {
  const port = url.includes(':5434') ? '5434' : '5432';
  console.log(`\nLoading Alamait sites on port ${port}…`);
  execSync(`npx prisma db execute --file "${sql}" --schema prisma/schema.prisma`, {
    cwd: apiDir,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url },
    shell: true,
  });
}

console.log('\nDone. Restart npm run dev and check API log for "Database connected → 127.0.0.1:PORT".\n');
