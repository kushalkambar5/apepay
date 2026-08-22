import { createPublicClient, http, PublicClient } from 'viem';
import { foundry } from 'viem/chains';
import { env } from '../../config/env';
import { logger } from '../../lib/logger';

export class BlockchainService {
  private client: PublicClient;

  constructor() {
    this.client = createPublicClient({
      chain: foundry,
      transport: http(env.ANVIL_RPC_URL),
    });
  }

  public getClient(): PublicClient {
    return this.client;
  }

  async getLatestBlockNumber(): Promise<bigint> {
    try {
      return await this.client.getBlockNumber();
    } catch (err) {
      logger.warn({ err }, 'Failed to fetch latest block from Anvil RPC');
      return 0n;
    }
  }

  async getTransaction(hash: `0x${string}`) {
    try {
      return await this.client.getTransaction({ hash });
    } catch (err) {
      logger.error({ err, hash }, 'Failed to fetch transaction');
      return null;
    }
  }

  async getTransactionReceipt(hash: `0x${string}`) {
    try {
      return await this.client.getTransactionReceipt({ hash });
    } catch (err) {
      logger.error({ err, hash }, 'Failed to fetch transaction receipt');
      return null;
    }
  }
}

export const blockchainService = new BlockchainService();
