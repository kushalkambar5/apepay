import { WalletAccount, WalletStatus } from './types';
import { ANVIL_CHAIN_ID, ANVIL_HEX_CHAIN_ID, ANVIL_NETWORK_CONFIG } from './network';

export interface EIP1193Provider {
  request: (args: { method: string; params?: Array<unknown> }) => Promise<unknown>;
  on?: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener?: (eventName: string, handler: (...args: any[]) => void) => void;
}

export function getEthereumProvider(): EIP1193Provider | null {
  if (typeof window === 'undefined') return null;
  const ethereum = (window as unknown as { ethereum?: EIP1193Provider }).ethereum;
  return ethereum || null;
}

export async function connectWallet(): Promise<WalletAccount> {
  const provider = getEthereumProvider();
  if (!provider) {
    throw new Error('MetaMask is not installed. Please install MetaMask to proceed.');
  }

  const accounts = (await provider.request({
    method: 'eth_requestAccounts',
  })) as string[];

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts selected in MetaMask.');
  }

  const address = accounts[0];
  const chainIdHex = (await provider.request({ method: 'eth_chainId' })) as string;
  const chainId = parseInt(chainIdHex, 16);

  const balanceHex = (await provider.request({
    method: 'eth_getBalance',
    params: [address, 'latest'],
  })) as string;

  const balanceWei = BigInt(balanceHex || '0');
  const balanceEth = (Number(balanceWei) / 1e18).toFixed(4);

  const isCorrectNetwork = chainId === ANVIL_CHAIN_ID;
  const status: WalletStatus = isCorrectNetwork ? 'READY' : 'WRONG_NETWORK';

  return {
    address,
    chainId,
    balanceEth,
    status,
  };
}

export async function switchOrAddNetwork(): Promise<boolean> {
  const provider = getEthereumProvider();
  if (!provider) return false;

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ANVIL_HEX_CHAIN_ID }],
    });
    return true;
  } catch (switchError: any) {
    // 4902 code means chain has not been added to MetaMask
    if (switchError?.code === 4902) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [ANVIL_NETWORK_CONFIG],
        });
        return true;
      } catch (addError) {
        throw new Error('Failed to add Anvil network to MetaMask.');
      }
    }
    throw new Error('Failed to switch to Anvil network in MetaMask.');
  }
}

export async function sendTransaction(params: {
  from: string;
  to: string;
  valueEth: string;
  data?: string;
}): Promise<string> {
  const provider = getEthereumProvider();
  if (!provider) {
    throw new Error('MetaMask provider unavailable');
  }

  // Convert ETH amount to hex Wei
  const valueWei = BigInt(Math.floor(parseFloat(params.valueEth) * 1e18));
  const valueHex = `0x${valueWei.toString(16)}`;

  const txHash = (await provider.request({
    method: 'eth_sendTransaction',
    params: [
      {
        from: params.from,
        to: params.to,
        value: valueHex,
        data: params.data || '0x',
      },
    ],
  })) as string;

  return txHash;
}
