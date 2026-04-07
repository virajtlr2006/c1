import { config } from 'dotenv';
import { defineConfig, Config } from 'drizzle-kit';

config({ path: '.env' });

export default defineConfig({
  schema: './db/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env['DATABASE_URL']!,
  },
}) satisfies Config;