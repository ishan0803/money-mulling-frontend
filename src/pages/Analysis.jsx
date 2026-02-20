import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Shield, Search, Crosshair, Map, Layers, ActivitySquare,
  FileJson, X, ChevronUp, ChevronDown, Loader2, LogOut,
  AlertTriangle, Network, Download,
} from "lucide-react";
import { useClerk } from "@clerk/clerk-react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import ForceGraph3D from "react-force-graph-3d";
import { getGraphData, startIsomorphismSearch, exportAnalysis } from "../lib/api";
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";

// ─── Helpers ───────────────────────────────────────────────────────────────
const riskColor = (level) => {
  if (level === "High") return "#ef4444";
  if (level === "Medium") return "#f59e0b";
  return "#3b82f6";
};

const Analysis = () => {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const { signOut } = useClerk();

  // Data
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [riskData, setRiskData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Layout
  const [leftOpen, setLeftOpen] = useState(true);
  const [bottomOpen, setBottomOpen] = useState(false);
  const [rightTab, setRightTab] = useState("overview");

  // Selection
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Isomorphism
  const [hops, setHops] = useState(1);
  const [isoLoading, setIsoLoading] = useState(false);
  const [isoResult, setIsoResult] = useState(null);
  // Set of node IDs that are match results (excluding the seed itself)
  const [matchNodeIds, setMatchNodeIds] = useState(new Set());

  // Threshold
  const [riskThreshold, setRiskThreshold] = useState(0);

  // Export
  const [exporting, setExporting] = useState(false);

  // Table sort
  const [sorting, setSorting] = useState([{ id: "score", desc: true }]);

  const fgRef = useRef();

  /* ── LOAD DATA ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!analysisId) return setLoading(false);
    (async () => {
      try {
        const graphRes = await getGraphData(analysisId);
        setStats(graphRes.stats);
        const risk = graphRes.risk || [];
        setRiskData(risk);

        // Enrich nodes with risk color
        const riskLookup = Object.fromEntries(risk.map((r) => [r.account_id, r]));
        const nodes = (graphRes.graph?.nodes || []).map((n) => ({
          ...n,
          color: riskColor(riskLookup[n.id]?.risk_level || "Low"),
          score: riskLookup[n.id]?.score || 0,
        }));
        setGraphData({ nodes, links: graphRes.graph?.links || [] });
      } catch (err) {
        setError(err?.response?.data?.detail || "Failed to load analysis.");
      } finally {
        setLoading(false);
      }
    })();
  }, [analysisId]);

  /* ── AUTO FIT ──────────────────────────────────────────────── */
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      setTimeout(() => fgRef.current?.zoomToFit(1200, 60), 1000);
    }
  }, [graphData.nodes.length]);

  /* ── NODE CLICK ────────────────────────────────────────────── */
  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    setIsoResult(null);
    setMatchNodeIds(new Set());
    setRightTab("overview");
    if (fgRef.current) {
      const posVec = { x: node.x || 0, y: node.y || 0, z: node.z || 0 };
      const mag = Math.hypot(posVec.x, posVec.y, posVec.z) || 1;
      const targetDist = 120;
      fgRef.current.cameraPosition(
        { x: posVec.x / mag * (mag + targetDist), y: posVec.y / mag * (mag + targetDist), z: posVec.z / mag * (mag + targetDist) },
        posVec,
        800
      );
    }
  }, []);

  /* ── NEIGHBOR IDs (for dimming non-selected neighbors) ─────── */
  const neighborIds = useMemo(() => {
    if (!selectedNode) return new Set();
    const set = new Set([selectedNode.id]);
    graphData.links.forEach((l) => {
      const src = typeof l.source === "object" ? l.source.id : l.source;
      const tgt = typeof l.target === "object" ? l.target.id : l.target;
      if (src === selectedNode.id) set.add(tgt);
      if (tgt === selectedNode.id) set.add(src);
    });
    return set;
  }, [selectedNode, graphData.links]);

  /* ── ISOMORPHISM ───────────────────────────────────────────── */
  const handleIsomorphism = async () => {
    if (!selectedNode || !analysisId) return;
    setIsoLoading(true);
    setIsoResult(null);
    setMatchNodeIds(new Set());
    try {
      // startIsomorphismSearch now returns the result directly (no Celery polling)
      const isoRes = await startIsomorphismSearch(analysisId, selectedNode.id, hops);

      // Re-fetch graph — backend writes match flags into graph_json
      const graphRes = await getGraphData(analysisId);
      const risk = graphRes.risk || [];
      const riskLookup = Object.fromEntries(risk.map((r) => [r.account_id, r]));
      const nodes = (graphRes.graph?.nodes || []).map((n) => ({
        ...n,
        color: riskColor(riskLookup[n.id]?.risk_level || "Low"),
        score: riskLookup[n.id]?.score || 0,
      }));
      setGraphData({ nodes, links: graphRes.graph?.links || [] });

      // Collect match node IDs (nodes where is_match === 1, excluding seed's ego-graph)
      const seedEgo = new Set([selectedNode.id]);
      graphData.links.forEach((l) => {
        const src = typeof l.source === "object" ? l.source.id : l.source;
        const tgt = typeof l.target === "object" ? l.target.id : l.target;
        if (src === selectedNode.id) seedEgo.add(tgt);
        if (tgt === selectedNode.id) seedEgo.add(src);
      });
      const matched = new Set(
        (graphRes.graph?.nodes || []).filter((n) => n.is_match === 1 && !seedEgo.has(n.id)).map((n) => n.id)
      );
      setMatchNodeIds(matched);
      setIsoResult({ match_count: isoRes.match_count ?? matched.size });
    } catch (err) {
      setIsoResult({ error: err?.response?.data?.detail || err?.message || "Isomorphism search failed." });
    } finally {
      setIsoLoading(false);
    }
  };

  /* ── SEARCH ─────────────────────────────────────────────────── */
  const handleSearch = useCallback(
    (e) => {
      if (e.key !== "Enter" || !searchQuery.trim()) return;
      const node = graphData.nodes.find((n) => String(n.id).toLowerCase() === searchQuery.trim().toLowerCase());
      if (node) handleNodeClick(node);
    },
    [searchQuery, graphData.nodes, handleNodeClick]
  );

  /* ── EXPORT (hit backend /export endpoint) ─────────────────── */
  const handleExportJSON = useCallback(async () => {
    if (!analysisId || exporting) return;
    setExporting(true);
    try {
      const data = await exportAnalysis(analysisId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `forensics_export_${analysisId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setExporting(false);
    }
  }, [analysisId, exporting]);

  /* ── NODE COLORS FOR GRAPH ──────────────────────────────────── */
  const getNodeColor = useCallback((n) => {
    // Isomorphism match highlight (non-seed matches)
    if (matchNodeIds.size > 0 && matchNodeIds.has(n.id)) return "#a855f7"; // purple for match
    // When a node is selected, dim everything not in neighborhood
    if (selectedNode) {
      if (n.id === selectedNode.id) return "#10b981";          // exact hit → emerald
      if (neighborIds.has(n.id)) return n.color || "#3b82f6"; // neighbor → normal risk color
      return "#1a1a2e";                                         // dimmed
    }
    // Default: use risk-based color
    return n.color || "#3b82f6";
  }, [selectedNode, neighborIds, matchNodeIds]);

  const getLinkColor = useCallback((l) => {
    const src = typeof l.source === "object" ? l.source.id : l.source;
    const tgt = typeof l.target === "object" ? l.target.id : l.target;
    // Iso match links
    if (l.is_match === 1) return "#a855f7";
    // Active selection links
    if (selectedNode && (src === selectedNode.id || tgt === selectedNode.id)) return "#10b981";
    if (selectedNode) return "#0d0d1a";
    return "rgba(255,255,255,0.06)";
  }, [selectedNode]);

  const getLinkWidth = useCallback((l) => {
    const src = typeof l.source === "object" ? l.source.id : l.source;
    const tgt = typeof l.target === "object" ? l.target.id : l.target;
    if (l.is_match === 1) return 1.5;
    if (selectedNode && (src === selectedNode.id || tgt === selectedNode.id)) return 1.5;
    if (selectedNode) return 0.05;
    return 0.3;
  }, [selectedNode]);

  const getNodeVal = useCallback((n) => {
    if (n.id === selectedNode?.id) return 16;
    if (matchNodeIds.has(n.id)) return 10;
    if (neighborIds.has(n.id) && selectedNode) return 8;
    return n.radius || (n.score > 0 ? 5 : 3);
  }, [selectedNode, neighborIds, matchNodeIds]);

  /* ── TABLE ──────────────────────────────────────────────────── */
  const filteredRiskData = useMemo(() => riskData.filter((r) => r.score >= riskThreshold), [riskData, riskThreshold]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "account_id",
        header: "Entity ID",
        cell: (info) => (
          <button
            className="font-mono text-xs text-left hover:text-accents-primary transition-colors"
            onClick={() => {
              const n = graphData.nodes.find((x) => x.id === info.getValue());
              if (n) handleNodeClick(n);
            }}
          >
            {info.getValue()}
          </button>
        ),
      },
      {
        accessorKey: "score",
        header: "Risk Score",
        cell: (info) => {
          const v = info.getValue();
          return (
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-accents-danger rounded-full" style={{ width: `${v}%` }} />
              </div>
              <span className="font-mono font-bold text-xs">{v}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "risk_level",
        header: "Level",
        cell: (info) => {
          const lvl = (info.getValue() || "low").toLowerCase();
          const s = { high: "bg-red-900/40 text-red-400 border-red-800", medium: "bg-yellow-900/40 text-yellow-400 border-yellow-800", low: "bg-blue-900/40 text-blue-400 border-blue-800" };
          return <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-widest border ${s[lvl] || s.low}`}>{lvl}</span>;
        },
      },
      {
        accessorKey: "reasons",
        header: "Detected Typologies",
        cell: (info) => <span className="text-text-tertiary text-xs">{info.getValue() || "—"}</span>,
      },
    ],
    [graphData.nodes, handleNodeClick]
  );

  const table = useReactTable({ data: filteredRiskData, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });

  /* ── LOADING / ERROR ─────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="h-screen w-full bg-background-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 border-2 border-accents-primary/20 rounded-full animate-spin border-t-accents-primary" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Network size={24} className="text-accents-primary" />
            </div>
          </div>
          <p className="font-mono text-text-tertiary text-xs tracking-widest animate-pulse">LOADING INTELLIGENCE GRAPH...</p>
        </div>
      </div>
    );
  }

  if (error || !analysisId) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 bg-background-base">
        <div className="w-16 h-16 rounded-full border border-accents-danger/30 flex items-center justify-center bg-accents-danger/10">
          <AlertTriangle size={28} className="text-accents-danger" />
        </div>
        <p className="text-accents-danger font-mono text-sm">[SYS_ERROR] {error || "No dataset targeted."}</p>
        <button onClick={() => navigate("/dashboard")} className="px-6 py-2 rounded-full text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const selectedRisk = riskData.find((r) => r.account_id === selectedNode?.id);

  /* ── RENDER ──────────────────────────────────────────────────── */
  return (
    <div className="h-screen w-screen bg-[#030303] text-text-primary flex flex-col overflow-hidden selection:bg-accents-primary/20">

      {/* ── TOP NAV ── */}
      <nav className="h-14 shrink-0 bg-background-panel/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-5 z-50">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-accents-primary hover:text-white transition-colors">
            <Shield size={20} strokeWidth={1.5} />
            <span className="font-heading font-black text-base tracking-tight hidden sm:block">ForensicsEngine</span>
          </Link>
          <div className="h-5 w-px bg-white/10" />
          <button
            onClick={() => setLeftOpen(!leftOpen)}
            className={`h-8 px-3 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 border transition-all ${leftOpen ? "bg-white/10 text-white border-white/10" : "text-text-tertiary border-white/5 hover:text-white hover:bg-white/5"}`}
          >
            <Layers size={12} />CONTROLS
          </button>
        </div>

        <div className="flex items-center gap-5">
          <div className="hidden md:flex items-center gap-5 text-[11px] font-mono">
            <span className="text-text-tertiary">NODES: <span className="text-white font-bold">{stats?.total_nodes ?? "—"}</span></span>
            <span className="text-text-tertiary">EDGES: <span className="text-white font-bold">{stats?.total_edges ?? "—"}</span></span>
            <span className="text-accents-danger font-bold">⚠ {stats?.high_risk_count ?? 0} CRITICAL</span>
          </div>
          <div className="h-5 w-px bg-white/10" />
          <button
            onClick={handleExportJSON}
            disabled={exporting}
            title="Download Full JSON Report"
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-mono font-bold border border-accents-primary/40 text-accents-primary hover:bg-accents-primary hover:text-black transition-all"
          >
            {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            JSON EXPORT
          </button>
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            title="Sign Out"
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-mono text-text-tertiary hover:text-accents-danger border border-white/5 hover:border-accents-danger/30 hover:bg-accents-danger/10 transition-all"
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </nav>

      {/* ── WORKSPACE ── */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">

        {/* ── LEFT SIDEBAR ── */}
        <AnimatePresence initial={false}>
          {leftOpen && (
            <motion.aside
              key="left"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 288, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.32 }}
              className="h-full shrink-0 overflow-hidden border-r border-white/5 bg-background-panel flex flex-col"
            >
              <div className="w-72 flex flex-col h-full">
                {/* Search box */}
                <div className="p-4 border-b border-white/5">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearch}
                      placeholder="Jump to entity..."
                      className="w-full bg-background-base rounded-lg pl-8 pr-3 py-2 text-xs font-mono text-white placeholder-text-tertiary border border-white/8 outline-none focus:border-accents-primary/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">

                  {/* Pattern Hunter */}
                  <div>
                    <label className="block text-[10px] font-mono font-bold tracking-widest text-text-tertiary uppercase mb-3">VF2 Pattern Hunter</label>
                    <div className="bg-background-base rounded-xl border border-white/8 p-4 space-y-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-text-tertiary">TARGET:</span>
                        <span className="text-[10px] font-mono text-white font-bold truncate flex-1">
                          {selectedNode ? selectedNode.id : <span className="text-text-tertiary italic">click a node</span>}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-text-tertiary font-mono">HOPS</span>
                        <div className="flex gap-1">
                          {[1, 2, 3].map((h) => (
                            <button key={h} onClick={() => setHops(h)}
                              className={`w-7 h-7 rounded-md text-xs font-bold font-mono transition-all ${hops === h ? "bg-accents-primary text-black" : "bg-white/5 text-text-tertiary hover:bg-white/10 hover:text-white"}`}>
                              {h}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={handleIsomorphism}
                        disabled={isoLoading || !selectedNode}
                        className={`w-full py-2 rounded-lg text-[11px] font-bold font-mono tracking-wider flex items-center justify-center gap-2 transition-all ${isoLoading ? "bg-white/5 text-text-tertiary cursor-not-allowed"
                          : !selectedNode ? "bg-white/5 text-text-tertiary cursor-not-allowed opacity-50"
                            : "bg-accents-primary/15 text-accents-primary border border-accents-primary/30 hover:bg-accents-primary hover:text-black hover:border-accents-primary"
                          }`}
                      >
                        {isoLoading ? <Loader2 size={12} className="animate-spin" /> : <Crosshair size={12} />}
                        {isoLoading ? "SEARCHING..." : "INITIATE SWEEP"}
                      </button>

                      <AnimatePresence>
                        {isoResult && !isoResult.error && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="pt-2 border-t border-white/5 text-[11px] font-mono">
                              <p className="text-accents-primary font-bold">✓ {isoResult.match_count} structural clone(s) found</p>
                              <p className="text-text-tertiary mt-0.5">Highlighted purple on graph.</p>
                            </div>
                          </motion.div>
                        )}
                        {isoResult?.error && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] font-mono text-accents-danger">
                            [ERR] {isoResult.error}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Threat Threshold */}
                  <div>
                    <label className="block text-[10px] font-mono font-bold tracking-widest text-text-tertiary uppercase mb-3">Threat Threshold</label>
                    <div className="bg-background-base rounded-xl border border-white/8 p-4 space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-text-tertiary">Min risk score</span>
                        <span className={`font-bold ${riskThreshold > 60 ? "text-accents-danger" : riskThreshold > 30 ? "text-accents-warning" : "text-accents-primary"}`}>{riskThreshold}%</span>
                      </div>
                      <input type="range" min="0" max="100" value={riskThreshold} onChange={(e) => setRiskThreshold(Number(e.target.value))}
                        className="w-full accent-accents-primary cursor-ew-resize" />
                      <div className="flex justify-between text-[10px] font-mono text-text-tertiary">
                        <span>All</span><span>Critical</span>
                      </div>
                    </div>
                  </div>

                  {/* Detection Summary */}
                  {stats && (
                    <div>
                      <label className="block text-[10px] font-mono font-bold tracking-widest text-text-tertiary uppercase mb-3">Detection Summary</label>
                      <div className="bg-background-base rounded-xl border border-white/8 overflow-hidden">
                        {[
                          { label: "Cycle Rings", value: stats.cycles_detected, color: "text-accents-danger" },
                          { label: "Fan-in Aggregators", value: stats.fan_in_detected, color: "text-accents-warning" },
                          { label: "Fan-out Dispersers", value: stats.fan_out_detected, color: "text-accents-warning" },
                          { label: "Shell Accounts", value: stats.shells_detected, color: "text-red-400" },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="flex justify-between items-center px-4 py-3 border-b border-white/5 last:border-0">
                            <span className="text-text-tertiary font-mono text-[11px]">{label}</span>
                            <span className={`font-bold font-mono text-sm ${value > 0 ? color : "text-text-secondary"}`}>{value ?? 0}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── 3D GRAPH CANVAS ── */}
        <div className="flex-1 relative overflow-hidden cursor-crosshair">
          {graphData.nodes.length > 0 ? (
            <ForceGraph3D
              ref={fgRef}
              graphData={graphData}
              backgroundColor="#030303"
              /* Physics — tuned for snappy reactive feel */
              warmupTicks={100}
              cooldownTicks={200}
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.3}
              d3AlphaMin={0.001}
              /* Visuals */
              nodeResolution={16}
              nodeColor={getNodeColor}
              nodeOpacity={0.92}
              nodeVal={getNodeVal}
              nodeLabel={(n) => `${n.id}${n.score > 0 ? ` · Risk ${n.score}%` : ""}`}
              linkColor={getLinkColor}
              linkWidth={getLinkWidth}
              linkDirectionalParticles={(l) => (l.is_match === 1 || (selectedNode && (
                (typeof l.source === "object" ? l.source.id : l.source) === selectedNode.id ||
                (typeof l.target === "object" ? l.target.id : l.target) === selectedNode.id
              )) ? 3 : 0)}
              linkDirectionalParticleSpeed={0.005}
              linkDirectionalParticleWidth={1.5}
              /* Interaction */
              enableNodeDrag={true}
              onNodeClick={handleNodeClick}
              onBackgroundClick={() => { setSelectedNode(null); setMatchNodeIds(new Set()); }}
              showNavInfo={false}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center opacity-30">
                <Network size={48} className="mx-auto mb-3 text-white/30" />
                <p className="font-mono text-sm">No graph data available</p>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
            {[
              { color: "#ef4444", label: "High Risk" },
              { color: "#f59e0b", label: "Medium Risk" },
              { color: "#3b82f6", label: "Low Risk" },
              { color: "#10b981", label: "Selected" },
              { color: "#a855f7", label: "Pattern Match" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
                <span className="text-[10px] font-mono text-white/50">{label}</span>
              </div>
            ))}
          </div>

          {/* Click hint */}
          {!selectedNode && graphData.nodes.length > 0 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
              <div className="bg-black/70 border border-white/10 backdrop-blur-xl rounded-full px-5 py-2 flex items-center gap-2 text-[11px] font-mono text-text-tertiary animate-pulse">
                <span className="text-accents-primary">◈</span> Click a node to inspect · Drag to rearrange
              </div>
            </div>
          )}

          {/* Minimap placeholder */}
          <div className="absolute bottom-6 right-6 w-44 h-28 border border-white/8 bg-black/50 backdrop-blur-xl rounded-xl pointer-events-none hidden lg:flex items-center justify-center opacity-40">
            <div className="text-center">
              <Map size={18} className="mx-auto mb-1 text-white/30" />
              <span className="text-[9px] font-mono text-white/30">MINIMAP</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR (Entity Inspector) ── */}
        <AnimatePresence initial={false}>
          {selectedNode && (
            <motion.aside
              key="right"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.32 }}
              className="h-full shrink-0 overflow-hidden border-l border-white/5 bg-background-panel flex flex-col"
            >
              <div className="w-80 flex flex-col h-full">
                {/* Header */}
                <div className="px-5 h-12 border-b border-white/5 flex items-center justify-between shrink-0">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-text-tertiary flex items-center gap-2">
                    <ActivitySquare size={12} />ENTITY INSPECTOR
                  </span>
                  <button
                    onClick={() => { setSelectedNode(null); setMatchNodeIds(new Set()); setIsoResult(null); }}
                    className="p-1 rounded hover:bg-accents-danger/20 text-text-tertiary hover:text-accents-danger transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Node identity block */}
                <div className="p-5 border-b border-white/5 shrink-0">
                  <p className="text-[9px] font-mono text-text-tertiary uppercase tracking-widest mb-1">ACCOUNT ID</p>
                  <p className="font-mono text-sm font-bold text-white break-all select-all">{selectedNode.id}</p>
                </div>

                {/* Risk meter */}
                {selectedRisk && (
                  <div className="px-5 py-4 border-b border-white/5 shrink-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-widest">Threat Score</span>
                      <span className={`text-2xl font-black font-mono ${selectedRisk.risk_level === "High" ? "text-accents-danger" : selectedRisk.risk_level === "Medium" ? "text-accents-warning" : "text-accents-primary"}`}>
                        {selectedRisk.score}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedRisk.score}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className={`h-full rounded-full ${selectedRisk.risk_level === "High" ? "bg-accents-danger shadow-[0_0_8px_rgba(239,68,68,0.6)]" : selectedRisk.risk_level === "Medium" ? "bg-accents-warning" : "bg-accents-primary"}`}
                      />
                    </div>
                  </div>
                )}

                {/* Tabs */}
                <div className="flex border-b border-white/5 shrink-0">
                  {["overview", "neighbors"].map((t) => (
                    <button key={t} onClick={() => setRightTab(t)}
                      className={`flex-1 py-2.5 text-[10px] font-mono font-bold uppercase tracking-widest transition-all border-b-2 ${rightTab === t ? "text-accents-primary border-accents-primary" : "text-text-tertiary border-transparent hover:text-white"}`}>
                      {t}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-0">
                  {rightTab === "overview" && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-background-base rounded-xl border border-white/5 p-3">
                          <p className="text-[9px] font-mono text-text-tertiary uppercase mb-1">Connections</p>
                          <p className="text-xl font-black font-mono">{Math.max(0, neighborIds.size - 1)}</p>
                        </div>
                        <div className="bg-background-base rounded-xl border border-white/5 p-3">
                          <p className="text-[9px] font-mono text-text-tertiary uppercase mb-1">Level</p>
                          <p className={`text-sm font-bold ${selectedRisk?.risk_level === "High" ? "text-accents-danger" : selectedRisk?.risk_level === "Medium" ? "text-accents-warning" : "text-accents-primary"}`}>
                            {selectedRisk?.risk_level || "Low"} Risk
                          </p>
                        </div>
                      </div>
                      {selectedRisk?.reasons && selectedRisk.reasons !== "Normal" && (
                        <div className="bg-background-base rounded-xl border border-white/5 p-4">
                          <p className="text-[9px] font-mono text-text-tertiary uppercase mb-2">Detected Flags</p>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedRisk.reasons.split(",").map((r) => (
                              <span key={r.trim()} className="px-2 py-0.5 bg-accents-danger/10 border border-accents-danger/30 rounded-full text-[10px] font-mono text-accents-danger">{r.trim()}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {rightTab === "neighbors" && (
                    <>
                      <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-widest">1-hop Connections</p>
                      {[...neighborIds].filter((id) => id !== selectedNode.id).length === 0 ? (
                        <p className="text-xs font-mono text-text-tertiary">No neighbors found.</p>
                      ) : (
                        [...neighborIds].filter((id) => id !== selectedNode.id).map((id) => {
                          const risk = riskData.find((r) => r.account_id === id);
                          return (
                            <button key={id} onClick={() => { const n = graphData.nodes.find((x) => x.id === id); if (n) handleNodeClick(n); }}
                              className="w-full text-left px-3 py-2.5 rounded-lg bg-background-base border border-white/5 hover:border-accents-primary/30 hover:bg-white/5 transition-all flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: riskColor(risk?.risk_level || "Low") }} />
                              <span className="text-xs font-mono text-text-secondary truncate">{id}</span>
                              {risk?.score > 0 && <span className="ml-auto text-[10px] font-mono text-text-tertiary shrink-0">{risk.score}%</span>}
                            </button>
                          );
                        })
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* ── BOTTOM DATA GRID ── */}
      <div className={`shrink-0 border-t border-white/10 bg-background-base flex flex-col transition-all duration-500 ${bottomOpen ? "h-56" : "h-10"}`}>
        <button
          onClick={() => setBottomOpen(!bottomOpen)}
          className="h-10 shrink-0 w-full flex items-center justify-center gap-2 hover:bg-white/5 transition-colors border-b border-white/5 text-text-tertiary hover:text-white"
        >
          {bottomOpen ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase">
            {bottomOpen ? "COLLAPSE" : "INVENTORY GRID"} · {filteredRiskData.length} ENTITIES
          </span>
        </button>
        {bottomOpen && (
          <div className="flex-1 overflow-auto min-h-0">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="bg-background-panel border-b border-white/10">
                    {hg.headers.map((h) => (
                      <th key={h.id} onClick={h.column.getToggleSortingHandler()}
                        className="px-4 py-3 text-[10px] font-mono text-text-tertiary uppercase font-bold cursor-pointer hover:text-white select-none whitespace-nowrap">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {h.column.getIsSorted() === "asc" ? " ↑" : h.column.getIsSorted() === "desc" ? " ↓" : ""}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    {r.getVisibleCells().map((c) => (
                      <td key={c.id} className="px-4 py-2.5 align-middle">
                        {flexRender(c.column.columnDef.cell, c.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRiskData.length === 0 && (
              <div className="p-8 text-center font-mono text-text-tertiary text-xs">
                No entities match threat index ≥ {riskThreshold}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;
