import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000').transform((val) => parseInt(val, 10)),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().default('postgres://postgres:postgres@localhost:5432/apepay'),
  BACKEND_URI: z.string().default('http://localhost:4000'),
  FRONTEND_URI: z.string().default('http://localhost:3000'),
  ANVIL_RPC_URL: z.string().default('http://127.0.0.1:8545'),
  JWT_SECRET: z.string().default('apepay_super_secret_jwt_key_2026'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(process.env);
