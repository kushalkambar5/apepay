import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '../config/env';

const queryClient = postgres(env.DATABASE_URL);
export const db = drizzle(queryClient, { schema });

// Ensure key column exists in api_keys table
queryClient`ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS key TEXT;`.catch((err) => {
  console.error('Migration notice for api_keys.key:', err.message);
});

export * from './schema';
