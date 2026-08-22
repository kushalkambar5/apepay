export type PaymentStatus =
  | 'created'
  | 'pending'
  | 'processing'
  | 'paid'
  | 'expired'
  | 'failed'
  | 'cancelled';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Merchant {
  id: string;
  userId?: string;
  businessName: string;
  website?: string | null;
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface MerchantWallet {
  id: string;
  merchantId: string;
  network: string;
  address: string;
  walletType: 'payout' | 'authentication';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKey {
  id: string;
  merchantId: string;
  name: string;
  keyPrefix: string;
  keyHash?: string;
  key?: string; // Only present upon creation
  environment: 'test' | 'live';
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
}

export interface PaymentIntent {
  protocol: string;
  protocolVersion: string;
  asset: string;
  network: string;
  expectedAmount: string;
  paymentIdentifier: string;
  commitment: string;
  recipientIdentifier: string;
  expiresAt?: string;
}

export interface Payment {
  id: string;
  paymentId: string;
  merchantId: string;
  orderId?: string | null;
  amount: string;
  currency: string;
  network: string;
  status: PaymentStatus;
  checkoutUrl: string;
  redirectUrl?: string | null;
  webhookUrl?: string | null;
  expiresAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  intent?: PaymentIntent;
  events?: PaymentEvent[];
}

export interface PaymentEvent {
  id: string;
  paymentId: string;
  eventType: string;
  oldStatus?: string | null;
  newStatus?: string | null;
  source: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface WebhookEndpoint {
  id: string;
  merchantId?: string;
  url: string;
  secret?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface WebhookDelivery {
  id: string;
  webhookEndpointId: string;
  paymentId: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'delivered' | 'failed';
  attemptCount: number;
  lastResponseCode?: number | null;
  lastError?: string | null;
  createdAt: string;
  deliveredAt?: string | null;
}

export interface CheckoutSession {
  paymentId: string;
  merchant: {
    name: string;
    website?: string | null;
  };
  amount: string;
  currency: string;
  network: string;
  status: PaymentStatus;
  redirectUrl?: string | null;
  expiresAt?: string | null;
  paidAt?: string | null;
  intent?: PaymentIntent;
}

export type CheckoutState =
  | 'idle'
  | 'connecting_wallet'
  | 'wallet_connected'
  | 'preparing_payment'
  | 'awaiting_wallet'
  | 'submitting'
  | 'submitted'
  | 'verifying'
  | 'success'
  | 'failed'
  | 'expired'
  | 'wrong_network'
  | 'insufficient_balance';
