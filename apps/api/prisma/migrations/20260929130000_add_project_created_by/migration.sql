-- AlterTable
ALTER TABLE "Project" ADD COLUMN "createdById" TEXT;

-- Backfill from manager where possible
UPDATE "Project" SET "createdById" = "managerId" WHERE "createdById" IS NULL AND "managerId" IS NOT NULL;

-- Fallback: assign to first admin user for any remaining rows
UPDATE "Project" SET "createdById" = (SELECT "id" FROM "User" WHERE "role" = 'ADMIN' LIMIT 1)
WHERE "createdById" IS NULL;

-- Make required
ALTER TABLE "Project" ALTER COLUMN "createdById" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Project_createdById_idx" ON "Project"("createdById");
