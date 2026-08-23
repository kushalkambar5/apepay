import crypto from 'node:crypto';
/**
 * Generate a random payment identifier with `pay_` prefix.
 */
export function generatePaymentId() {
    return `pay_${crypto.randomBytes(12).toString('hex')}`;
}
/**
 * Generate a new API key with environment prefix (`ape_test_` or `ape_live_`).
 * Returns both plain secret key (shown once to merchant) and its SHA-256 hash (stored in DB).
 */
export function generateApiKey(env = 'test') {
    const prefix = `ape_${env}_`;
    const randomSecret = crypto.randomBytes(24).toString('hex');
    const apiKey = `${prefix}${randomSecret}`;
    const keyPrefix = `${prefix}${randomSecret.slice(0, 4)}...`;
    const keyHash = hashApiKey(apiKey);
    return { apiKey, keyPrefix, keyHash };
}
/**
 * Hash an API key using SHA-256 for secure database storage & lookup.
 */
export function hashApiKey(apiKey) {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
}
/**
 * Generate an HMAC-SHA256 signature for webhooks using secret key.
 */
export function signWebhookPayload(payload, secret) {
    const data = JSON.stringify(payload);
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(data);
    return `sha256=${hmac.digest('hex')}`;
}
/**
 * Verify HMAC signature.
 */
export function verifyWebhookSignature(payload, signature, secret) {
    const expectedSignature = signWebhookPayload(payload, secret);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}
