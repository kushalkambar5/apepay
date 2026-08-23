import { eq, and, isNull, desc } from 'drizzle-orm';
import { db, apiKeys } from '../../db';
import { generateApiKey } from '../../lib/crypto';
import { NotFoundError } from '../../lib/errors';

export class ApiKeyService {
  async createApiKey(merchantId: string, name: string, environment: 'test' | 'live' = 'test') {
    const { apiKey, keyPrefix, keyHash } = generateApiKey(environment);

    const [keyRecord] = await db
      .insert(apiKeys)
      .values({
        merchantId,
        name: name || `${environment.toUpperCase()} Key`,
        keyPrefix,
        keyHash,
        environment,
      })
      .returning();

    return {
      apiKey, // Plain key - shown only once upon creation
      id: keyRecord.id,
      name: keyRecord.name,
      keyPrefix: keyRecord.keyPrefix,
      environment: keyRecord.environment,
      createdAt: keyRecord.createdAt,
    };
  }

  async listApiKeys(merchantId: string) {
    return db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        keyPrefix: apiKeys.keyPrefix,
        environment: apiKeys.environment,
        lastUsedAt: apiKeys.lastUsedAt,
        expiresAt: apiKeys.expiresAt,
        revokedAt: apiKeys.revokedAt,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.merchantId, merchantId))
      .orderBy(desc(apiKeys.createdAt));
  }

  async revokeApiKey(merchantId: string, keyId: string) {
    const [revokedKey] = await db
      .update(apiKeys)
      .set({ revokedAt: new Date() })
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.merchantId, merchantId), isNull(apiKeys.revokedAt)))
      .returning();

    if (!revokedKey) {
      throw new NotFoundError('API Key not found or already revoked');
    }

    return revokedKey;
  }
}

export const apiKeyService = new ApiKeyService();
