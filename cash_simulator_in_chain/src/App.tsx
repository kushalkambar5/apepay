import React, { useState, useMemo, useCallback } from 'react';
import { TOKEN_DATASETS } from './data/mockTokens';
import { computeClusters } from './utils/clustering';
import { WalletNode, TransferLink, TokenInfo } from './types/bubble';

import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { BubbleGraphCanvas } from './components/BubbleGraphCanvas';
import { Sidebar } from './components/Sidebar';
import { WalletDetailModal } from './components/WalletDetailModal';
import { TxSimulatorModal } from './components/TxSimulatorModal';

export const App: React.FC = () => {
  const [selectedTokenKey, setSelectedTokenKey] = useState<string>('APE');

  // Token dataset state
  const currentDataset = TOKEN_DATASETS[selectedTokenKey] || TOKEN_DATASETS['APE'];
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>(currentDataset.token);
  const [nodes, setNodes] = useState<WalletNode[]>(currentDataset.nodes);
  const [links, setLinks] = useState<TransferLink[]>(currentDataset.links);

  // Filters & selection state
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [hideUnclustered, setHideUnclustered] = useState<boolean>(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null);

  // Modals state
  const [isTxSimulatorOpen, setIsTxSimulatorOpen] = useState<boolean>(false);

  // When switching tokens, reset state
  const handleSelectTokenKey = (key: string) => {
    setSelectedTokenKey(key);
    const ds = TOKEN_DATASETS[key] || TOKEN_DATASETS['APE'];
    setTokenInfo(ds.token);
    setNodes(ds.nodes);
    setLinks(ds.links);
    setSelectedWalletId(null);
    setSelectedClusterId(null);
    setSearchKeyword('');
  };

  // Re-compute graph clusters dynamically
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

  // Execute Simulated Transaction
  const handleExecuteTx = useCallback((senderId: string, receiverId: string, amount: number) => {
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

    // Append new transfer link
    const newLink: TransferLink = {
      id: `sim-link-${Date.now()}`,
      source: senderId,
      target: receiverId,
      amount,
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...`,
      timestamp: 'Just now',
      transferCount: 1
    };

    setLinks(prev => [newLink, ...prev]);

    // Select the sender wallet to view updated cluster
    setSelectedWalletId(senderId);
  }, [tokenInfo.totalSupply]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#060911] text-slate-100 overflow-hidden">
      {/* Top Header Navigation */}
      <Header
        selectedTokenKey={selectedTokenKey}
        onSelectTokenKey={handleSelectTokenKey}
        tokenInfo={tokenInfo}
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
        hideUnclustered={hideUnclustered}
        onToggleHideUnclustered={() => setHideUnclustered(prev => !prev)}
        clusters={clusters}
        selectedClusterId={selectedClusterId}
        onSelectCluster={setSelectedClusterId}
        onOpenTxSimulator={() => setIsTxSimulatorOpen(true)}
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

        {/* Sidebar Panel (Top Holders & Clusters) */}
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
          nodes={updatedNodes}
          onExecuteTx={handleExecuteTx}
          onClose={() => setIsTxSimulatorOpen(false)}
        />
      )}
    </div>
  );
};
