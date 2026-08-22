export const ANVIL_CHAIN_ID = parseInt(
  process.env.NEXT_PUBLIC_CHAIN_ID || '31337',
  10
);
export const ANVIL_HEX_CHAIN_ID = `0x${ANVIL_CHAIN_ID.toString(16)}`;
export const ANVIL_RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545';

export const ANVIL_NETWORK_CONFIG = {
  chainId: ANVIL_HEX_CHAIN_ID,
  chainName: 'Anvil Localhost',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [ANVIL_RPC_URL],
};
