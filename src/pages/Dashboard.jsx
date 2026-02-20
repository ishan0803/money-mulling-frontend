import { Link } from "react-router-dom";
import { Shield, Upload, AlertTriangle, Activity, RefreshCw, Trash2, LogOut } from "lucide-react";
import { useClerk } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { getAnalysisHistory, deleteAnalysis } from "../lib/api";
import { LineChart, Line, ResponsiveContainer } from "recharts";

// Simple mock data generator for sparklines
const generateSparkline = (base, varY, trend) =>
  Array.from({ length: 15 }, (_, i) => ({ value: Math.max(0, base + (Math.random() * varY) + (i * trend)) }));

const Dashboard = () => {
  const { signOut, user } = useClerk();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await getAnalysisHistory();
      setAnalyses(Array.isArray(data) ? data : []);
    } catch {
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setDeletingId(id);
    setConfirmDeleteId(null);
    try {
      await deleteAnalysis(id);
      setAnalyses(prev => prev.filter(a => a.id !== id));
    } catch {
      // Show error silently — could add toast here
    } finally {
      setDeletingId(null);
    }
  };

  const cancelConfirm = useCallback((e) => {
    e?.stopPropagation();
    setConfirmDeleteId(null);
  }, []);

  const completedAnalyses = analyses.filter((a) => a.status === "completed");
  const totalTransactions = completedAnalyses.reduce((sum, a) => sum + (a.row_count || 0), 0);
  const totalHighRisk = completedAnalyses.reduce((sum, a) => sum + (a.stats?.high_risk_count || 0), 0);
  const totalCycles = completedAnalyses.reduce((sum, a) => sum + (a.stats?.cycles_detected || 0), 0);

  const riskTrend = generateSparkline(10, 5, 2);
  const txTrend = generateSparkline(500, 200, 50);
  const cycleTrend = generateSparkline(2, 2, 0.5);

  return (
    <div className="min-h-screen bg-background-base text-text-primary selection:bg-accents-primary/20" onClick={() => setConfirmDeleteId(null)}>

      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-50 bg-background-base/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-accents-primary" size={24} strokeWidth={1.5} />
            <span className="text-xl font-heading font-black tracking-tight">
              Forensics<span className="text-text-secondary">Engine</span>
            </span>
          </div>

          <div className="flex gap-10 text-sm font-medium text-text-secondary">
            <span className="text-text-primary">Intelligence Dashboard</span>
            <Link to="/upload" className="hover:text-text-primary transition-colors focus-ring rounded-sm">
              New Upload
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <span className="hidden md:block text-xs font-mono text-text-tertiary border border-white/10 px-3 py-1.5 rounded-full">
                {user.primaryEmailAddress?.emailAddress || user.username}
              </span>
            )}
            <button
              onClick={() => signOut({ redirectUrl: '/' })}
              title="Sign Out"
              className="flex items-center gap-2 text-sm font-mono text-text-secondary hover:text-accents-danger border border-white/10 hover:border-accents-danger/50 px-3 py-2 rounded-xl transition-all focus-ring"
            >
              <LogOut size={16} />
              <span className="hidden sm:block">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ================= CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* ── Summary Stats Section ── */}
        {completedAnalyses.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">

            {/* Hero Stat */}
            <div className="lg:col-span-2 relative overflow-hidden glass rounded-3xl p-8 border-l-[4px] border-l-accents-danger hover-glow">
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={riskTrend}>
                    <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={4} dot={false} isAnimationActive={true} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-accents-danger mb-4">
                  <AlertTriangle size={20} />
                  <span className="font-mono text-sm uppercase tracking-widest font-bold">Critical Entities Flagged</span>
                </div>
                <div className="flex items-baseline gap-4">
                  <p className="text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                    {totalHighRisk.toLocaleString()}
                  </p>
                  <span className="text-text-secondary text-lg font-mono tracking-tight">across all datasets</span>
                </div>
                <p className="text-text-secondary mt-4 max-w-sm">
                  Total cumulative high-risk nodes detected across all intelligence graphs.
                </p>
              </div>
            </div>

            {/* Secondary Stats Stack */}
            <div className="flex flex-col gap-6">
              <SecondaryStatCard
                label="Transactions Processed"
                value={totalTransactions.toLocaleString()}
                icon={Activity}
                chartData={txTrend}
                color="#3b82f6"
              />
              <SecondaryStatCard
                label="Layering Cycles Detected"
                value={totalCycles.toLocaleString()}
                icon={RefreshCw}
                chartData={cycleTrend}
                color="#f59e0b"
              />
            </div>
          </div>
        )}

        <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/5">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">Investigation History</h1>
            <p className="text-text-secondary">Select an intelligence graph to enter the 3D forensics canvas.</p>
          </div>
          <Link
            to="/upload"
            className="flex items-center gap-2 bg-text-primary text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] focus-ring"
          >
            <Upload size={18} strokeWidth={2} />
            Initialize Scan
          </Link>
        </div>

        {/* ================= CARDS GRID ================= */}
        {loading ? (
          <div className="flex justify-center py-32">
            <div className="w-16 h-16 border-4 border-accents-primary/30 border-t-accents-primary rounded-full animate-spin"></div>
          </div>
        ) : analyses.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6 pb-20">
            <AnimatePresence>
              {analyses.map((a, i) => (
                <AnalysisCard
                  key={a.id}
                  analysis={a}
                  index={i}
                  isDeleting={deletingId === a.id}
                  isConfirming={confirmDeleteId === a.id}
                  onDelete={(e) => handleDelete(e, a.id)}
                  onCancelConfirm={cancelConfirm}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};


/* ================= SECONDARY STAT CARD ================= */
const SecondaryStatCard = ({ label, value, icon: Icon, chartData, color }) => (
  <div className="relative overflow-hidden glass rounded-3xl p-6 h-full flex flex-col justify-between group hover:border-white/10 transition-colors">
    <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-10 group-hover:opacity-20 transition-opacity">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line type="basis" dataKey="value" stroke={color} strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="relative z-10 flex items-center justify-between w-full mb-6">
      <p className="text-sm text-text-secondary font-mono tracking-tight uppercase">{label}</p>
      <Icon size={18} color={color} className="opacity-70" />
    </div>
    <div className="relative z-10">
      <p className="text-4xl font-black tracking-tight">{value}</p>
    </div>
  </div>
);


/* ================= ANALYSIS CARD (MASONRY COMPATIBLE) ================= */
const AnalysisCard = ({ analysis: a, index, isDeleting, isConfirming, onDelete, onCancelConfirm }) => {
  const isCompleted = a.status === "completed";
  const highRisk = a.stats?.high_risk_count || 0;
  const cycles = a.stats?.cycles_detected || 0;
  const totalNodes = a.stats?.total_nodes || 0;

  const riskLevel = highRisk > 100 ? "high" : highRisk > 20 ? "medium" : "low";

  const riskStyles = {
    high: { border: "border-accents-danger/30 text-accents-danger", glow: "hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]" },
    medium: { border: "border-accents-warning/30 text-accents-warning", glow: "hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]" },
    low: { border: "border-accents-primary/30 text-accents-primary", glow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]" },
  };

  const style = isCompleted ? riskStyles[riskLevel] : { border: "border-white/10 text-text-secondary", glow: "" };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
      animate={{ opacity: isDeleting ? 0 : 1, scale: isDeleting ? 0.9 : 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="break-inside-avoid"
    >
      <div className={`relative glass rounded-3xl overflow-hidden transition-all duration-300 ${style.glow} border ${style.border}`}>

        {/* Confirm-Delete Overlay */}
        <AnimatePresence>
          {isConfirming && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 bg-background-base/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center gap-4 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full border border-accents-danger/30 flex items-center justify-center bg-accents-danger/10">
                <Trash2 size={22} className="text-accents-danger" />
              </div>
              <p className="text-sm font-mono text-center text-white">Permanently delete this analysis?<br /><span className="text-text-tertiary text-xs">{a.filename}</span></p>
              <div className="flex gap-3 w-full">
                <button onClick={onCancelConfirm} className="flex-1 py-2 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white/5 transition-colors">Cancel</button>
                <button onClick={onDelete} className="flex-1 py-2 rounded-xl bg-accents-danger text-white text-sm font-bold hover:bg-red-600 transition-colors">Delete</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Abstract Data Visualization Header */}
        <div className="h-28 w-full relative overflow-hidden bg-background-panel border-b border-white/5">
          <div className="absolute inset-0 opacity-40 mix-blend-screen">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id={`blur-${a.id}`}><feGaussianBlur stdDeviation="4" /></filter>
              </defs>
              <g filter={`url(#blur-${a.id})`}>
                <circle cx="20%" cy="30%" r="20" fill={isCompleted ? "#10b981" : "#666"} />
                <circle cx="80%" cy="60%" r="35" fill={isCompleted ? "#ef4444" : "#555"} />
                <circle cx="50%" cy="80%" r="15" fill={isCompleted ? "#f59e0b" : "#555"} />
                <path d="M 20% 30% L 50% 80% L 80% 60%" stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" />
              </g>
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] to-transparent" />

          {/* Delete Button — top right corner */}
          <button
            onClick={onDelete}
            disabled={isDeleting}
            title="Delete analysis"
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-lg bg-black/60 border border-white/10 hover:bg-accents-danger/20 hover:border-accents-danger/50 flex items-center justify-center text-text-tertiary hover:text-accents-danger transition-all"
          >
            {isDeleting
              ? <div className="w-3.5 h-3.5 border-2 border-accents-danger/30 border-t-accents-danger rounded-full animate-spin" />
              : <Trash2 size={14} />
            }
          </button>
        </div>

        <Link to={isCompleted ? `/analysis/${a.id}` : "#"} className={`block ${!isCompleted ? "pointer-events-none" : ""}`}>
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-base font-heading font-bold tracking-tight truncate max-w-[70%]" title={a.filename}>
                {a.filename}
              </h3>
              <span className={`text-xs px-3 py-1 rounded-full font-mono font-bold tracking-widest bg-background-base border ${style.border} whitespace-nowrap`}>
                {isCompleted ? `${riskLevel.toUpperCase()} RISK` : a.status.toUpperCase()}
              </span>
            </div>

            {isCompleted && a.stats ? (
              <div className="grid grid-cols-2 gap-3 text-sm mb-6">
                <div className="bg-background-base rounded-xl p-3 border border-white/5">
                  <p className="text-text-secondary text-xs uppercase font-mono mb-1">Total Nodes</p>
                  <p className="text-xl font-bold font-mono">{totalNodes?.toLocaleString()}</p>
                </div>
                <div className="bg-background-base rounded-xl p-3 border border-white/5">
                  <p className="text-accents-danger text-xs uppercase font-mono mb-1">High Risk</p>
                  <p className="text-xl font-bold text-accents-danger font-mono drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">{highRisk}</p>
                </div>
                <div className="bg-background-base rounded-xl p-3 border border-white/5">
                  <p className="text-accents-warning text-xs uppercase font-mono mb-1">Cycles</p>
                  <p className="text-lg font-bold font-mono">{cycles}</p>
                </div>
                <div className="bg-background-base rounded-xl p-3 border border-white/5">
                  <p className="text-text-primary text-xs uppercase font-mono mb-1">Transactions</p>
                  <p className="text-lg font-bold font-mono">{a.row_count?.toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="bg-background-base rounded-xl p-3 border border-white/5 mb-6">
                <p className="text-text-secondary text-xs uppercase font-mono mb-1">Transactions in queue</p>
                <p className="text-xl font-bold font-mono">{a.row_count?.toLocaleString()}</p>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs font-mono text-text-tertiary">
              <span>
                {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
              </span>
              {isCompleted && (
                <span className="text-accents-primary flex items-center gap-1 font-bold tracking-wider">
                  OPEN CANVAS <span className="text-lg leading-none">→</span>
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
};


/* ================= EMPTY STATE ANIMATION ================= */
const EmptyState = () => (
  <div className="py-24 flex flex-col items-center justify-center relative overflow-hidden rounded-3xl border border-white/10 glass max-w-2xl mx-auto">
    <div className="relative w-48 h-48 mb-8">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 border border-accents-primary/20 rounded-full"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 1, ease: "linear" }}
        />
      ))}
      <motion.div
        className="absolute inset-0 rounded-full border-t border-r border-accents-primary"
        style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(16,185,129,0.2) 100%)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-accents-primary rounded-full shadow-[0_0_15px_#10b981]" />
    </div>

    <h3 className="text-xl font-heading font-bold text-text-primary mb-2">Awaiting Intelligence Data</h3>
    <p className="text-text-secondary text-center max-w-sm mb-8">
      The radar is clear. Upload a transaction ledger (CSV/JSON) to initiate graph reconstruction and anomaly detection.
    </p>

    <Link to="/upload">
      <button className="bg-accents-primary text-black px-8 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-shadow">
        Feed the Engine
      </button>
    </Link>
  </div>
);

export default Dashboard;
