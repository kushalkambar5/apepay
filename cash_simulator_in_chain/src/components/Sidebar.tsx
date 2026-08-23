import React, { useState } from 'react';
import { WalletNode, WalletCluster } from '../types/bubble';
import { shortenAddress, formatNumber, formatPercent } from '../utils/formatters';
import { Users, Layers, ExternalLink, ChevronRight, Search, X, Copy, Check } from 'lucide-react';

interface SidebarProps {
  nodes: WalletNode[];
  clusters: WalletCluster[];
  selectedWalletId: string | null;
  selectedClusterId: number | null;
  onSelectWallet: (walletId: string | null) => void;
  onSelectCluster: (clusterId: number | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  nodes,
  clusters,
  selectedWalletId,
  selectedClusterId,
  onSelectWallet,
  onSelectCluster
}) => {
  const [activeTab, setActiveTab] = useState<'holders' | 'clusters'>('holders');
  const [filterQuery, setFilterQuery] = useState('');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopyAddress = (e: React.MouseEvent, address: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => {
      setCopiedAddress(prev => (prev === address ? null : prev));
    }, 1500);
  };

  // Sorted nodes by wealth rank
  const sortedNodes = [...nodes].sort((a, b) => b.balance - a.balance);

  const filteredHolders = sortedNodes.filter(n => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return n.id.toLowerCase().includes(q) || (n.label && n.label.toLowerCase().includes(q));
  });

  const getClusterForWallet = (clusterId: number | null) => {
    if (clusterId === null) return null;
    return clusters.find(c => c.id === clusterId) || null;
  };

  return (
    <aside className="w-80 glass-panel border-l border-slate-800/80 flex flex-col h-full z-20 shadow-2xl">
      {/* Tabs */}
      <div className="flex border-b border-slate-800/80 p-2 gap-1 bg-slate-950/40">
        <button
          onClick={() => setActiveTab('holders')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'holders'
              ? 'bg-slate-800 text-cyan-400 border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Top Holders ({nodes.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('clusters')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'clusters'
              ? 'bg-slate-800 text-purple-400 border border-slate-700/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Clusters ({clusters.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {activeTab === 'holders' ? (
          <>
            {/* Filter Input */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={filterQuery}
                onChange={e => setFilterQuery(e.target.value)}
                placeholder="Filter holders..."
                className="w-full bg-slate-900/80 border border-slate-800 text-xs text-slate-200 rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
              />
              {filterQuery && (
                <button
                  onClick={() => setFilterQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Holders List */}
            <div className="space-y-1.5">
              {filteredHolders.map(node => {
                const cluster = getClusterForWallet(node.clusterId);
                const isSelected = selectedWalletId === node.id;
                const isCopied = copiedAddress === node.id;

                return (
                  <div
                    key={node.id}
                    onClick={() => onSelectWallet(isSelected ? null : node.id)}
                    className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between gap-2 group ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-[11px] font-mono text-slate-400 w-5 font-semibold shrink-0">
                        #{node.rank}
                      </span>

                      {/* Cluster Color Indicator Dot */}
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: cluster ? cluster.color : '#475569',
                          boxShadow: cluster ? `0 0 8px ${cluster.color}` : 'none'
                        }}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-mono font-medium text-slate-200 truncate flex items-center gap-1">
                          <span>{node.label || shortenAddress(node.id, 4)}</span>
                        </div>
                        {node.label && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            {shortenAddress(node.id, 4)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div>
                        <div className="text-xs font-bold text-emerald-400 font-mono">
                          {formatNumber(node.balance)}
                        </div>
                        <div className="text-[10px] text-amber-400 font-bold font-mono">
                          {formatPercent(node.percentage)}
                        </div>
                      </div>

                      <button
                        onClick={e => handleCopyAddress(e, node.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-slate-800/90 transition shrink-0"
                        title={`Copy ${node.label ? node.label + ' ' : ''}address (${node.id})`}
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Clusters Tab */
          <div className="space-y-2">
            <div className="text-[11px] text-slate-400 mb-2 px-1">
              Select a cluster to isolate connected wallet networks:
            </div>

            {clusters.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-8">
                No wallet transfer clusters detected.
              </div>
            ) : (
              clusters.map(cluster => {
                const isSelected = selectedClusterId === cluster.id;

                return (
                  <div
                    key={cluster.id}
                    onClick={() => onSelectCluster(isSelected ? null : cluster.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-slate-600 shadow-lg'
                        : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                    style={{
                      borderColor: isSelected ? cluster.color : undefined
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: cluster.color,
                            boxShadow: `0 0 10px ${cluster.color}`
                          }}
                        />
                        <span className="font-semibold text-xs text-slate-100">
                          {cluster.name}
                        </span>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${cluster.color}20`,
                          color: cluster.color,
                          border: `1px solid ${cluster.color}40`
                        }}
                      >
                        {cluster.walletCount} Wallets
                      </span>
                    </div>

                    <div className="flex justify-between text-xs pt-1 border-t border-slate-800/60 text-slate-400">
                      <span>Total Control:</span>
                      <span className="font-bold font-mono text-amber-400">
                        {formatPercent(cluster.totalPercentage)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {selectedClusterId !== null && (
              <button
                onClick={() => onSelectCluster(null)}
                className="w-full mt-2 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition"
              >
                Clear Cluster Filter
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
