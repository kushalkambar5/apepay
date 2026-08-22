import { eq, and } from 'drizzle-orm';
import { db, merchants, merchantWallets } from '../../db';
import { NotFoundError } from '../../lib/errors';

export class MerchantService {
  async getMerchantProfile(merchantId: string) {
    const [merchant] = await db
      .select()
      .from(merchants)
      .where(eq(merchants.id, merchantId))
      .limit(1);

    if (!merchant) {
      throw new NotFoundError('Merchant not found.');
    }

    const wallets = await db
      .select()
      .from(merchantWallets)
      .where(eq(merchantWallets.merchantId, merchantId));

    return {
      ...merchant,
      wallets,
    };
  }

  async updateMerchantProfile(merchantId: string, data: { businessName?: string; website?: string }) {
    const [updated] = await db
      .update(merchants)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(merchants.id, merchantId))
      .returning();

    return updated;
  }

  async addWallet(merchantId: string, data: { address: string; network: string; walletType?: 'payout' | 'authentication' }) {
    const [wallet] = await db
      .insert(merchantWallets)
      .values({
        merchantId,
        address: data.address,
        network: data.network || 'anvil',
        walletType: data.walletType || 'payout',
        isActive: true,
      })
      .returning();

    return wallet;
  }

  async getWallets(merchantId: string) {
    return db
      .select()
      .from(merchantWallets)
      .where(eq(merchantWallets.merchantId, merchantId));
  }
}

export const merchantService = new MerchantService();
