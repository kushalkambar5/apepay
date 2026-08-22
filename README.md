# ApePay is a crypto(Ethereum) payment gateway which allow merchants to accept payments in crypto with privacy


this project i have to show only as a mvp as a demo so i will be showing the demo in local anvil for now.

backend will be exposed with ngrok
and frontend will be hosted on vercel.
Contracts will be in Local Anvil for now
db will be postgresql(drizzle) running on my laptop




# 1. Backend architecture

For your MVP, I recommend a **modular monolith**, not microservices.

You don't need 8 independently deployed services for a hackathon/demo.

```
                         ┌──────────────────────┐
                         │      MERCHANT        │
                         │                      │
                         │ Dashboard / Backend  │
                         └──────────┬───────────┘
                                    │
                          REST API / SDK
                                    │
                                    ▼
                    ┌───────────────────────────┐
                    │       APEPAY API          │
                    │        Node.js            │
                    │       TypeScript          │
                    │                           │
                    │ Auth                      │
                    │ Merchant                  │
                    │ Payments                  │
                    │ Webhooks                  │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┼──────────────┐
                    │             │              │
                    ▼             ▼              ▼
             ┌───────────┐ ┌───────────┐ ┌────────────┐
             │ PostgreSQL│ │ zkBob     │ │ Blockchain │
             │ + Drizzle │ │ Service   │ │ RPC/Anvil  │
             └───────────┘ └───────────┘ └─────┬──────┘
                                               │
                                               ▼
                                         ┌────────────┐
                                         │ zkBob Pool │
                                         └────────────┘
```

The key separation is:

```
API
 ↓
Payment Service
 ↓
zkBob Service
 ↓
Blockchain
```

rather than:

```
API route
 ↓
do everything
 ↓
send transaction
 ↓
scan blockchain
 ↓
verify proof
 ↓
update DB
```

---

# 2. Backend responsibilities

I'd divide the backend into these modules:

```
src/
│
├── config/
│
├── db/
│
├── modules/
│   │
│   ├── auth/
│   ├── merchants/
│   ├── api-keys/
│   ├── wallets/
│   ├── payments/
│   ├── payment-intents/
│   ├── webhooks/
│   ├── blockchain/
│   └── zkbob/
│
├── workers/
│
├── lib/
│
├── middleware/
│
├── routes/
│
└── server.ts
```

But internally, I'd organize around **business domains**, not around HTTP routes.

---

# 3. Technology stack

For ApePay:

```
Runtime:
Node.js

Language:
TypeScript

HTTP:
Fastify

Database:
PostgreSQL

ORM:
Drizzle ORM

Validation:
Zod

Authentication:
NextAuth/Auth.js for dashboard
API keys for merchant API

Blockchain:
viem

Wallet:
MetaMask

Network:
Anvil

Privacy:
zkBob

Background processing:
Node worker initially

Logging:
Pino

Testing:
Vitest

API documentation:
OpenAPI
```

I prefer **Fastify over Express** for this project because you are building an API product, and Fastify gives you a cleaner structure and strong TypeScript support.

---

# 4. Three different types of authentication

This is important.

You actually have **three authentication situations**.

## A. Merchant dashboard

```
Merchant
   ↓
ApePay Dashboard
   ↓
NextAuth
   ↓
users
```

Used for:

```
dashboard
merchant settings
wallet configuration
API key management
payment history
```

---

## B. Merchant backend → ApePay API

```
Merchant backend
      ↓
Authorization: Bearer ape_live_xxx
      ↓
ApePay API
```

Uses:

```
api_keys
```

---

## C. Customer → checkout

Customer does **not** authenticate with ApePay.

```
Customer
   ↓
Checkout session
   ↓
MetaMask
```

This distinction should exist throughout your code.

---

# 5. API versioning

Everything merchant-facing should start with:

```
/v1
```

For example:

```
POST /v1/payments
GET  /v1/payments/:paymentId
```

Internal endpoints should **not necessarily be public**.

For example:

```
/internal/payments/:id/verify
/internal/webhooks/process
/internal/indexer/scan
```

Don't expose those publicly.

---

# 6. Public API structure

I would initially expose:

```
/v1
│
├── payments
│   ├── POST /
│   ├── GET /:paymentId
│   └── POST /:paymentId/cancel
│
├── webhook-endpoints
│   ├── GET /
│   ├── POST /
│   └── DELETE /:id
│
└── merchant
    └── GET /
```

That's enough for the first SDK.

---

# 7. `POST /v1/payments`

This is your most important endpoint.

```
POST /v1/payments
Authorization: Bearer ape_test_xxxxx
Content-Type: application/json
```

Request:

```
{
  "amount":"0.1",
  "currency":"ETH",
  "orderId":"ORDER-123",
  "webhookUrl":"https://merchant.com/api/payment/webhook",
  "redirectUrl":"https://merchant.com/orders/123"
}
```

Backend flow:

```
Request
  ↓
Authenticate API key
  ↓
Find merchant
  ↓
Validate request
  ↓
Validate amount/currency/network
  ↓
Generate payment ID
  ↓
Create payment
  ↓
Create payment intent
  ↓
Generate privacy-payment information
  ↓
Return checkout URL
```

Response:

```
{
  "paymentId":"pay_abc123",
  "checkoutUrl":"https://pay.apepay.local/p/pay_abc123",
  "status":"pending",
  "expiresAt":"2026-08-22T20:00:00Z"
}
```

---

# 8. Transaction boundary

Creating a payment should be atomic.

Use:

```
DB transaction
```

Conceptually:

```
BEGIN

INSERT payment

INSERT payment_intent

INSERT payment_event
    payment.created

COMMIT
```

If anything fails:

```
ROLLBACK
```

You don't want:

```
payment exists
BUT
payment_intent doesn't exist
```

---

# 9. Payment service

The route itself should be extremely thin.

Bad:

```
app.post("/v1/payments",async (req,res) => {// 300 lines of logic
});
```

Instead:

```
Route
 ↓
CreatePaymentService
 ↓
PaymentRepository
 ↓
PaymentIntentService
 ↓
WebhookService
```

Conceptually:

```
constpayment=awaitpaymentService.createPayment({
  merchantId,
  amount,
  currency,
  orderId,
  webhookUrl,
  redirectUrl
});
```

---

# 10. Payment ID generation

Use something like:

```
pay_01K...
```

or:

```
pay_a8f91...
```

Don't expose PostgreSQL UUIDs as your public payment identifier.

Database:

```
id = UUID
```

Public:

```
paymentId = pay_xxxxx
```

This is good separation.

---

# 11. Checkout API

The customer checkout needs its own APIs.

These aren't merchant API endpoints.

For example:

```
GET /checkout/:paymentId
```

returns:

```
{
  "paymentId":"pay_abc123",
  "merchant": {
    "name":"Kush T-Shirt Store",
    "website":"https://kushstore.com"
  },
  "amount":"0.1",
  "currency":"ETH",
  "network":"anvil",
  "privacyProtocol":"zkBob",
  "status":"pending",
  "expiresAt":"..."
}
```

Notice:

**Do not return sensitive merchant information or internal DB fields.**

---

# 12. Customer payment flow

The checkout frontend:

```
GET /checkout/pay_abc123
        ↓
Display payment
        ↓
Connect MetaMask
        ↓
Customer clicks Pay Privately
        ↓
zkBob client
        ↓
Generate transaction/proof
        ↓
Submit to blockchain
```

The customer frontend should communicate with the zkBob client/service according to the actual zkBob architecture.

This is where we need to be careful not to pretend that a generic:

```
zkBob.send()
```

API exists until we've inspected the exact implementation you're using.

---

# 13. Very important: don't let customer frontend mark payment as paid

Never do this:

```
POST /payment/pay_abc123/paid
```

from the browser.

The customer browser can say:

```
"I submitted something."
```

It cannot be trusted to say:

```
"The merchant has been paid."
```

Instead:

```
Customer
   ↓
Blockchain
   ↓
Indexer
   ↓
Verification
   ↓
Database
   ↓
PAID
```

---

# 14. Blockchain indexer

This is one of the most important backend components.

```
workers/
└── blockchain-indexer.ts
```

It continuously checks Anvil.

Conceptually:

```
Anvil RPC
   ↓
New blocks
   ↓
zkBob contract events
   ↓
Decode events
   ↓
Find relevant privacy payment
   ↓
Verify
   ↓
Update payment
```

Don't make the API request wait for this.

---

# 15. Payment verification pipeline

I would make it:

```
Blockchain event detected
        ↓
Create blockchain transaction record
        ↓
Determine candidate payment
        ↓
Verify cryptographic conditions
        ↓
Verify amount
        ↓
Verify asset
        ↓
Verify network
        ↓
Verify payment hasn't expired
        ↓
Verify nullifier / uniqueness
        ↓
Mark payment PAID
        ↓
Create payment event
        ↓
Queue webhook
```

Only after all of that:

```
status = paid
```

---

# 16. Payment state machine

This should be enforced by the service layer.

```
pending
   │
   ▼
processing
   │
   ▼
paid
```

Failure:

```
pending
   ├──> expired
   └──> failed
```

Don't allow nonsense transitions like:

```
paid → pending
```

unless you explicitly support refunds/reversals.

---

# 17. `GET /v1/payments/:paymentId`

Merchant calls:

```
GET /v1/payments/pay_abc123
Authorization: Bearer ape_live_xxx
```

Response:

```
{
  "paymentId":"pay_abc123",
  "orderId":"ORDER-123",
  "amount":"0.1",
  "currency":"ETH",
  "status":"paid",
  "createdAt":"...",
  "paidAt":"..."
}
```

Notice what's missing:

```
customerWallet
zkBob private data
customer identity
```

---

# 18. Webhook architecture

Don't send the webhook directly inside:

```
payment → paid
```

transaction logic.

Instead:

```
Payment becomes PAID
        ↓
Create webhook_delivery
        ↓
Worker picks it up
        ↓
POST merchant webhook
        ↓
200 OK?
   │
 ┌─┴─────┐
Yes      No
 │        │
 ▼        ▼
success   retry
```

This prevents a merchant's broken webhook server from breaking payment processing.

---

# 19. Webhook retry

Something like:

```
attempt 1 → immediately
attempt 2 → 10 sec
attempt 3 → 30 sec
attempt 4 → 2 min
attempt 5 → 10 min
```

After max attempts:

```
delivery.status = failed
```

Merchant can manually retry later.

---

# 20. Webhook security

Every webhook should contain a signature.

For example:

```
X-ApePay-Signature: sha256=...
```

Merchant gets:

```
webhook secret
```

Then verifies:

```
HMAC-SHA256(
    rawBody,
    webhookSecret
)
```

This prevents someone from simply calling:

```
merchant.com/api/payment/webhook
```

and pretending that payment occurred.

---

# 21. Idempotency

This is another thing you should implement **from day one**.

Merchant might send:

```
POST /v1/payments
```

and then timeout.

They don't know whether ApePay created the payment.

They retry.

Without idempotency:

```
ORDER-123
   ↓
pay_abc
pay_def
```

Two payments.

Instead:

```
Idempotency-Key: order-123-attempt-1
```

ApePay remembers it.

Second request returns the original payment.

I would add an `idempotency_key` column to `payments`.

### So your current DB needs one small modification:

```
payments
    ...
    idempotency_key
```

with a unique constraint per merchant:

```
UNIQUE(merchant_id, idempotency_key)
```

This is worth doing now.

---

# 22. API rate limiting

At minimum:

```
POST /v1/payments
```

needs rate limiting.

For MVP:

```
100 requests/minute/API key
```

or similar.

Don't obsess over exact production numbers yet.

---

# 23. API key middleware

Request:

```
Authorization: Bearer ape_test_xxxxx
```

Middleware:

```
Extract key
    ↓
Determine prefix
    ↓
Hash supplied key
    ↓
Lookup hash
    ↓
Check revoked
    ↓
Check expiry
    ↓
Load merchant
    ↓
req.merchant = merchant
```

Then routes don't need to repeatedly implement authentication.

---

# 24. Important API security rule

Never put:

```
merchantId
```

in a merchant-controlled request body and trust it.

Bad:

```
{
  "merchantId":"merchant_xyz",
  "amount":"0.1"
}
```

The merchant is identified from:

```
Authorization header
```

Therefore:

```
API key
 ↓
merchant
 ↓
payment
```

not:

```
request body
 ↓
merchant
```

---

# 25. Merchant dashboard APIs

Separate these from the public merchant API.

For example:

```
/api/dashboard/merchant
/api/dashboard/payments
/api/dashboard/wallet
/api/dashboard/api-keys
/api/dashboard/webhooks
```

Authenticated through NextAuth.

The dashboard can show:

```
Total payments
Pending
Paid
Failed
Revenue
Recent payments
```

---

# 26. Internal service architecture

I'd structure the code approximately:

```
src/
│
├── server.ts
│
├── config/
│   ├── env.ts
│   └── constants.ts
│
├── db/
│   ├── client.ts
│   ├── schema/
│   └── relations.ts
│
├── modules/
│
│   ├── auth/
│   │   ├── auth.service.ts
│   │   └── auth.middleware.ts
│   │
│   ├── merchants/
│   │   ├── merchant.service.ts
│   │   └── merchant.repository.ts
│   │
│   ├── api-keys/
│   │   ├── api-key.service.ts
│   │   └── api-key.repository.ts
│   │
│   ├── payments/
│   │   ├── payment.service.ts
│   │   ├── payment.repository.ts
│   │   ├── payment.state.ts
│   │   └── payment.validation.ts
│   │
│   ├── payment-intents/
│   │   ├── intent.service.ts
│   │   └── intent.repository.ts
│   │
│   ├── webhooks/
│   │   ├── webhook.service.ts
│   │   ├── webhook.worker.ts
│   │   └── webhook-signature.ts
│   │
│   ├── blockchain/
│   │   ├── blockchain.service.ts
│   │   ├── indexer.ts
│   │   └── verifier.ts
│   │
│   └── zkbob/
│       ├── zkbob.service.ts
│       ├── zkbob.client.ts
│       └── zkbob.verifier.ts
│
├── routes/
│   ├── v1/
│   │   ├── payments.ts
│   │   ├── merchant.ts
│   │   └── webhooks.ts
│   │
│   └── checkout/
│       └── checkout.ts
│
├── workers/
│   ├── blockchain.worker.ts
│   └── webhook.worker.ts
│
└── lib/
    ├── logger.ts
    ├── errors.ts
    └── crypto.ts
```

---

# 27. Request flow: create payment

The complete backend flow:

```
Merchant Backend
       │
       │ POST /v1/payments
       ▼
┌─────────────────┐
│ API Key         │
│ Middleware      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Validation      │
│ Zod             │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Payment Service │
└────────┬────────┘
         │
         ├───────────────┐
         ▼               ▼
   Create Payment   Create Intent
         │               │
         └───────┬───────┘
                 ▼
            PostgreSQL
                 │
                 ▼
          payment.created
                 │
                 ▼
             Response
```

---

# 28. Request flow: customer payment

```
Customer
   │
   ▼
ApePay Checkout
   │
   ▼
GET payment
   │
   ▼
Connect MetaMask
   │
   ▼
Generate zkBob payment
   │
   ▼
Submit transaction
   │
   ▼
Anvil
   │
   ▼
Blockchain Indexer
   │
   ▼
zkBob Verification
   │
   ▼
Payment Service
   │
   ├── payment.status = paid
   │
   ├── payment_event
   │
   └── webhook_delivery
               │
               ▼
          Merchant Backend
```

---

# 29. The most important architectural boundary

I'd make this explicit in your code:

```
Payment Service
       │
       │ "verify this payment"
       ▼
Privacy Protocol Adapter
       │
       ▼
zkBob
```

Don't scatter zkBob-specific logic throughout the application.

Create an interface:

```
interfacePrivacyPaymentProtocol {
  createPaymentIntent(...):Promise<...>;

  detectPayment(...):Promise<...>;

  verifyPayment(...):Promise<...>;

  getPaymentStatus(...):Promise<...>;
}
```

Then:

```
PrivacyPaymentProtocol
        │
        ▼
    ZkBobAdapter
```

This is much cleaner.

---

# 30. But don't over-engineer it

I **wouldn't** build:

```
Kafka
Redis cluster
Kubernetes
microservices
event sourcing
CQRS
GraphQL
```

for this project.

Your first working system should be:

```
Next.js
   +
Fastify
   +
PostgreSQL
   +
Drizzle
   +
viem
   +
Anvil
   +
zkBob
```

with two background workers:

```
Blockchain Worker
Webhook Worker
```

That's enough.

---

# 31. One DB change I'd make right now

You already created the nine tables.

Before we start coding the backend, add:

```
payments.idempotency_key
```

and a unique constraint:

```
UNIQUE(merchant_id, idempotency_key)
```

Potentially also add:

```
payments.metadata JSONB
```

for merchant-specific information.

For example:

```
{
  "customerReference":"abc",
  "productId":"TSHIRT-001"
}
```

But **don't put sensitive customer identity/wallet information there**.

---

# 32. What I would build first

Don't start with zkBob.

Build the backend in this order:

### Phase 1 — API foundation

```
Fastify
PostgreSQL
Drizzle
Zod
API key authentication
Error handling
Logging
```

### Phase 2 — Merchant

```
Create merchant
API keys
Merchant wallet
Dashboard APIs
```

### Phase 3 — Payments

```
POST /v1/payments
GET /v1/payments/:id
Payment state machine
Idempotency
Payment events
```

### Phase 4 — Checkout

```
GET payment
Checkout session
MetaMask connection
```

### Phase 5 — zkBob

```
zkBob client
Payment intent
Private payment
Payment binding
Proof generation
```

### Phase 6 — Blockchain

```
Anvil
Indexer
Event detection
Verification
Payment confirmation
```

### Phase 7 — Webhooks

```
Webhook delivery
HMAC signatures
Retries
Idempotency
```

### Phase 8 — SDK

```
@apepay/sdk
```