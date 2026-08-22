# ApePay - Privacy-Preserving Crypto Payment Gateway

**ApePay** is an EVM (Ethereum) crypto payment gateway built for merchants to accept crypto payments (ETH / ERC-20) with privacy guarantees powered by zero-knowledge commitments (zkBob protocol integration).

---

## 🌟 Key Features

- **Privacy-Preserving Transactions**: Integrates zero-knowledge commitment protocols (zkBob) to break linkability between customer paying addresses and merchant payout wallets.
- **Merchant API & Idempotency**: Full RESTful API with API Key authentication (`x-api-key`), environment scoping (`test`/`live`), and strict idempotency handling via `Idempotency-Key` headers.
- **Hosted Customer Checkout**: Dynamic, responsive checkout session pages (`/p/[paymentId]`) with expiry timers, status indicators (Pending, Processing, Paid, Expired), and transaction submission integration.
- **Real-Time Blockchain Indexer**: Background indexer polling local EVM nodes (Anvil) or testnets/mainnet RPCs to automatically monitor and confirm on-chain payments.
- **Webhook Delivery Engine**: Asynchronous webhook queue worker with HMAC SHA-256 payload signing, response logging, and exponential backoff retries.
- **Merchant Dashboard**: Built with Next.js 16 (App Router), Tailwind CSS v4, and Lucide React icons for managing payments, API keys, webhook endpoints, and wallet settings.

---

## 📂 Project Architecture & Folder Structure

```
apepay/
├── backend/                  # Fastify TypeScript REST API server & background workers
│   ├── .env                  # Backend environment configuration
│   ├── .env.example          # Backend environment template
│   ├── src/
│   │   ├── config/           # Environment variable validation via Zod
│   │   ├── db/               # Drizzle ORM schema & PostgreSQL connection client
│   │   ├── lib/              # Crypto utilities (HMAC signatures, key hashing), logger, errors
│   │   ├── middleware/       # Authentication (API key & JWT) & error handling middleware
│   │   ├── modules/          # Core Domain Services
│   │   │   ├── api-keys/     # API Key generation, verification & hashing
│   │   │   ├── auth/         # Dashboard authentication service
│   │   │   ├── blockchain/   # Viem EVM RPC blockchain client & verification service
│   │   │   ├── merchants/    # Merchant profile & wallet management
│   │   │   ├── payments/     # Payment intent creation & status lifecycle engine
│   │   │   ├── webhooks/     # Webhook endpoint registration & delivery worker logic
│   │   │   └── zkbob/        # zkBob privacy protocol adapter & commitment generator
│   │   ├── routes/           # Fastify HTTP Route Handlers
│   │   │   ├── checkout/     # Public customer checkout session API (/checkout/:paymentId)
│   │   │   ├── dashboard/    # Merchant dashboard API routes (/dashboard/*)
│   │   │   └── v1/           # Merchant Public v1 REST API (/v1/payments, /v1/merchant)
│   │   ├── workers/          # Background Workers
│   │   │   ├── indexer.worker.ts # Blockchain block scanner & payment confirmation monitor
│   │   │   └── webhook.worker.ts # Webhook event queue retry worker
│   │   └── server.ts         # Fastify app entry point & background worker initializer
│   ├── drizzle.config.ts     # Drizzle Kit database configuration
│   └── package.json          # Backend dependencies & npm scripts
│
├── contracts/                # Foundry Smart Contracts & Local Testnet Scripts
│   ├── .env                  # Contracts deployment environment configuration
│   ├── .env.example          # Contracts environment template
│   ├── script/               # Foundry deployment scripts (DeployLocal.s.sol)
│   ├── test/                 # Smart contract test suite
│   ├── foundry.toml          # Foundry setup & compiler settings
│   └── remappings.txt        # Solidity import remappings
│
├── frontend/                 # Next.js 16 App Router Merchant Dashboard & Checkout UI
│   ├── .env                  # Frontend environment configuration
│   ├── .env.example          # Frontend environment template
│   ├── app/                  # Next.js App Router Structure
│   │   ├── (auth)/           # Merchant Auth (Login, Register, Forgot Password)
│   │   ├── (marketing)/      # Landing page, API docs, Pricing pages
│   │   ├── dashboard/        # Merchant Dashboard (Overview, Payments, API Keys, Webhooks, Wallet)
│   │   ├── p/[paymentId]/    # Customer Hosted Checkout Page
│   │   └── layout.tsx        # Global Layout & Providers
│   ├── components/           # UI Components (Checkout progress, status state cards, modals)
│   └── package.json          # Frontend dependencies & npm scripts
│
└── README.md                 # Master Project Documentation
```

---

## ⚙️ Environment Configuration (.env files)

### 1. `backend/.env`
```env
PORT=4000
HOST=0.0.0.0
DATABASE_URL=postgres://postgres:postgres@localhost:5432/apepay
BACKEND_URI=http://localhost:4000
FRONTEND_URI=http://localhost:3000
ANVIL_RPC_URL=http://127.0.0.1:8545
JWT_SECRET=apepay_super_secret_jwt_key_2026
NODE_ENV=development
```

### 2. `frontend/.env`
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAIN_ID=31337
NEXTAUTH_SECRET=apepay_frontend_secret_key_2026
NEXTAUTH_URL=http://localhost:3000
```

### 3. `contracts/.env`
```env
ETH_RPC_URL=http://127.0.0.1:8545
ANVIL_RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CHAIN_ID=31337
ETHERSCAN_API_KEY=
```

---

## ⚡ How the Payment Gateway Works

ApePay bridges off-chain merchant workflows with on-chain privacy protection:

```
[ Merchant App / Store ]
       │
  1. POST /v1/payments (API Key)
       ▼
 [ ApePay Backend API ] ──── 2. Generate zkBob Commitment ───► [ Payment Intent DB ]
       │
  3. Returns paymentId & checkoutUrl
       ▼
 [ Customer Checkout UI ] (/p/:paymentId)
       │
  4. Customer pays ETH / ERC20 to zkBob Pool
       ▼
 [ Anvil / EVM Blockchain ]
       │
  5. Polling Block Data via Viem
       ▼
 [ Blockchain Indexer Worker ] ─── 6. Confirm Payment & Event ──► [ DB Payment Status: 'paid' ]
       │
  7. Enqueue Event
       ▼
 [ Webhook Delivery Worker ] ─── 8. HMAC Signed Webhook POST ──► [ Merchant Webhook Endpoint ]
```

### Payment Lifecycle Details:

1. **Payment Creation**: Merchant creates a payment request via `POST /v1/payments` specifying amount, currency, and optional metadata/idempotency key using their `x-api-key`.
2. **Privacy Intent Generation**: `zkbobService` produces a privacy payment intent, assigning a unique SHA-256 commitment note (`zkbob_note_<paymentId>_<nonce>`) linked to the zkBob pool recipient identifier.
3. **Hosted Checkout Session**: Customer opens `/p/:paymentId` on the frontend. The checkout page fetches session details via public `GET /checkout/:paymentId` and displays payment amounts and commitment information.
4. **Transaction Submission & Verification**: When the customer submits the transaction, the background `runBlockchainIndexer` scanner continuously queries the EVM network via Viem.
5. **Confirmation & Event Logging**: Once confirmed, `paymentService.markAsPaid()` updates payment status to `paid`, creates a `payment.paid` event record, and triggers the webhook pipeline.
6. **Webhook Notification**: `runWebhookWorker` delivers an HMAC SHA-256 signed JSON payload (`sha256=...`) to the merchant's registered webhook URL with exponential retry logic on failure.

---

## 📋 System Requirements

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Package Manager**: `npm` (v9+) or `pnpm` / `bun` / `yarn`
- **Database**: PostgreSQL (v14+) running locally or via Docker
- **Blockchain Toolchain**: [Foundry](https://getfoundry.sh/) (`anvil`, `forge`, `cast`) installed locally
- **Tunneling (Optional for local testing)**: `ngrok` or `cloudflared` to expose the backend server (`http://localhost:4000`) for receiving remote webhook calls.

---

## 🚀 How to Run Locally

### 1. Environment Setup

#### Database Setup
Ensure PostgreSQL is running and create the `apepay` database:
```bash
createdb apepay
# Or via psql: CREATE DATABASE apepay;
```

---

### 2. Local Blockchain Setup (Anvil)

In a separate terminal, launch Anvil local EVM node:
```bash
anvil
```
*Anvil will start listening on `http://127.0.0.1:8545` with 10 pre-funded accounts.*

Deploy local contract scripts (Optional):
```bash
cd contracts
forge script script/DeployLocal.s.sol:DeployLocal --rpc-url http://127.0.0.1:8545
```

---

### 3. Backend Setup & Run

1. Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

2. Push Drizzle schema to PostgreSQL:
```bash
npm run db:push
```

3. Run backend unit & integration test suite:
```bash
npm test
```

4. Start backend server in development mode (launches Fastify server & background workers):
```bash
npm run dev
```
*Backend API will run at `http://localhost:4000`*

---

### 4. Frontend Setup & Run

1. Navigate to frontend directory and install dependencies:
```bash
cd frontend
npm install
```

2. Start Next.js development server:
```bash
npm run dev
```
*Frontend will run at `http://localhost:3000`*

---

### 5. Exposing Backend for Webhooks (Optional Demo Setup)

If testing merchant webhook delivery locally using `ngrok`:
```bash
ngrok http 4000
```
Update `BACKEND_URI` in `backend/.env` with your public ngrok URL.

---

## 🛠 Tech Stack Overview

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React, NextAuth.js
- **Backend Framework**: Fastify v5, TypeScript, Pino (Logging), Zod (Validation), Viem (Ethereum RPC)
- **Database & ORM**: PostgreSQL, Drizzle ORM, Drizzle Kit
- **Smart Contracts**: Solidity ^0.8.15, Foundry Toolchain (Forge, Anvil, Cast)
- **Privacy Layer**: zkBob commitment note generation adapter (`PrivacyPaymentProtocol`)
- **Testing**: Vitest
