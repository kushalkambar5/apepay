import React, { useState } from 'react';
import { WalletNode, TransferLink, WalletCluster } from '../types/bubble';
import { shortenAddress, formatNumber, formatCurrency, formatPercent } from '../utils/formatters';
import { X, Copy, ExternalLink, ArrowUpRight, ArrowDownLeft, ShieldCheck, Check } from 'lucide-react';

interface WalletDetailModalProps {
  wallet: WalletNode;
  links: TransferLink[];
  cluster: WalletCluster | null;
  priceUsd: number;
  onClose: () => void;
}

export const WalletDetailModal: React.FC<WalletDetailModalProps> = ({
  wallet,
  links,
  cluster,
  priceUsd,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Find all transfers involving this wallet
  const walletTransfers = links.filter(l => {
    const srcId = typeof l.source === 'object' ? l.source.id : l.source;
    const tgtId = typeof l.target === 'object' ? l.target.id : l.target;
    return srcId === wallet.id || tgtId === wallet.id;
  });

  const usdValue = wallet.balance * priceUsd;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full shadow-lg"
              style={{
                backgroundColor: cluster ? cluster.color : '#38bdf8',
                boxShadow: `0 0 12px ${cluster ? cluster.color : '#38bdf8'}`
              }}
            />
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {wallet.label || 'Wallet Details'}
                <span className="text-xs font-mono font-normal text-slate-400">
                  (Rank #{wallet.rank})
                </span>
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                <span>{wallet.id}</span>
                <button
                  onClick={handleCopy}
                  className="hover:text-cyan-400 transition"
                  title="Copy address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Token Balance</div>
              <div className="text-lg font-extrabold text-emerald-400 font-mono mt-0.5">
                {formatNumber(wallet.balance)}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-1">
                ≈ {formatCurrency(usdValue)}
              </div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">% of Total Supply</div>
              <div className="text-lg font-extrabold text-amber-400 font-mono mt-0.5">
                {formatPercent(wallet.percentage)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {cluster ? `Cluster: ${cluster.name}` : 'Unclustered Wallet'}
              </div>
            </div>
          </div>

          {/* Transfers History */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              Related On-Chain Transfers ({walletTransfers.length})
            </h3>

            {walletTransfers.length === 0 ? (
              <div className="text-xs text-slate-500 bg-slate-900/40 p-4 rounded-xl text-center">
                No direct wallet transfer links recorded.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {walletTransfers.map(link => {
                  const srcId = typeof link.source === 'object' ? link.source.id : link.source;
                  const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
                  const isOutgoing = srcId === wallet.id;
                  const otherParty = isOutgoing ? tgtId : srcId;

                  return (
                    <div
                      key={link.id}
                      className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-1.5 rounded-lg ${
                            isOutgoing
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {isOutgoing ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">
                            {isOutgoing ? 'Sent to' : 'Received from'}{' '}
                            <span className="font-mono text-cyan-400">
                              {shortenAddress(otherParty, 4)}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {link.timestamp} • Tx: {link.txHash}
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono font-bold text-slate-200">
                        {formatNumber(link.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
