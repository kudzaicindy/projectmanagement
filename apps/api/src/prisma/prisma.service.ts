import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    const maxAttempts = process.env.NODE_ENV === 'production' ? 1 : 30;
    const delayMs = 2000;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.$connect();
        const dbUrl = process.env.DATABASE_URL ?? '';
        const hostMatch = dbUrl.match(/@([^/]+)/);
        const dbTarget = hostMatch?.[1] ?? 'unknown';
        this.logger.log(
          attempt > 1
            ? `Database connected (attempt ${attempt}) → ${dbTarget}`
            : `Database connected → ${dbTarget}`,
        );
        return;
      } catch (err) {
        if (attempt >= maxAttempts) throw err;
        const detail =
          err instanceof Error
            ? (err.message.split('\n').find((l) => l.trim()) ?? err.message)
            : String(err);
        this.logger.warn(
          `Database not ready (attempt ${attempt}/${maxAttempts}): ${detail}. ` +
            'Run `npm run db:local:ps` (native Postgres) or `npm run db:docker` + `npm run db:setup` — retrying…',
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
