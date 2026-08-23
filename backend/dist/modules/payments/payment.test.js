import { describe, it, expect, beforeAll } from 'vitest';
import { authService } from '../auth/auth.service';
import { apiKeyService } from '../api-keys/api-key.service';
import { paymentService } from './payment.service';
describe('Payment & API Key Service Integration', () => {
    let merchantId;
    let apiKey;
    beforeAll(async () => {
        const testEmail = `test_${Date.now()}@apepay.local`;
        const regResult = await authService.register({
            email: testEmail,
            password: 'password123',
            businessName: 'Integration Test Store',
        });
        merchantId = regResult.merchant.id;
        const keyResult = await apiKeyService.createApiKey(merchantId, 'Test API Key', 'test');
        apiKey = keyResult.apiKey;
    });
    it('should create payment session successfully', async () => {
        const payment = await paymentService.createPayment({
            merchantId,
            amount: '0.05',
            currency: 'ETH',
            orderId: 'ORD-999',
            webhookUrl: 'https://example.com/webhook',
        });
        expect(payment.paymentId).toMatch(/^pay_[a-f0-9]{24}$/);
        expect(payment.amount).toBe('0.05');
        expect(payment.currency).toBe('ETH');
        expect(payment.status).toBe('pending');
        expect(payment.intent).toBeDefined();
        expect(payment.intent.protocol).toBe('zkBob');
    });
    it('should return identical payment for duplicate Idempotency-Key', async () => {
        const idempotencyKey = `idemp_${Date.now()}`;
        const payment1 = await paymentService.createPayment({
            merchantId,
            amount: '0.10',
            idempotencyKey,
        });
        const payment2 = await paymentService.createPayment({
            merchantId,
            amount: '0.10',
            idempotencyKey,
        });
        expect(payment1.paymentId).toBe(payment2.paymentId);
    });
    it('should return public checkout session without sensitive merchant fields', async () => {
        const payment = await paymentService.createPayment({
            merchantId,
            amount: '0.25',
            orderId: 'ORD-CHECKOUT',
        });
        const session = await paymentService.getCheckoutSession(payment.paymentId);
        expect(session.paymentId).toBe(payment.paymentId);
        expect(session.amount).toBe('0.25');
        expect(session.merchant.name).toBe('Integration Test Store');
        expect(session.intent.recipientIdentifier).toBeDefined();
    });
});
