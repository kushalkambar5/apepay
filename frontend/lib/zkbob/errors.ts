export class ZkBobError extends Error {
  code: string;

  constructor(message: string, code = 'ZBOB_ERROR') {
    super(message);
    this.name = 'ZkBobError';
    this.code = code;
  }
}

export class ProofGenerationError extends ZkBobError {
  constructor(message = 'Failed to generate cryptographic zero-knowledge proof') {
    super(message, 'PROOF_GENERATION_FAILED');
  }
}

export class PaymentVerificationError extends ZkBobError {
  constructor(message = 'Payment verification failed on-chain') {
    super(message, 'VERIFICATION_FAILED');
  }
}
