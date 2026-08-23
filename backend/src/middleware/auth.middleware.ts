import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { eq, and, isNull, gte } from 'drizzle-orm';
import { db, apiKeys, merchants, users } from '../db';
import { hashApiKey } from '../lib/crypto';
import { UnauthorizedError, ForbiddenError } from '../lib/errors';
import { env } from '../config/env';

declare module 'fastify' {
  interface FastifyRequest {
    merchant?: typeof merchants.$inferSelect;
    apiKey?: typeof apiKeys.$inferSelect;
    user?: typeof users.$inferSelect;
  }
}

/**
 * Middleware for Merchant API Key Authentication (Bearer ape_test_... / ape_live_...)
 */
export async function authenticateApiKey(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid Authorization header. Expected Bearer ape_...');
  }

  const rawKey = authHeader.replace('Bearer ', '').trim();
  if (!rawKey.startsWith('ape_')) {
    throw new UnauthorizedError('Invalid API Key format.');
  }

  const keyHash = hashApiKey(rawKey);

  const [keyRecord] = await db
    .select()
    .from(apiKeys)
    .where(
      and(
        eq(apiKeys.keyHash, keyHash),
        isNull(apiKeys.revokedAt)
      )
    )
    .limit(1);

  if (!keyRecord) {
    throw new UnauthorizedError('Invalid or revoked API Key.');
  }

  if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
    throw new UnauthorizedError('API Key has expired.');
  }

  const [merchant] = await db
    .select()
    .from(merchants)
    .where(eq(merchants.id, keyRecord.merchantId!))
    .limit(1);

  if (!merchant || merchant.status !== 'active') {
    throw new ForbiddenError('Merchant account is inactive or suspended.');
  }

  // Update lastUsedAt asynchronously
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, keyRecord.id))
    .catch(() => {});

  request.merchant = merchant;
  request.apiKey = keyRecord;
}

/**
 * Middleware for Merchant Dashboard Session Authentication (JWT token)
 */
export async function authenticateDashboard(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid Authorization header');
  }

  const token = authHeader.replace('Bearer ', '').trim();
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string; merchantId: string };

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const [merchant] = await db
      .select()
      .from(merchants)
      .where(eq(merchants.id, payload.merchantId))
      .limit(1);

    if (!merchant) {
      throw new UnauthorizedError('Merchant account not found');
    }

    request.user = user;
    request.merchant = merchant;
  } catch (err) {
    if (err instanceof UnauthorizedError || err instanceof ForbiddenError) {
      throw err;
    }
    throw new UnauthorizedError('Invalid or expired dashboard session token');
  }
}
