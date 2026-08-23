import { pgTable, uuid, varchar, text, timestamp, boolean, numeric, integer, jsonb, pgEnum, uniqueIndex, } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
// Enums
export const merchantStatusEnum = pgEnum('merchant_status', ['active', 'suspended']);
export const walletTypeEnum = pgEnum('wallet_type', ['payout', 'authentication']);
export const apiKeyEnvironmentEnum = pgEnum('api_key_environment', ['test', 'live']);
export const paymentStatusEnum = pgEnum('payment_status', [
    'created',
    'pending',
    'processing',
    'paid',
    'expired',
    'failed',
    'cancelled',
]);
export const webhookDeliveryStatusEnum = pgEnum('webhook_delivery_status', [
    'pending',
    'delivered',
    'failed',
]);
// 1. users
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash'),
    name: varchar('name', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
// 2. merchants
export const merchants = pgTable('merchants', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    businessName: varchar('business_name', { length: 255 }),
    website: text('website'),
    status: merchantStatusEnum('status').default('active'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
// 3. merchant_wallets
export const merchantWallets = pgTable('merchant_wallets', {
    id: uuid('id').defaultRandom().primaryKey(),
    merchantId: uuid('merchant_id').references(() => merchants.id, { onDelete: 'cascade' }),
    network: varchar('network', { length: 255 }),
    address: varchar('address', { length: 255 }),
    walletType: walletTypeEnum('wallet_type'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
// 4. api_keys
export const apiKeys = pgTable('api_keys', {
    id: uuid('id').defaultRandom().primaryKey(),
    merchantId: uuid('merchant_id').references(() => merchants.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }),
    keyPrefix: varchar('key_prefix', { length: 255 }),
    keyHash: text('key_hash'),
    environment: apiKeyEnvironmentEnum('environment').default('test'),
    lastUsedAt: timestamp('last_used_at'),
    expiresAt: timestamp('expires_at'),
    revokedAt: timestamp('revoked_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
// 5. payments
export const payments = pgTable('payments', {
    id: uuid('id').defaultRandom().primaryKey(),
    paymentId: varchar('payment_id', { length: 255 }).notNull().unique(),
    merchantId: uuid('merchant_id').references(() => merchants.id, { onDelete: 'cascade' }),
    orderId: varchar('order_id', { length: 255 }),
    amount: numeric('amount'),
    currency: varchar('currency', { length: 255 }),
    network: varchar('network', { length: 255 }),
    status: paymentStatusEnum('status').default('pending'),
    checkoutUrl: text('checkout_url'),
    redirectUrl: text('redirect_url'),
    webhookUrl: text('webhook_url'),
    idempotencyKey: varchar('idempotency_key', { length: 255 }),
    metadata: jsonb('metadata'),
    expiresAt: timestamp('expires_at'),
    paidAt: timestamp('paid_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    uniqueIndex('merchant_idempotency_idx').on(table.merchantId, table.idempotencyKey),
]);
// 6. payment_intents
export const paymentIntents = pgTable('payment_intents', {
    id: uuid('id').defaultRandom().primaryKey(),
    paymentId: uuid('payment_id')
        .unique()
        .references(() => payments.id, { onDelete: 'cascade' }),
    protocol: varchar('protocol', { length: 255 }),
    protocolVersion: varchar('protocol_version', { length: 255 }),
    asset: varchar('asset', { length: 255 }),
    network: varchar('network', { length: 255 }),
    expectedAmount: numeric('expected_amount'),
    paymentIdentifier: text('payment_identifier'),
    commitment: text('commitment'),
    recipientIdentifier: text('recipient_identifier'),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
// 7. payment_events
export const paymentEvents = pgTable('payment_events', {
    id: uuid('id').defaultRandom().primaryKey(),
    paymentId: uuid('payment_id').references(() => payments.id, { onDelete: 'cascade' }),
    eventType: varchar('event_type', { length: 255 }),
    oldStatus: varchar('old_status', { length: 255 }),
    newStatus: varchar('new_status', { length: 255 }),
    source: varchar('source', { length: 255 }),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
// 8. webhook_endpoints
export const webhookEndpoints = pgTable('webhook_endpoints', {
    id: uuid('id').defaultRandom().primaryKey(),
    merchantId: uuid('merchant_id').references(() => merchants.id, { onDelete: 'cascade' }),
    url: text('url'),
    secret: text('secret'),
    secretHash: text('secret_hash'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
// 9. webhook_deliveries
export const webhookDeliveries = pgTable('webhook_deliveries', {
    id: uuid('id').defaultRandom().primaryKey(),
    webhookEndpointId: uuid('webhook_endpoint_id').references(() => webhookEndpoints.id, {
        onDelete: 'cascade',
    }),
    paymentId: uuid('payment_id').references(() => payments.id, { onDelete: 'cascade' }),
    eventType: varchar('event_type', { length: 255 }),
    payload: jsonb('payload'),
    status: webhookDeliveryStatusEnum('status'),
    attemptCount: integer('attempt_count'),
    nextRetryAt: timestamp('next_retry_at'),
    lastResponseCode: integer('last_response_code'),
    lastError: text('last_error'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    deliveredAt: timestamp('delivered_at'),
});
// Relations
export const usersRelations = relations(users, ({ many }) => ({
    merchants: many(merchants),
}));
export const merchantsRelations = relations(merchants, ({ one, many }) => ({
    user: one(users, {
        fields: [merchants.userId],
        references: [users.id],
    }),
    wallets: many(merchantWallets),
    apiKeys: many(apiKeys),
    payments: many(payments),
    webhookEndpoints: many(webhookEndpoints),
}));
export const merchantWalletsRelations = relations(merchantWallets, ({ one }) => ({
    merchant: one(merchants, {
        fields: [merchantWallets.merchantId],
        references: [merchants.id],
    }),
}));
export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
    merchant: one(merchants, {
        fields: [apiKeys.merchantId],
        references: [merchants.id],
    }),
}));
export const paymentsRelations = relations(payments, ({ one, many }) => ({
    merchant: one(merchants, {
        fields: [payments.merchantId],
        references: [merchants.id],
    }),
    intent: one(paymentIntents, {
        fields: [payments.id],
        references: [paymentIntents.paymentId],
    }),
    events: many(paymentEvents),
    deliveries: many(webhookDeliveries),
}));
export const paymentIntentsRelations = relations(paymentIntents, ({ one }) => ({
    payment: one(payments, {
        fields: [paymentIntents.paymentId],
        references: [payments.id],
    }),
}));
export const paymentEventsRelations = relations(paymentEvents, ({ one }) => ({
    payment: one(payments, {
        fields: [paymentEvents.paymentId],
        references: [payments.id],
    }),
}));
export const webhookEndpointsRelations = relations(webhookEndpoints, ({ one, many }) => ({
    merchant: one(merchants, {
        fields: [webhookEndpoints.merchantId],
        references: [merchants.id],
    }),
    deliveries: many(webhookDeliveries),
}));
export const webhookDeliveriesRelations = relations(webhookDeliveries, ({ one }) => ({
    endpoint: one(webhookEndpoints, {
        fields: [webhookDeliveries.webhookEndpointId],
        references: [webhookEndpoints.id],
    }),
    payment: one(payments, {
        fields: [webhookDeliveries.paymentId],
        references: [payments.id],
    }),
}));
