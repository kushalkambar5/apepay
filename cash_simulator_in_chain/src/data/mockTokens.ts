import { TokenInfo, WalletNode, TransferLink } from '../types/bubble';

export interface TokenDataset {
  token: TokenInfo;
  nodes: WalletNode[];
  links: TransferLink[];
}

// Utility generator for realistic mock datasets
function generateWalletAddress(index: number): string {
  const hex = (index + 0x123456789a).toString(16).padStart(40, '0');
  return `0x${hex.substring(0, 4)}...${hex.substring(36)}`;
}

// Full mock dataset generator
function createMockDataset(
  symbol: string,
  name: string,
  totalSupply: number,
  priceUsd: number,
  nodeCount = 90
): TokenDataset {
  const nodes: WalletNode[] = [];
  const links: TransferLink[] = [];

  let remainingSupply = totalSupply;

  // Key special wallets
  const deployerAddr = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
  const cexHotWallet = '0x28C6c06298d514Db089934071355E5743bf21d60';
  const uniswapPool = '0x11b815ef18d5a3749a2a356073809623e59a43a8';

  // 1. Deployer / Dev Wallet (Whale)
  const deployerSupply = totalSupply * 0.14;
  nodes.push({
    id: deployerAddr,
    balance: deployerSupply,
    percentage: 14.0,
    clusterId: null,
    rank: 1,
    label: 'Deployer Wallet',
    isContract: false,
  });

  // 2. CEX Binance Hot Wallet
  const cexSupply = totalSupply * 0.11;
  nodes.push({
    id: cexHotWallet,
    balance: cexSupply,
    percentage: 11.0,
    clusterId: null,
    rank: 2,
    label: 'Binance Hot Wallet 1',
    isExchange: true,
  });

  // 3. Uniswap V3 Pool
  const poolSupply = totalSupply * 0.085;
  nodes.push({
    id: uniswapPool,
    balance: poolSupply,
    percentage: 8.5,
    clusterId: null,
    rank: 3,
    label: 'Uniswap V3 Pair Pool',
    isContract: true,
  });

  remainingSupply -= (deployerSupply + cexSupply + poolSupply);

  // Generate remaining whale & retail holders
  for (let i = 4; i <= nodeCount; i++) {
    const isWhale = i <= 20;
    const isMidHolder = i > 20 && i <= 50;

    let pct: number;
    if (isWhale) {
      pct = Math.max(0.5, (20 - i) * 0.35 + Math.random() * 0.4);
    } else if (isMidHolder) {
      pct = Math.max(0.1, (50 - i) * 0.04 + Math.random() * 0.08);
    } else {
      pct = Math.max(0.01, (nodeCount - i) * 0.005 + Math.random() * 0.02);
    }

    const bal = (pct / 100) * totalSupply;
    const addr = generateWalletAddress(i);

    nodes.push({
      id: addr,
      balance: bal,
      percentage: parseFloat(pct.toFixed(2)),
      clusterId: null,
      rank: i,
      label: isWhale ? `Whale #${i}` : undefined
    });
  }

  // --- CONNECTED CLUSTER LINKS (To mimic Bubblemaps connected entities) ---

  // Cluster 1 (Orange Cluster - Insider/Early Whales network around Deployer)
  const cluster1Wallets = [deployerAddr, nodes[4].id, nodes[5].id, nodes[6].id, nodes[7].id, nodes[8].id];
  links.push(
    { id: 'link-1-1', source: deployerAddr, target: nodes[4].id, amount: 2000000, txHash: '0xa1b2...c3d4', timestamp: '2 days ago', transferCount: 3 },
    { id: 'link-1-2', source: nodes[4].id, target: nodes[5].id, amount: 1500000, txHash: '0xb2c3...d4e5', timestamp: '1 day ago', transferCount: 2 },
    { id: 'link-1-3', source: nodes[5].id, target: nodes[6].id, amount: 800000, txHash: '0xc3d4...e5f6', timestamp: '5 hours ago', transferCount: 1 },
    { id: 'link-1-4', source: deployerAddr, target: nodes[7].id, amount: 3100000, txHash: '0xd4e5...f6a7', timestamp: '3 days ago', transferCount: 4 },
    { id: 'link-1-5', source: nodes[7].id, target: nodes[8].id, amount: 1200000, txHash: '0xe5f6...a7b8', timestamp: '12 hours ago', transferCount: 2 },
    { id: 'link-1-6', source: nodes[6].id, target: nodes[8].id, amount: 500000, txHash: '0xf6a7...b8c9', timestamp: '1 hour ago', transferCount: 1 }
  );

  // Cluster 2 (Cyan Cluster - Multi-Sig Treasury & Sub-wallets)
  const cluster2Wallets = [nodes[9].id, nodes[10].id, nodes[11].id, nodes[12].id];
  links.push(
    { id: 'link-2-1', source: nodes[9].id, target: nodes[10].id, amount: 4500000, txHash: '0x1111...2222', timestamp: '4 days ago', transferCount: 5 },
    { id: 'link-2-2', source: nodes[10].id, target: nodes[11].id, amount: 2100000, txHash: '0x3333...4444', timestamp: '2 days ago', transferCount: 2 },
    { id: 'link-2-3', source: nodes[9].id, target: nodes[12].id, amount: 1800000, txHash: '0x5555...6666', timestamp: '1 day ago', transferCount: 1 }
  );

  // Cluster 3 (Emerald Green Cluster - Liquidity Providers & Yield Farming network)
  const cluster3Wallets = [nodes[13].id, nodes[14].id, nodes[15].id, nodes[16].id];
  links.push(
    { id: 'link-3-1', source: nodes[13].id, target: nodes[14].id, amount: 1200000, txHash: '0x7777...8888', timestamp: '6 hours ago', transferCount: 2 },
    { id: 'link-3-2', source: nodes[14].id, target: nodes[15].id, amount: 950000, txHash: '0x9999...0000', timestamp: '3 hours ago', transferCount: 1 },
    { id: 'link-3-3', source: nodes[15].id, target: nodes[16].id, amount: 620000, txHash: '0xaaaa...bbbb', timestamp: '30 mins ago', transferCount: 1 }
  );

  // Cluster 4 (Purple Cluster - Arbitrage Bots & Market Makers)
  const cluster4Wallets = [nodes[17].id, nodes[18].id, nodes[19].id];
  links.push(
    { id: 'link-4-1', source: nodes[17].id, target: nodes[18].id, amount: 3300000, txHash: '0xcccc...dddd', timestamp: '1 day ago', transferCount: 8 },
    { id: 'link-4-2', source: nodes[18].id, target: nodes[19].id, amount: 1400000, txHash: '0xeeee...ffff', timestamp: '4 hours ago', transferCount: 3 }
  );

  // Random additional links between mid-holders to create intricate web graph
  for (let k = 20; k < 45; k += 4) {
    if (nodes[k] && nodes[k + 1]) {
      links.push({
        id: `link-random-${k}`,
        source: nodes[k].id,
        target: nodes[k + 1].id,
        amount: Math.floor(Math.random() * 200000) + 10000,
        txHash: `0x${Math.random().toString(16).substring(2, 10)}...`,
        timestamp: `${Math.floor(Math.random() * 24) + 1} hours ago`,
        transferCount: Math.floor(Math.random() * 3) + 1
      });
    }
  }

  // Calculate top 10 percentage
  const top10Sum = nodes.slice(0, 10).reduce((acc, curr) => acc + curr.percentage, 0);

  return {
    token: {
      symbol,
      name,
      address: '0x4f3a...91e2',
      totalSupply,
      priceUsd,
      holdersCount: nodeCount * 42,
      centralizationScore: Math.round(top10Sum * 0.8),
      top10Percentage: parseFloat(top10Sum.toFixed(2))
    },
    nodes,
    links
  };
}

export const TOKEN_DATASETS: Record<string, TokenDataset> = {
  APE: createMockDataset('APE', 'ApePay Privacy Token', 100_000_000, 1.45, 110),
  PEPE: createMockDataset('PEPE', 'Pepe Coin', 420_690_000_000_000, 0.0000085, 95),
  SHIB: createMockDataset('SHIB', 'Shiba Inu', 589_000_000_000_000, 0.000018, 90),
};
