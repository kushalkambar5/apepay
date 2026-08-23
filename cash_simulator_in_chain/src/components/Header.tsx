import React from 'react';
import { TokenInfo, WalletCluster } from '../types/bubble';
import { AnvilStatus } from '../services/anvilService';
import { Search, Filter, Send, Sparkles, Activity, RefreshCw } from 'lucide-react';

interface HeaderProps {
  isAnvilMode: boolean;
  onToggleAnvilMode: (useAnvil: boolean) => void;
  anvilStatus: AnvilStatus;
  selectedTokenKey: string;
  onSelectTokenKey: (tokenKey: string) => void;
  tokenInfo: TokenInfo;
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  hideUnclustered: boolean;
  onToggleHideUnclustered: () => void;
  onRefreshData: () => void;
  onOpenTxSimulator: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAnvilMode,
  onToggleAnvilMode,
  anvilStatus,
  selectedTokenKey,
  onSelectTokenKey,
  tokenInfo,
  searchKeyword,
  onSearchChange,
  hideUnclustered,
  onToggleHideUnclustered,
  onRefreshData,
  onOpenTxSimulator
}) => {
  return (
    <header className="glass-panel border-b border-slate-800/80 px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-30 relative">
      {/* Brand & Network Mode */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Bubblemaps Visualizer
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Cash Simulator In-Chain</p>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />

        {/* Mode Selector: Anvil Live RPC vs Presets */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onToggleAnvilMode(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
              isAnvilMode
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Live Anvil RPC</span>
          </button>
          <button
            onClick={() => onToggleAnvilMode(false)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              !isAnvilMode
                ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Simulated Datasets
          </button>
        </div>

        {/* Anvil Connection Status Badge */}
        {isAnvilMode && (
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-mono font-medium ${
              anvilStatus.isConnected
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                : 'bg-red-950/40 border-red-500/40 text-red-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                anvilStatus.isConnected ? 'bg-emerald-400 animate-ping' : 'bg-red-500'
              }`}
            />
            <span>
              {anvilStatus.isConnected
                ? `Anvil Block #${anvilStatus.blockNumber}`
                : 'Anvil Offline (http://127.0.0.1:8545)'}
            </span>
          </div>
        )}

        {/* Preset Token Dropdown when in simulated mode */}
        {!isAnvilMode && (
          <select
            value={selectedTokenKey}
            onChange={e => onSelectTokenKey(e.target.value)}
            className="bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/50 text-slate-100 text-sm font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition cursor-pointer"
          >
            <option value="APE">$APE - ApePay Privacy Token</option>
            <option value="PEPE">$PEPE - Pepe Coin</option>
            <option value="SHIB">$SHIB - Shiba Inu</option>
          </select>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchKeyword}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search wallet address (0x...) or label..."
            className="w-full bg-slate-900/90 border border-slate-800 text-slate-200 text-xs font-mono rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-cyan-500 transition placeholder:text-slate-500"
          />
        </div>

        {/* Hide Unclustered Filter */}
        <button
          onClick={onToggleHideUnclustered}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
            hideUnclustered
              ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>{hideUnclustered ? 'Clustered Only' : 'All Wallets'}</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {isAnvilMode && (
          <button
            onClick={onRefreshData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            title="Refresh Anvil Block Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onOpenTxSimulator}
          className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-lg shadow-orange-500/25 transition active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isAnvilMode ? 'Send Anvil Tx' : 'Simulate Tx'}</span>
        </button>
      </div>
    </header>
  );
};
