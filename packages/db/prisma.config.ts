import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Use process.env directly (instead of the throwing `env()` helper) so that
    // commands like `prisma generate` work at build time without a DATABASE_URL.
    // The real connection string is provided at runtime (e.g. via docker-compose).
    url: process.env.DATABASE_URL ?? '',
  },
});
