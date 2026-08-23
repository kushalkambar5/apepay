import { WalletNode, TransferLink, WalletCluster } from '../types/bubble';

export const CLUSTER_PALETTE = [
  { color: '#f97316', glow: 'rgba(249, 115, 22, 0.6)', name: 'Orange Cluster' },  // Amber/Orange
  { color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.6)', name: 'Cyan Cluster' },    // Cyan
  { color: '#10b981', glow: 'rgba(16, 185, 129, 0.6)', name: 'Emerald Cluster' }, // Emerald Green
  { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)', name: 'Purple Cluster' },  // Purple
  { color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.6)', name: 'Rose Cluster' },    // Rose
  { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.6)', name: 'Blue Cluster' },    // Blue
];

/**
 * Calculates bubble radius based on wallet token percentage/balance.
 * Uses square-root scaling with bounds (min 10px, max 65px) so all bubbles look clear.
 */
export function calculateBubbleRadius(percentage: number, maxPercentage = 25): number {
  const minRadius = 10;
  const maxRadius = 65;
  const normalized = Math.min(percentage / maxPercentage, 1);
  const sqrtVal = Math.sqrt(normalized);
  return Math.max(minRadius, minRadius + sqrtVal * (maxRadius - minRadius));
}

/**
 * Computes graph clusters (connected components) based on transfer links between wallets.
 */
export function computeClusters(
  nodes: WalletNode[],
  links: TransferLink[],
  totalSupply: number
): { clusters: WalletCluster[]; updatedNodes: WalletNode[] } {
  // Adjacency graph
  const adj = new Map<string, Set<string>>();
  nodes.forEach(n => adj.set(n.id, new Set()));

  links.forEach(l => {
    const srcId = typeof l.source === 'object' ? l.source.id : l.source;
    const tgtId = typeof l.target === 'object' ? l.target.id : l.target;
    if (adj.has(srcId)) adj.get(srcId)?.add(tgtId);
    if (adj.has(tgtId)) adj.get(tgtId)?.add(srcId);
  });

  const visited = new Set<string>();
  const clusters: WalletCluster[] = [];
  const nodeClusterMap = new Map<string, number>();

  let clusterIndex = 0;

  // Find components with >= 2 connected nodes
  nodes.forEach(node => {
    if (visited.has(node.id)) return;

    const neighbors = adj.get(node.id);
    if (!neighbors || neighbors.size === 0) {
      visited.add(node.id);
      return; // Single unclustered holder
    }

    // BFS to find connected component
    const component: string[] = [];
    const queue: string[] = [node.id];
    visited.add(node.id);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      component.push(curr);

      adj.get(curr)?.forEach(nbr => {
        if (!visited.has(nbr)) {
          visited.add(nbr);
          queue.push(nbr);
        }
      });
    }

    // Only classify as a cluster if 2 or more wallets are connected
    if (component.length >= 2) {
      const paletteItem = CLUSTER_PALETTE[clusterIndex % CLUSTER_PALETTE.length];
      const clusterId = clusterIndex + 1;

      let totalBalance = 0;
      let totalPercentage = 0;

      component.forEach(wId => {
        nodeClusterMap.set(wId, clusterId);
        const wNode = nodes.find(n => n.id === wId);
        if (wNode) {
          totalBalance += wNode.balance;
          totalPercentage += wNode.percentage;
        }
      });

      clusters.push({
        id: clusterId,
        name: `Cluster #${clusterId} (${paletteItem.name})`,
        color: paletteItem.color,
        glowColor: paletteItem.glow,
        walletCount: component.length,
        totalBalance,
        totalPercentage,
        wallets: component
      });

      clusterIndex++;
    }
  });

  // Update nodes with cluster ID & radius
  const maxPct = Math.max(...nodes.map(n => n.percentage), 1);
  const updatedNodes = nodes.map(node => {
    const cId = nodeClusterMap.get(node.id) || null;
    return {
      ...node,
      clusterId: cId,
      radius: calculateBubbleRadius(node.percentage, maxPct)
    };
  });

  return { clusters, updatedNodes };
}

/**
 * Calculates Sybil / Centralization Risk score (0 to 100).
 */
export function calculateRiskScore(
  top10Percentage: number,
  clusters: WalletCluster[]
): { score: number; level: 'Low' | 'Medium' | 'High' | 'Critical' } {
  const clusterDominance = clusters.reduce((acc, c) => acc + c.totalPercentage, 0);
  const rawScore = (top10Percentage * 0.5) + (clusterDominance * 0.5);
  const score = Math.min(Math.round(rawScore), 99);

  let level: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  if (score > 75) level = 'Critical';
  else if (score > 50) level = 'High';
  else if (score > 25) level = 'Medium';

  return { score, level };
}
