export interface ZkBobPaymentRequest {
  paymentId: string;
  amount: string;
  currency: string;
  recipientIdentifier: string;
  commitment: string;
  senderAddress: string;
}

export interface ZkBobProofResult {
  proof: Record<string, unknown>;
  commitment: string;
  nullifier: string;
  txHash?: string;
  publicInputs: string[];
}

export interface ZkBobPaymentResult {
  success: boolean;
  txHash: string;
  nullifier: string;
  proof: Record<string, unknown>;
  paymentId: string;
}
