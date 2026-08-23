import { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';

export interface WalletNode extends SimulationNodeDatum {
  id: string; // Wallet address 0x...
  balance: number; // Token balance
  percentage: number; // % of total supply
  clusterId: number | null; // Cluster index if part of a connected network
  rank: number; // Holder rank (1 = largest whale)
  label?: string; // e.g. "Deployer", "CEX Hot Wallet", "Dev Pool"
  isContract?: boolean;
  isExchange?: boolean;
  color?: string; // Custom node border color
  // Position properties from d3-force
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  radius?: number;
}

export interface TransferLink extends SimulationLinkDatum<WalletNode> {
  id: string;
  source: string | WalletNode;
  target: string | WalletNode;
  amount: number;
  txHash: string;
  timestamp: string;
  transferCount: number;
}

export interface WalletCluster {
  id: number;
  name: string;
  color: string; // Hex color code e.g. #f97316
  glowColor: string; // RGBA glow
  walletCount: number;
  totalBalance: number;
  totalPercentage: number;
  wallets: string[]; // List of wallet IDs in this cluster
}

export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  totalSupply: number;
  priceUsd: number;
  holdersCount: number;
  centralizationScore: number; // 0 - 100 risk score
  top10Percentage: number;
}

export interface FilterState {
  searchKeyword: string;
  minBalance: number;
  selectedClusterId: number | null;
  hideUnclustered: boolean;
  highlightedWalletId: string | null;
}
