import { createPublicClient, http } from 'viem';
import { foundry } from 'viem/chains';
import { env } from '../../config/env';
import { logger } from '../../lib/logger';
export class BlockchainService {
    client;
    constructor() {
        this.client = createPublicClient({
            chain: foundry,
            transport: http(env.ANVIL_RPC_URL),
        });
    }
    getClient() {
        return this.client;
    }
    async getLatestBlockNumber() {
        try {
            return await this.client.getBlockNumber();
        }
        catch (err) {
            logger.warn({ err }, 'Failed to fetch latest block from Anvil RPC');
            return 0n;
        }
    }
    async getTransaction(hash) {
        try {
            return await this.client.getTransaction({ hash });
        }
        catch (err) {
            logger.error({ err, hash }, 'Failed to fetch transaction');
            return null;
        }
    }
    async getTransactionReceipt(hash) {
        try {
            return await this.client.getTransactionReceipt({ hash });
        }
        catch (err) {
            logger.error({ err, hash }, 'Failed to fetch transaction receipt');
            return null;
        }
    }
}
export const blockchainService = new BlockchainService();
