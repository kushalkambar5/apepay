import React from 'react';
import { TokenInfo, WalletCluster } from '../types/bubble';
import { formatNumber, formatPercent } from '../utils/formatters';
import { calculateRiskScore } from '../utils/clustering';
import { ShieldAlert, Users, PieChart, Network, AlertTriangle } from 'lucide-react';

interface StatsOverviewProps {
  tokenInfo: TokenInfo;
  clusters: WalletCluster[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ tokenInfo, clusters }) => {
  const risk = calculateRiskScore(tokenInfo.top10Percentage, clusters);

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'High': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 pt-4 pb-2 z-20 relative">
      {/* 1. Token Supply & Holders */}
      <div className="glass-panel p-3 rounded-xl flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Users className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] text-slate-400 font-medium">Total Holders</div>
          <div className="font-bold text-sm text-slate-100 font-mono">
            {formatNumber(tokenInfo.holdersCount)}
          </div>
        </div>
      </div>

      {/* 2. Top 10 Whales % */}
      <div className="glass-panel p-3 rounded-xl flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <PieChart className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] text-slate-400 font-medium">Top 10 Concentration</div>
          <div className="font-bold text-sm text-amber-400 font-mono">
            {formatPercent(tokenInfo.top10Percentage)}
          </div>
        </div>
      </div>

      {/* 3. Identified Clusters */}
      <div className="glass-panel p-3 rounded-xl flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Network className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] text-slate-400 font-medium">Identified Clusters</div>
          <div className="font-bold text-sm text-purple-300 font-mono">
            {clusters.length} Groups
          </div>
        </div>
      </div>

      {/* 4. Centralization / Sybil Risk */}
      <div className="glass-panel p-3 rounded-xl flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Sybil Risk</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getRiskBadgeColor(risk.level)}`}>
              {risk.level}
            </span>
          </div>
          <div className="font-bold text-sm text-slate-100 font-mono">
            {risk.score} / 100
          </div>
        </div>
      </div>
    </div>
  );
};
