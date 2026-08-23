import { eq, and } from 'drizzle-orm';
import { getAddress, isAddress } from 'viem';
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
      wallets: wallets.map((w) => ({
        ...w,
        address: w.address && isAddress(w.address) ? getAddress(w.address) : w.address,
      })),
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
    const formattedAddress = data.address && isAddress(data.address) ? getAddress(data.address) : data.address;
    const [wallet] = await db
      .insert(merchantWallets)
      .values({
        merchantId,
        address: formattedAddress,
        network: data.network || 'anvil',
        walletType: data.walletType || 'payout',
        isActive: true,
      })
      .returning();

    return wallet;
  }

  async getWallets(merchantId: string) {
    const wallets = await db
      .select()
      .from(merchantWallets)
      .where(eq(merchantWallets.merchantId, merchantId));

    return wallets.map((w) => ({
      ...w,
      address: w.address && isAddress(w.address) ? getAddress(w.address) : w.address,
    }));
  }
}

export const merchantService = new MerchantService();
