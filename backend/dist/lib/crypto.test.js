import { describe, it, expect } from 'vitest';
import { generateApiKey, generatePaymentId, hashApiKey, signWebhookPayload, verifyWebhookSignature } from './crypto';
describe('Crypto Utilities', () => {
    it('should generate valid payment ID with pay_ prefix', () => {
        const paymentId = generatePaymentId();
        expect(paymentId).toMatch(/^pay_[a-f0-9]{24}$/);
    });
    it('should generate valid API key for test and live environments', () => {
        const testKey = generateApiKey('test');
        expect(testKey.apiKey).toMatch(/^ape_test_[a-f0-9]{48}$/);
        expect(testKey.keyPrefix).toMatch(/^ape_test_[a-f0-9]{4}\.\.\.$/);
        expect(testKey.keyHash).toHaveLength(64);
        const liveKey = generateApiKey('live');
        expect(liveKey.apiKey).toMatch(/^ape_live_[a-f0-9]{48}$/);
    });
    it('should generate consistent SHA-256 hash for API keys', () => {
        const apiKey = 'ape_test_1234567890abcdef1234567890abcdef1234567890abcdef';
        const hash1 = hashApiKey(apiKey);
        const hash2 = hashApiKey(apiKey);
        expect(hash1).toEqual(hash2);
        expect(hash1).toHaveLength(64);
    });
    it('should correctly sign and verify webhook payloads', () => {
        const payload = { event: 'payment.paid', paymentId: 'pay_123' };
        const secret = 'whsec_test_secret_key_123456';
        const signature = signWebhookPayload(payload, secret);
        expect(signature).toMatch(/^sha256=[a-f0-9]{64}$/);
        const isValid = verifyWebhookSignature(payload, signature, secret);
        expect(isValid).toBe(true);
    });
});
