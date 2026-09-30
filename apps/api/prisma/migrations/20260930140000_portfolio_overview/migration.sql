-- CreateEnum
CREATE TYPE "PortfolioRowStatus" AS ENUM ('COMPLETED', 'ONGOING', 'NOT_STARTED');

-- CreateTable
CREATE TABLE "portfolio_site" (
    "id" TEXT NOT NULL,
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_phase" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_phase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_overview_totals" (
    "id" TEXT NOT NULL DEFAULT 'alamait-portfolio-totals',
    "budgetCapex" DECIMAL(14,2),
    "actualSpend" DECIMAL(14,2),
    "estToComplete" DECIMAL(14,2),
    "forecastTotal" DECIMAL(14,2),
    "variance" DECIMAL(14,2),
    "cashFlowNeed30d" DECIMAL(14,2),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_overview_totals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "portfolio_phase_siteId_idx" ON "portfolio_phase"("siteId");

-- AddForeignKey
ALTER TABLE "portfolio_phase" ADD CONSTRAINT "portfolio_phase_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "portfolio_site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
