# ApeGear Store — ApePay Demo Merchant E-Commerce Website

This is a demonstration e-commerce storefront for **ApePay** — a privacy-preserving EVM crypto payment gateway powered by zero-knowledge commitment protocols (zkBob).

Built with **Next.js 16 (App Router)**, **Tailwind CSS v4**, **TypeScript**, and styled strictly in accordance with `frontend/DESIGN.md` (Vercel-inspired stark developer design language).

---

## 🌟 Features

- **Privacy-Preserving Crypto Payments**: Integrates directly with ApePay REST API (`POST /v1/payments`) and hosted customer checkout pages (`/p/[paymentId]`).
- **Design System Adherence (`frontend/DESIGN.md`)**:
  - Stark black-and-ink duet (`#171717`) on near-white canvas (`#fafafa`).
  - Sentence-case typography with negative letter tracking (`-2.4px` display).
  - Monospaced technical labels for SKUs, prices, order IDs, and payment hashes (`Geist Mono`).
  - 100px pill buttons (`rounded-full`) and subtle stacked card elevation with hairline borders (`#ebebeb`).
  - Signature multi-color mesh gradient hero banner.
- **Product Catalog & Cart**:
  - Hardware keycards, ZK signers, cypherpunk apparel, and digital passes.
  - Live search, category filtering, product quick view.
  - Slide-over cart drawer with quantity adjustments and ETH/USD price calculations.
- **Live Webhook Receiver & Inspector**:
  - Endpoint at `/api/webhooks/apepay` receiving signed HTTP POST webhook events.
  - In-app Webhook Log Inspector to view event payloads and SHA-256 HMAC signatures in real-time.
- **Developer Settings Modal**:
  - Customize Merchant API Key (`x-api-key`), Backend REST API URL (`http://localhost:4000`), and Checkout UI URL (`http://localhost:3000`) dynamically.

---

## 🚀 How to Run Locally

### 1. Install Dependencies

```bash
cd demo_merchant_website
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

*The store will launch at [http://localhost:3001](http://localhost:3001).*

---

## ⚡ Integration with ApePay Gateway

1. **Start ApePay Backend**:
   ```bash
   cd ../backend
   npm run dev
   # Listens at http://localhost:4000
   ```

2. **Start ApePay Hosted Checkout UI**:
   ```bash
   cd ../frontend
   npm run dev
   # Listens at http://localhost:3000
   ```

3. **Perform a Test Purchase**:
   - Open `http://localhost:3001`.
   - Add items to your cart and click **Checkout with ApePay**.
   - You will be seamlessly redirected to ApePay's hosted checkout page (`http://localhost:3000/p/[paymentId]`).
   - Complete the test payment. Upon completion, you will be redirected back to the store's `/order-success` page!
