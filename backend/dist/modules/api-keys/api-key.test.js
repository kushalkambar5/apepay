import { describe, it, expect, beforeAll } from 'vitest';
import { authService } from '../auth/auth.service';
import { apiKeyService } from './api-key.service';
import { webhookService } from '../webhooks/webhook.service';
describe('API Keys & Webhooks Delete/Revoke Test', () => {
    let merchantId;
    beforeAll(async () => {
        const testEmail = `test_delete_${Date.now()}@apepay.local`;
        const regResult = await authService.register({
            email: testEmail,
            password: 'password123',
            businessName: 'Delete Test Store',
        });
        merchantId = regResult.merchant.id;
    });
    it('should revoke API key successfully', async () => {
        const key = await apiKeyService.createApiKey(merchantId, 'Key to Revoke', 'test');
        expect(key.id).toBeDefined();
        const revoked = await apiKeyService.revokeApiKey(merchantId, key.id);
        expect(revoked.id).toBe(key.id);
        expect(revoked.revokedAt).toBeDefined();
    });
    it('should delete webhook endpoint successfully', async () => {
        const endpoint = await webhookService.registerEndpoint(merchantId, 'https://example.com/wh');
        expect(endpoint.id).toBeDefined();
        const deleted = await webhookService.deleteEndpoint(merchantId, endpoint.id);
        expect(deleted.id).toBe(endpoint.id);
    });
});
