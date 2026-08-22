import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/apepay';

// Disable prefetch as recommended by postgres.js when used with Drizzle
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });

export * from './schema.js';
