export type WalletStatus =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'WRONG_NETWORK'
  | 'READY';

export interface WalletAccount {
  address: string;
  chainId: number;
  balanceEth: string;
  status: WalletStatus;
}
