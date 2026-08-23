import {
  createPublicClient,
  createWalletClient,
  http,
  formatEther,
  parseEther,
  defineChain,
  Address,
  Hex
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { WalletNode, TransferLink, TokenInfo } from '../types/bubble';

export const ANVIL_RPC_URL = 'http://127.0.0.1:8545';

// Define local Anvil chain
export const anvilChain = defineChain({
  id: 31337,
  name: 'Anvil Localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: [ANVIL_RPC_URL] },
    public: { http: [ANVIL_RPC_URL] },
  },
});

// Create Public Client connected to Anvil
export const publicClient = createPublicClient({
  chain: anvilChain,
  transport: http(ANVIL_RPC_URL, { timeout: 3000 }),
});

// Standard pre-funded Anvil accounts & private keys
export const ANVIL_PREFUNDED_ACCOUNTS = [
  { address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as Address, key: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as Hex, label: 'Anvil Account #0' },
  { address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as Address, key: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d' as Hex, label: 'Anvil Account #1' },
  { address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' as Address, key: '0x5de4111daf4ef538740131473b5ed546300a6e807334547d9520e5b128d0a290' as Hex, label: 'Anvil Account #2' },
  { address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906' as Address, key: '0x7c88574052332616f7316530302b0c41d34636087950c41d5058700073280597' as Hex, label: 'Anvil Account #3' },
  { address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65' as Address, key: '0x47e179ec197488593b192f011d3bf30d65c36664c6b2a40a8ed9c613038d1502' as Hex, label: 'Anvil Account #4' },
  { address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc' as Address, key: '0x8b3a35084c338e9672d5d00a30c7940c6c37e69e061803738e4a7a8d8396784d' as Hex, label: 'Anvil Account #5' },
  { address: '0x976EA74026E726554dB657fA54763abd0C3a0aa9' as Address, key: '0x92db14e403b83dfe3df233524e980894565780a13318de92972986422d3b259d' as Hex, label: 'Anvil Account #6' },
  { address: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955' as Address, key: '0x4b3851454ee82c005ba6a0598f0005d7d0538161aa1767c6999a4e287042a98f' as Hex, label: 'Anvil Account #7' },
  { address: '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f' as Address, key: '0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97' as Hex, label: 'Anvil Account #8' },
  { address: '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720' as Address, key: '0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6' as Hex, label: 'Anvil Account #9' },
];

export interface AnvilStatus {
  isConnected: boolean;
  blockNumber: number;
  error?: string;
}

/**
 * Checks connection status to Anvil RPC node.
 */
export async function getAnvilStatus(): Promise<AnvilStatus> {
  try {
    const blockNum = await publicClient.getBlockNumber();
    return { isConnected: true, blockNumber: Number(blockNum) };
  } catch (err: any) {
    return { isConnected: false, blockNumber: 0, error: err?.message || 'Failed to connect to http://127.0.0.1:8545' };
  }
}

/**
 * Checks for connected MetaMask accounts from window.ethereum.
 */
export async function getConnectedMetaMaskAccounts(): Promise<string[]> {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
      if (Array.isArray(accounts)) {
        return accounts.map((a: string) => a.toLowerCase());
      }
    } catch {
      // Ignore if not connected
    }
  }
  return [];
}

/**
 * Requests account connection from MetaMask.
 */
export async function connectMetaMask(): Promise<string[]> {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    if (Array.isArray(accounts)) {
      return accounts.map((a: string) => a.toLowerCase());
    }
  } else {
    throw new Error('MetaMask is not installed in your browser.');
  }
  return [];
}

/**
 * Scans live Anvil blockchain data:
 * 1. Queries accounts from Anvil RPC (eth_accounts), pre-funded list, connected MetaMask, and custom addresses.
 * 2. Queries live ETH balances for all accounts.
 * 3. Scans recent block history for ETH transactions.
 * 4. Constructs live WalletNode[] and TransferLink[].
 */
export async function fetchLiveAnvilData(
  extraAddresses: string[] = []
): Promise<{
  tokenInfo: TokenInfo;
  nodes: WalletNode[];
  links: TransferLink[];
}> {
  const latestBlockNum = await publicClient.getBlockNumber();

  const addressSet = new Set<string>();
  const labelMap = new Map<string, string>();

  // 1. Load standard pre-funded Anvil accounts
  ANVIL_PREFUNDED_ACCOUNTS.forEach((a, idx) => {
    const lower = a.address.toLowerCase();
    addressSet.add(lower);
    labelMap.set(lower, `Anvil Account #${idx}`);
  });

  // 2. Fetch dynamic accounts from Anvil RPC node via eth_accounts
  try {
    const rpcAccounts = await (publicClient.request as any)({ method: 'eth_accounts' });
    if (Array.isArray(rpcAccounts)) {
      rpcAccounts.forEach((acc: string, idx: number) => {
        const lower = acc.toLowerCase();
        addressSet.add(lower);
        if (!labelMap.has(lower)) {
          labelMap.set(lower, `Anvil Account #${idx}`);
        }
      });
    }
  } catch {
    // Ignore RPC eth_accounts failure if disabled
  }

  // 3. Detect connected MetaMask accounts via window.ethereum
  const metamaskAccounts = await getConnectedMetaMaskAccounts();
  metamaskAccounts.forEach((acc, idx) => {
    const lower = acc.toLowerCase();
    addressSet.add(lower);
    if (!labelMap.has(lower)) {
      labelMap.set(lower, idx === 0 ? 'MetaMask Connected Wallet' : `MetaMask Account #${idx + 1}`);
    }
  });

  // 4. Track extra custom addresses (e.g. 0x5d760B94dA2D248cC5e4688F7FbF04840C885FdB)
  extraAddresses.forEach(acc => {
    if (acc && acc.startsWith('0x')) {
      const lower = acc.toLowerCase();
      addressSet.add(lower);
      if (!labelMap.has(lower)) {
        labelMap.set(lower, 'Tracked Wallet');
      }
    }
  });

  // 5. Scan last 50 blocks for ETH transactions
  const links: TransferLink[] = [];
  const startBlock = BigInt(Math.max(0, Number(latestBlockNum) - 50));

  for (let b = startBlock; b <= latestBlockNum; b++) {
    try {
      const block = await publicClient.getBlock({ blockNumber: b, includeTransactions: true });
      if (block && block.transactions) {
        for (const tx of block.transactions) {
          if (typeof tx === 'object' && tx.from && tx.to && tx.value > 0n) {
            const fromAddr = tx.from.toLowerCase();
            const toAddr = tx.to.toLowerCase();

            addressSet.add(fromAddr);
            addressSet.add(toAddr);

            const ethAmount = parseFloat(formatEther(tx.value));

            links.push({
              id: tx.hash,
              source: tx.from,
              target: tx.to,
              amount: ethAmount,
              txHash: `${tx.hash.substring(0, 6)}...${tx.hash.substring(tx.hash.length - 4)}`,
              timestamp: `Block #${b}`,
              transferCount: 1,
            });
          }
        }
      }
    } catch {
      // Ignore individual block fetch error
    }
  }

  // 6. Query live ETH balances for all discovered addresses
  const nodePromises = Array.from(addressSet).map(async (addr) => {
    let balanceEth = 0;
    try {
      const balWei = await publicClient.getBalance({ address: addr as Address });
      balanceEth = parseFloat(formatEther(balWei));
    } catch {
      balanceEth = 0;
    }

    const matchedPrefundedIndex = ANVIL_PREFUNDED_ACCOUNTS.findIndex(
      p => p.address.toLowerCase() === addr
    );

    let label = labelMap.get(addr);
    if (!label && matchedPrefundedIndex >= 0) {
      label = `Anvil Account #${matchedPrefundedIndex}`;
    }

    return {
      id: addr,
      balance: balanceEth,
      percentage: 0,
      clusterId: null,
      rank: 0,
      label: label || undefined,
    };
  });

  const nodes = await Promise.all(nodePromises);

  // Compute percentage supply & rank
  const totalBalance = nodes.reduce((acc, curr) => acc + curr.balance, 0) || 1;
  nodes.forEach(n => {
    n.percentage = parseFloat(((n.balance / totalBalance) * 100).toFixed(2));
  });

  // Sort: highest balance first; for equal balances, sort by label/address
  nodes.sort((a, b) => {
    if (b.balance !== a.balance) return b.balance - a.balance;
    return (a.label || a.id).localeCompare(b.label || b.id);
  });

  nodes.forEach((n, idx) => {
    n.rank = idx + 1;
  });

  const tokenInfo: TokenInfo = {
    symbol: 'ETH (Anvil)',
    name: 'Anvil Localhost Ethereum',
    address: '0x0000000000000000000000000000000000000000',
    totalSupply: totalBalance,
    priceUsd: 2850.00,
    holdersCount: nodes.length,
    centralizationScore: Math.round(nodes.slice(0, 3).reduce((acc, n) => acc + n.percentage, 0)),
    top10Percentage: parseFloat(nodes.slice(0, 10).reduce((acc, n) => acc + n.percentage, 0).toFixed(2)),
  };

  return { tokenInfo, nodes, links };
}

/**
 * Sends a real ETH transaction on Anvil RPC using unlocked pre-funded account key or MetaMask.
 */
export async function sendAnvilTransaction(
  senderAddress: string,
  receiverAddress: string,
  amountEth: number
): Promise<Hex> {
  const matched = ANVIL_PREFUNDED_ACCOUNTS.find(
    a => a.address.toLowerCase() === senderAddress.toLowerCase()
  );

  if (matched) {
    const account = privateKeyToAccount(matched.key);
    const walletClient = createWalletClient({
      account,
      chain: anvilChain,
      transport: http(ANVIL_RPC_URL),
    });

    const hash = await walletClient.sendTransaction({
      to: receiverAddress as Address,
      value: parseEther(amountEth.toString()),
    });

    await publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  // If sender is a browser wallet (e.g. MetaMask)
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    const hash = await (window as any).ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: senderAddress,
          to: receiverAddress,
          value: '0x' + parseEther(amountEth.toString()).toString(16),
        },
      ],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    return hash as Hex;
  }

  throw new Error(`Sender address ${senderAddress} is not an Anvil pre-funded account or connected wallet.`);
}
