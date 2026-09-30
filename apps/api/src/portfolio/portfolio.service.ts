import { Injectable, Logger } from '@nestjs/common';
import { PortfolioRowStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

function num(v: { toNumber(): number } | null | undefined): number | undefined {
  if (v == null) return undefined;
  return v.toNumber();
}

function mapStatus(s: PortfolioRowStatus | null | undefined): 'completed' | 'ongoing' | 'not_started' {
  if (s === 'COMPLETED') return 'completed';
  if (s === 'ONGOING') return 'ongoing';
  return 'not_started';
}

function siteHasSummary(row: {
  percentComplete: number | null;
  budgetCapex: unknown;
  actualSpend: unknown;
  notes: string | null;
}): boolean {
  return (
    row.percentComplete != null ||
    row.budgetCapex != null ||
    row.actualSpend != null ||
    (row.notes != null && row.notes.length > 0)
  );
}

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getHealthOverview() {
    try {
      return await this.loadHealthOverview();
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        (err.code === 'P2021' || err.code === 'P2022')
      ) {
        this.logger.warn(
          'Portfolio tables missing — run: npm run db:migrate:deploy -w @estatepm/api && npm run db:portfolio',
        );
        return { projects: [], totals: null };
      }
      throw err;
    }
  }

  private async loadHealthOverview() {
    const sites = await this.prisma.portfolioSite.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { phases: { orderBy: { sortOrder: 'asc' } } },
    });
    const totals = await this.prisma.portfolioOverviewTotals.findUnique({
      where: { id: 'alamait-portfolio-totals' },
    });

    const projects = sites.map((site) => {
      const phases = site.phases.map((ph) => ({
        id: ph.id,
        name: ph.name,
        percentComplete: ph.percentComplete ?? 0,
        status: mapStatus(ph.status),
        budgetCapex: num(ph.budgetCapex),
        actualSpend: num(ph.actualSpend),
        estToComplete: num(ph.estToComplete),
        forecastTotal: num(ph.forecastTotal),
        variance: num(ph.variance),
        cashFlowNeed30d: num(ph.cashFlowNeed30d),
        notes: ph.notes ?? undefined,
      }));

      let summary: (typeof phases)[0] | undefined;
      if (siteHasSummary(site)) {
        summary = {
          id: `${site.id}-sum`,
          name: site.name,
          percentComplete: site.percentComplete ?? 0,
          status: mapStatus(site.status),
          budgetCapex: num(site.budgetCapex),
          actualSpend: num(site.actualSpend),
          estToComplete: num(site.estToComplete),
          forecastTotal: num(site.forecastTotal),
          variance: num(site.variance),
          cashFlowNeed30d: num(site.cashFlowNeed30d),
          notes: site.notes ?? undefined,
        };
      }

      return { id: site.id, name: site.name, summary, phases };
    });

    return {
      projects,
      totals: totals
        ? {
            budgetCapex: num(totals.budgetCapex) ?? 0,
            actualSpend: num(totals.actualSpend) ?? 0,
            estToComplete: num(totals.estToComplete) ?? 0,
            forecastTotal: num(totals.forecastTotal) ?? 0,
            variance: num(totals.variance) ?? 0,
            cashFlowNeed30d: num(totals.cashFlowNeed30d) ?? 0,
          }
        : null,
    };
  }
}
