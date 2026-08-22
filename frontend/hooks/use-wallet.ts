'use client';

import { useState, useEffect, useCallback } from 'react';
import { WalletAccount, WalletStatus } from '@/lib/wallet/types';
import {
  connectWallet,
  switchOrAddNetwork,
  getEthereumProvider,
} from '@/lib/wallet/provider';
import { ANVIL_CHAIN_ID } from '@/lib/wallet/network';

export function useWallet() {
  const [account, setAccount] = useState<WalletAccount>({
    address: '',
    chainId: 0,
    balanceEth: '0',
    status: 'DISCONNECTED',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshWalletState = useCallback(async () => {
    const provider = getEthereumProvider();
    if (!provider) return;

    try {
      const acc = await connectWallet();
      setAccount(acc);
      setError(null);
    } catch (err: any) {
      // If not connected yet, keep status DISCONNECTED silently
    }
  }, []);

  const connect = async () => {
    setLoading(true);
    setError(null);
    try {
      setAccount((prev) => ({ ...prev, status: 'CONNECTING' }));
      const acc = await connectWallet();
      setAccount(acc);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect MetaMask');
      setAccount((prev) => ({ ...prev, status: 'DISCONNECTED' }));
    } finally {
      setLoading(false);
    }
  };

  const switchNetwork = async () => {
    setLoading(true);
    setError(null);
    try {
      await switchOrAddNetwork();
      await refreshWalletState();
    } catch (err: any) {
      setError(err?.message || 'Failed to switch network');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const provider = getEthereumProvider();
    if (!provider || !provider.on) return;

    const handleAccountsChanged = (accounts: any) => {
      if (!accounts || accounts.length === 0) {
        setAccount({
          address: '',
          chainId: 0,
          balanceEth: '0',
          status: 'DISCONNECTED',
        });
      } else {
        refreshWalletState();
      }
    };

    const handleChainChanged = () => {
      refreshWalletState();
    };

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);

    return () => {
      if (provider.removeListener) {
        provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [refreshWalletState]);

  return {
    account,
    loading,
    error,
    connect,
    switchNetwork,
    refreshWalletState,
    isReady: account.status === 'READY',
    isWrongNetwork: account.status === 'WRONG_NETWORK',
  };
}
