import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TOKEN_DATASETS } from './data/mockTokens';
import { computeClusters } from './utils/clustering';
import { WalletNode, TransferLink, TokenInfo } from './types/bubble';
import {
  getAnvilStatus,
  fetchLiveAnvilData,
  sendAnvilTransaction,
  getConnectedMetaMaskAccounts,
  connectMetaMask,
  publicClient,
  AnvilStatus
} from './services/anvilService';

import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { BubbleGraphCanvas } from './components/BubbleGraphCanvas';
import { Sidebar } from './components/Sidebar';
import { WalletDetailModal } from './components/WalletDetailModal';
import { TxSimulatorModal } from './components/TxSimulatorModal';

export const App: React.FC = () => {
  // Mode selection: Live Anvil RPC vs Simulated Dataset
  const [isAnvilMode, setIsAnvilMode] = useState<boolean>(true);
  const [anvilStatus, setAnvilStatus] = useState<AnvilStatus>({ isConnected: false, blockNumber: 0 });

  const [selectedTokenKey, setSelectedTokenKey] = useState<string>('APE');

  // Tracked MetaMask & Custom Addresses
  const [metaMaskAddress, setMetaMaskAddress] = useState<string | null>(null);
  const [extraTrackedAddresses, setExtraTrackedAddresses] = useState<string[]>([
    '0x5d760B94dA2D248cC5e4688F7FbF04840C885FdB' // User's MetaMask account
  ]);

  // Active dataset state
  const currentDataset = TOKEN_DATASETS[selectedTokenKey] || TOKEN_DATASETS['APE'];
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>(currentDataset.token);
  const [nodes, setNodes] = useState<WalletNode[]>(currentDataset.nodes);
  const [links, setLinks] = useState<TransferLink[]>(currentDataset.links);

  // Filter & selection state
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [hideUnclustered, setHideUnclustered] = useState<boolean>(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null);

  // Modals state
  const [isTxSimulatorOpen, setIsTxSimulatorOpen] = useState<boolean>(false);

  // Fetch live Anvil data
  const loadAnvilData = useCallback(async () => {
    const status = await getAnvilStatus();
    setAnvilStatus(status);

    // Update MetaMask connected account state
    const mmAccounts = await getConnectedMetaMaskAccounts();
    if (mmAccounts.length > 0) {
      setMetaMaskAddress(mmAccounts[0]);
    } else {
      setMetaMaskAddress(null);
    }

    if (status.isConnected) {
      try {
        const live = await fetchLiveAnvilData(extraTrackedAddresses);
        setTokenInfo(live.tokenInfo);
        setNodes(live.nodes);
        setLinks(live.links);
      } catch (err) {
        console.error('Failed to load Anvil RPC data:', err);
      }
    }
  }, [extraTrackedAddresses]);

  // Listen for MetaMask account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const handleAccountsChanged = (accs: string[]) => {
        if (accs.length > 0) {
          setMetaMaskAddress(accs[0].toLowerCase());
          setExtraTrackedAddresses(prev => Array.from(new Set([...prev, accs[0].toLowerCase()])));
        } else {
          setMetaMaskAddress(null);
        }
        loadAnvilData();
      };
      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [loadAnvilData]);

  // Connect MetaMask handler
  const handleConnectMetaMask = async () => {
    try {
      const accounts = await connectMetaMask();
      if (accounts.length > 0) {
        setMetaMaskAddress(accounts[0]);
        setExtraTrackedAddresses(prev => Array.from(new Set([...prev, accounts[0]])));
        await loadAnvilData();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to connect MetaMask wallet.');
    }
  };

  // Add custom tracked wallet handler
  const handleAddTrackedWallet = (address: string) => {
    const lower = address.toLowerCase();
    setExtraTrackedAddresses(prev => {
      if (prev.includes(lower)) return prev;
      return [...prev, lower];
    });
    loadAnvilData();
  };

  // Poll Anvil connection status & subscribe to blocks
  useEffect(() => {
    loadAnvilData();

    // Check status every 3 seconds
    const intervalId = setInterval(async () => {
      const status = await getAnvilStatus();
      setAnvilStatus(status);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [loadAnvilData]);

  // Watch for new Anvil blocks when in Anvil Mode
  useEffect(() => {
    if (!isAnvilMode) return;

    let unwatch: (() => void) | undefined;
    try {
      unwatch = publicClient.watchBlocks({
        onBlock: () => {
          loadAnvilData();
        },
      });
    } catch {
      // Fallback
    }

    return () => {
      if (unwatch) unwatch();
    };
  }, [isAnvilMode, loadAnvilData]);

  // Toggle between Anvil Live mode & Simulated datasets
  const handleToggleAnvilMode = (useAnvil: boolean) => {
    setIsAnvilMode(useAnvil);
    setSelectedWalletId(null);
    setSelectedClusterId(null);

    if (useAnvil) {
      loadAnvilData();
    } else {
      const ds = TOKEN_DATASETS[selectedTokenKey] || TOKEN_DATASETS['APE'];
      setTokenInfo(ds.token);
      setNodes(ds.nodes);
      setLinks(ds.links);
    }
  };

  // Switch token preset in simulated mode
  const handleSelectTokenKey = (key: string) => {
    setSelectedTokenKey(key);
    if (!isAnvilMode) {
      const ds = TOKEN_DATASETS[key] || TOKEN_DATASETS['APE'];
      setTokenInfo(ds.token);
      setNodes(ds.nodes);
      setLinks(ds.links);
      setSelectedWalletId(null);
      setSelectedClusterId(null);
    }
  };

  // Dynamically compute clusters
  const { clusters, updatedNodes } = useMemo(() => {
    return computeClusters(nodes, links, tokenInfo.totalSupply);
  }, [nodes, links, tokenInfo.totalSupply]);

  // Selected wallet node object
  const selectedWalletNode = useMemo(() => {
    if (!selectedWalletId) return null;
    return updatedNodes.find(n => n.id === selectedWalletId) || null;
  }, [selectedWalletId, updatedNodes]);

  // Cluster object for selected wallet
  const selectedWalletCluster = useMemo(() => {
    if (!selectedWalletNode || selectedWalletNode.clusterId === null) return null;
    return clusters.find(c => c.id === selectedWalletNode.clusterId) || null;
  }, [selectedWalletNode, clusters]);

  // Execute Transaction (Live Anvil RPC or Local Simulation)
  const handleExecuteTx = useCallback(
    async (senderId: string, receiverId: string, amount: number) => {
      if (isAnvilMode) {
        // Send real transaction to Anvil RPC node!
        await sendAnvilTransaction(senderId, receiverId, amount);
        // Refresh graph data from Anvil
        await loadAnvilData();
        setSelectedWalletId(senderId);
      } else {
        // Local simulation update
        setNodes(prevNodes => {
          return prevNodes.map(node => {
            if (node.id === senderId) {
              const newBal = Math.max(0, node.balance - amount);
              const newPct = (newBal / tokenInfo.totalSupply) * 100;
              return { ...node, balance: newBal, percentage: parseFloat(newPct.toFixed(2)) };
            }
            if (node.id === receiverId) {
              const newBal = node.balance + amount;
              const newPct = (newBal / tokenInfo.totalSupply) * 100;
              return { ...node, balance: newBal, percentage: parseFloat(newPct.toFixed(2)) };
            }
            return node;
          });
        });

        const newLink: TransferLink = {
          id: `sim-link-${Date.now()}`,
          source: senderId,
          target: receiverId,
          amount,
          txHash: `0x${Math.random().toString(16).substring(2, 10)}...`,
          timestamp: 'Just now',
          transferCount: 1,
        };

        setLinks(prev => [newLink, ...prev]);
        setSelectedWalletId(senderId);
      }
    },
    [isAnvilMode, loadAnvilData, tokenInfo.totalSupply]
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-[#060911] text-slate-100 overflow-hidden">
      {/* Top Header Navigation */}
      <Header
        isAnvilMode={isAnvilMode}
        onToggleAnvilMode={handleToggleAnvilMode}
        anvilStatus={anvilStatus}
        selectedTokenKey={selectedTokenKey}
        onSelectTokenKey={handleSelectTokenKey}
        tokenInfo={tokenInfo}
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
        hideUnclustered={hideUnclustered}
        onToggleHideUnclustered={() => setHideUnclustered(prev => !prev)}
        onRefreshData={loadAnvilData}
        onOpenTxSimulator={() => setIsTxSimulatorOpen(true)}
        metaMaskAddress={metaMaskAddress}
        onConnectMetaMask={handleConnectMetaMask}
        onAddTrackedWallet={handleAddTrackedWallet}
      />

      {/* Metric Cards Overview */}
      <StatsOverview tokenInfo={tokenInfo} clusters={clusters} />

      {/* Main Visualizer Area & Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* HTML5 Force Canvas Visualizer */}
        <div className="flex-1 h-full relative">
          <BubbleGraphCanvas
            nodes={updatedNodes}
            links={links}
            clusters={clusters}
            selectedWalletId={selectedWalletId}
            selectedClusterId={selectedClusterId}
            onSelectWallet={setSelectedWalletId}
            searchKeyword={searchKeyword}
            hideUnclustered={hideUnclustered}
          />
        </div>

        {/* Sidebar Panel */}
        <Sidebar
          nodes={updatedNodes}
          clusters={clusters}
          selectedWalletId={selectedWalletId}
          selectedClusterId={selectedClusterId}
          onSelectWallet={setSelectedWalletId}
          onSelectCluster={setSelectedClusterId}
        />
      </div>

      {/* Wallet Details Modal */}
      {selectedWalletNode && (
        <WalletDetailModal
          wallet={selectedWalletNode}
          links={links}
          cluster={selectedWalletCluster}
          priceUsd={tokenInfo.priceUsd}
          onClose={() => setSelectedWalletId(null)}
        />
      )}

      {/* Transaction Simulator Modal */}
      {isTxSimulatorOpen && (
        <TxSimulatorModal
          isAnvilMode={isAnvilMode}
          nodes={updatedNodes}
          onExecuteTx={handleExecuteTx}
          onClose={() => setIsTxSimulatorOpen(false)}
        />
      )}
    </div>
  );
};
