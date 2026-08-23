import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  forceSimulation,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceLink,
  Simulation
} from 'd3-force';
import { WalletNode, TransferLink, WalletCluster } from '../types/bubble';
import { shortenAddress, formatNumber, formatPercent } from '../utils/formatters';
import { Copy, ExternalLink, ShieldCheck, Zap } from 'lucide-react';

interface BubbleGraphCanvasProps {
  nodes: WalletNode[];
  links: TransferLink[];
  clusters: WalletCluster[];
  selectedWalletId: string | null;
  selectedClusterId: number | null;
  onSelectWallet: (walletId: string | null) => void;
  searchKeyword: string;
  hideUnclustered: boolean;
}

export const BubbleGraphCanvas: React.FC<BubbleGraphCanvasProps> = ({
  nodes,
  links,
  clusters,
  selectedWalletId,
  selectedClusterId,
  onSelectWallet,
  searchKeyword,
  hideUnclustered
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulation & state references
  const simulationRef = useRef<Simulation<WalletNode, TransferLink> | null>(null);

  // View transform state (Pan & Zoom)
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const isDraggingCanvasRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Dragging node state
  const draggedNodeRef = useRef<WalletNode | null>(null);

  // Hovered node tooltip state
  const [hoveredNode, setHoveredNode] = useState<{ node: WalletNode; screenX: number; screenY: number } | null>(null);

  // Particle flow animation timestamp
  const animTimeRef = useRef(0);

  // Map of cluster ID -> cluster details
  const clusterMap = useRef<Map<number, WalletCluster>>(new Map());
  useEffect(() => {
    clusterMap.current.clear();
    clusters.forEach(c => clusterMap.current.set(c.id, c));
  }, [clusters]);

  // Find cluster color for a node
  const getNodeCluster = useCallback((clusterId: number | null): WalletCluster | null => {
    if (clusterId === null) return null;
    return clusterMap.current.get(clusterId) || null;
  }, []);

  // Filtered nodes & links
  const activeNodes = useRef<WalletNode[]>([]);
  const activeLinks = useRef<TransferLink[]>([]);

  // Setup / update D3 force simulation
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 1000;
    const height = containerRef.current.clientHeight || 700;

    // Filter nodes if hideUnclustered is enabled
    let filteredNodes = [...nodes];
    if (hideUnclustered) {
      filteredNodes = filteredNodes.filter(n => n.clusterId !== null);
    }
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      filteredNodes = filteredNodes.filter(
        n => n.id.toLowerCase().includes(q) || (n.label && n.label.toLowerCase().includes(q))
      );
    }

    const validNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = links.filter(l => {
      const srcId = typeof l.source === 'object' ? l.source.id : l.source;
      const tgtId = typeof l.target === 'object' ? l.target.id : l.target;
      return validNodeIds.has(srcId) && validNodeIds.has(tgtId);
    });

    activeNodes.current = filteredNodes;
    activeLinks.current = filteredLinks;

    // Stop existing simulation
    if (simulationRef.current) simulationRef.current.stop();

    // Create D3 physics simulation
    const sim = forceSimulation<WalletNode>(filteredNodes)
      .force('center', forceCenter(width / 2, height / 2).strength(0.05))
      .force('charge', forceManyBody<WalletNode>().strength(d => -Math.pow(d.radius || 20, 1.4) * 4))
      .force(
        'collide',
        forceCollide<WalletNode>().radius(d => (d.radius || 20) + 6).iterations(3)
      )
      .force(
        'link',
        forceLink<WalletNode, TransferLink>(filteredLinks)
          .id(d => d.id)
          .distance(70)
          .strength(0.4)
      )
      .alphaDecay(0.02);

    simulationRef.current = sim;

    // Reset view transform on initial load
    if (transformRef.current.x === 0 && transformRef.current.y === 0) {
      transformRef.current = { x: width / 2, y: height / 2, k: 0.85 };
    }

    return () => {
      sim.stop();
    };
  }, [nodes, links, hideUnclustered, searchKeyword]);

  // Main Render Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      animTimeRef.current += 0.02;

      const canvas = canvasRef.current;
      if (!canvas || !containerRef.current) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      // Handle High DPI displays
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Background gradient (Dark Navy / Midnight Space tone matching Bubblemaps)
      const bgGradient = ctx.createRadialGradient(
        width / 2, height / 2, 50,
        width / 2, height / 2, Math.max(width, height) * 0.8
      );
      bgGradient.addColorStop(0, '#0a0e1a');
      bgGradient.addColorStop(0.6, '#060912');
      bgGradient.addColorStop(1, '#03050a');

      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Apply view transform (Pan & Zoom)
      const { x: tx, y: ty, k: tk } = transformRef.current;
      ctx.translate(tx, ty);
      ctx.scale(tk, tk);
      ctx.translate(-width / 2, -height / 2);

      // Determine active highlight sets
      let highlightedWalletSet = new Set<string>();
      if (selectedWalletId) {
        highlightedWalletSet.add(selectedWalletId);
        // Add connected links & neighbors
        activeLinks.current.forEach(l => {
          const srcId = typeof l.source === 'object' ? l.source.id : l.source;
          const tgtId = typeof l.target === 'object' ? l.target.id : l.target;
          if (srcId === selectedWalletId) highlightedWalletSet.add(tgtId);
          if (tgtId === selectedWalletId) highlightedWalletSet.add(srcId);
        });
      } else if (selectedClusterId !== null) {
        const cluster = clusterMap.current.get(selectedClusterId);
        if (cluster) {
          cluster.wallets.forEach(w => highlightedWalletSet.add(w));
        }
      }

      const hasSelection = selectedWalletId !== null || selectedClusterId !== null;

      // 1. RENDER LINKS (Transfer Arrows & Particle Flow)
      activeLinks.current.forEach(link => {
        const src = link.source as WalletNode;
        const tgt = link.target as WalletNode;

        if (src.x === undefined || src.y === undefined || tgt.x === undefined || tgt.y === undefined) return;

        const isLinkHighlighted =
          highlightedWalletSet.has(src.id) && highlightedWalletSet.has(tgt.id);

        let linkAlpha = hasSelection ? (isLinkHighlighted ? 0.9 : 0.08) : 0.45;
        let strokeColor = '#334155';

        // Use cluster color if both source & target belong to same cluster
        if (src.clusterId && src.clusterId === tgt.clusterId) {
          const cluster = getNodeCluster(src.clusterId);
          if (cluster) strokeColor = cluster.color;
        }

        // Draw Line
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.strokeStyle = strokeColor;
        ctx.globalAlpha = linkAlpha;
        ctx.lineWidth = isLinkHighlighted ? 2.5 : 1.2;
        ctx.stroke();

        // Draw Directed Arrowhead
        const angle = Math.atan2(tgt.y - src.y, tgt.x - src.x);
        const tgtRadius = tgt.radius || 15;
        const arrowX = tgt.x - Math.cos(angle) * (tgtRadius + 4);
        const arrowY = tgt.y - Math.sin(angle) * (tgtRadius + 4);

        const arrowSize = 6;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
          arrowX - arrowSize * Math.cos(angle - Math.PI / 6),
          arrowY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          arrowX - arrowSize * Math.cos(angle + Math.PI / 6),
          arrowY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = strokeColor;
        ctx.fill();

        // Draw Flow Particle Animation along line
        if (!hasSelection || isLinkHighlighted) {
          const progress = (animTimeRef.current * 0.8 + (parseInt(src.id.slice(-2), 16) % 10) * 0.1) % 1;
          const px = src.x + (tgt.x - src.x) * progress;
          const py = src.y + (tgt.y - src.y) * progress;

          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = strokeColor;
          ctx.globalAlpha = Math.sin(progress * Math.PI) * 0.9;
          ctx.fill();
        }
      });

      // 2. RENDER BUBBLE NODES
      activeNodes.current.forEach(node => {
        if (node.x === undefined || node.y === undefined) return;

        const radius = node.radius || 15;
        const cluster = getNodeCluster(node.clusterId);

        const isNodeHighlighted = highlightedWalletSet.has(node.id);
        const isHovered = hoveredNode?.node.id === node.id;

        let nodeAlpha = 1.0;
        if (hasSelection && !isNodeHighlighted) {
          nodeAlpha = 0.18;
        }

        ctx.globalAlpha = nodeAlpha;

        // Base bubble radial gradient (3D sphere effect like Bubblemaps)
        const radGrad = ctx.createRadialGradient(
          node.x - radius * 0.35, node.y - radius * 0.35, radius * 0.1,
          node.x, node.y, radius
        );

        if (cluster) {
          // Color-coded cluster bubble
          radGrad.addColorStop(0, cluster.glowColor.replace('0.6', '0.9'));
          radGrad.addColorStop(0.6, cluster.color + 'aa');
          radGrad.addColorStop(1, '#0c1122');
        } else {
          // Regular unclustered holder (dark blue translucent glass bubble)
          radGrad.addColorStop(0, 'rgba(51, 65, 85, 0.7)');
          radGrad.addColorStop(0.7, 'rgba(30, 41, 59, 0.85)');
          radGrad.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
        }

        // Draw Outer Glow / Halo for top cluster nodes or hovered/selected node
        if (cluster || isHovered || isNodeHighlighted) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + (isHovered || isNodeHighlighted ? 8 : 4), 0, Math.PI * 2);
          ctx.fillStyle = cluster ? cluster.glowColor : 'rgba(56, 189, 248, 0.35)';
          ctx.globalAlpha = nodeAlpha * (isHovered || isNodeHighlighted ? 0.7 : 0.35);
          ctx.fill();
          ctx.restore();
        }

        // Draw Sphere Bubble Body
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = radGrad;
        ctx.fill();

        // Draw Border Ring (Stroke)
        ctx.lineWidth = cluster ? (isNodeHighlighted ? 3 : 2) : 1.2;
        ctx.strokeStyle = cluster ? cluster.color : (isHovered ? '#38bdf8' : '#334155');
        ctx.stroke();

        // Draw Special Badges / Labels for whales, deployer, exchange
        if (node.label || node.rank <= 10) {
          const fontSize = Math.max(10, Math.min(radius * 0.4, 14));
          ctx.font = `600 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#ffffff';

          let textToShow = node.label || `#${node.rank}`;
          if (textToShow.length > 12) textToShow = textToShow.slice(0, 10) + '..';

          ctx.fillText(textToShow, node.x, node.y);
        }
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [hoveredNode, selectedWalletId, selectedClusterId, getNodeCluster]);

  // Transform screen coordinate to canvas graph coordinate
  const screenToGraphCoords = useCallback((screenX: number, screenY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = screenX - rect.left;
    const y = screenY - rect.top;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const { x: tx, y: ty, k: tk } = transformRef.current;
    const graphX = (x - tx) / tk + width / 2;
    const graphY = (y - ty) / tk + height / 2;

    return { x: graphX, y: graphY };
  }, []);

  // Hit detection: find node at graph coords
  const findNodeAtCoords = useCallback((graphX: number, graphY: number): WalletNode | null => {
    for (let i = activeNodes.current.length - 1; i >= 0; i--) {
      const node = activeNodes.current[i];
      if (node.x === undefined || node.y === undefined) continue;
      const r = node.radius || 15;
      const dx = graphX - node.x;
      const dy = graphY - node.y;
      if (dx * dx + dy * dy <= r * r) {
        return node;
      }
    }
    return null;
  }, []);

  // Mouse Handlers for Pan, Drag Node, Hover & Click
  const handleMouseDown = (e: React.MouseEvent) => {
    const { x: gx, y: gy } = screenToGraphCoords(e.clientX, e.clientY);
    const hitNode = findNodeAtCoords(gx, gy);

    if (hitNode) {
      // Fix node position during drag
      draggedNodeRef.current = hitNode;
      hitNode.fx = hitNode.x;
      hitNode.fy = hitNode.y;
      if (simulationRef.current) simulationRef.current.alphaTarget(0.3).restart();
    } else {
      // Canvas Pan mode
      isDraggingCanvasRef.current = true;
      dragStartRef.current = { x: e.clientX - transformRef.current.x, y: e.clientY - transformRef.current.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeRef.current) {
      const { x: gx, y: gy } = screenToGraphCoords(e.clientX, e.clientY);
      draggedNodeRef.current.fx = gx;
      draggedNodeRef.current.fy = gy;
      return;
    }

    if (isDraggingCanvasRef.current) {
      transformRef.current.x = e.clientX - dragStartRef.current.x;
      transformRef.current.y = e.clientY - dragStartRef.current.y;
      return;
    }

    // Hover tooltip detection
    const { x: gx, y: gy } = screenToGraphCoords(e.clientX, e.clientY);
    const hovered = findNodeAtCoords(gx, gy);
    if (hovered) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setHoveredNode({
        node: hovered,
        screenX: e.clientX - rect.left,
        screenY: e.clientY - rect.top
      });
    } else {
      setHoveredNode(null);
    }
  };

  const handleMouseUp = () => {
    if (draggedNodeRef.current) {
      draggedNodeRef.current.fx = null;
      draggedNodeRef.current.fy = null;
      draggedNodeRef.current = null;
      if (simulationRef.current) simulationRef.current.alphaTarget(0);
    }
    isDraggingCanvasRef.current = false;
  };

  const handleClick = (e: React.MouseEvent) => {
    const { x: gx, y: gy } = screenToGraphCoords(e.clientX, e.clientY);
    const clickedNode = findNodeAtCoords(gx, gy);
    if (clickedNode) {
      onSelectWallet(clickedNode.id === selectedWalletId ? null : clickedNode.id);
    } else {
      onSelectWallet(null);
    }
  };

  // Zoom Handler (Wheel)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newK = Math.max(0.2, Math.min(3.5, transformRef.current.k * zoomFactor));

    transformRef.current.k = newK;
  };

  // Reset Zoom Control
  const handleResetZoom = () => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    transformRef.current = { x: width / 2, y: height / 2, k: 0.85 };
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-[#060911] cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onWheel={handleWheel}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Canvas Viewport Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 glass-panel p-2 rounded-xl z-20 shadow-2xl">
        <button
          onClick={() => { transformRef.current.k = Math.min(3.5, transformRef.current.k * 1.2); }}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-200 transition font-bold"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => { transformRef.current.k = Math.max(0.2, transformRef.current.k / 1.2); }}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-200 transition font-bold"
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={handleResetZoom}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          title="Reset Zoom"
        >
          <Zap className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredNode && (
        <div
          className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-4 glass-panel p-4 rounded-xl shadow-2xl min-w-[240px] border border-cyan-500/30 animate-in fade-in zoom-in-95 duration-150"
          style={{ left: hoveredNode.screenX, top: hoveredNode.screenY }}
        >
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-700/60">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-mono font-semibold text-slate-100 text-sm">
                {shortenAddress(hoveredNode.node.id, 5)}
              </span>
            </div>
            {hoveredNode.node.clusterId && (
              <span
                className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: `${getNodeCluster(hoveredNode.node.clusterId)?.color}25`,
                  color: getNodeCluster(hoveredNode.node.clusterId)?.color,
                  border: `1px solid ${getNodeCluster(hoveredNode.node.clusterId)?.color}50`
                }}
              >
                Cluster #{hoveredNode.node.clusterId}
              </span>
            )}
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            {hoveredNode.node.label && (
              <div className="flex justify-between">
                <span className="text-slate-400">Tag:</span>
                <span className="font-semibold text-cyan-300">{hoveredNode.node.label}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Rank:</span>
              <span className="font-medium text-slate-200">#{hoveredNode.node.rank}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Balance:</span>
              <span className="font-semibold text-emerald-400 font-mono">
                {formatNumber(hoveredNode.node.balance)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">% of Supply:</span>
              <span className="font-bold text-amber-400 font-mono">
                {formatPercent(hoveredNode.node.percentage)}
              </span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 text-center italic">
            Click to inspect cluster network
          </div>
        </div>
      )}
    </div>
  );
};
