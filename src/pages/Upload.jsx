import { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, UploadCloud, File, X, CheckCircle2, Loader2, Play } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadFile, startAnalysis, pollTask } from "../lib/api";

const Toggle = ({ enabled, onChange, label, description }) => (
  <div className="flex items-center justify-between p-5 rounded-3xl glass transition-colors w-full border border-white/5 hover:border-white/10 group cursor-pointer" onClick={() => onChange(!enabled)}>
    <div className="pr-4">
      <p className="text-text-primary text-lg font-heading font-semibold mb-1 group-hover:text-accents-primary transition-colors">{label}</p>
      <p className="text-text-tertiary text-sm leading-relaxed">{description}</p>
    </div>
    <button
      type="button"
      className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus-ring ${enabled ? 'bg-accents-primary shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-background-panel border-white/10'}`}
    >
      <span className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white transition duration-300 ease-in-out shadow-md ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  </div>
);

const processingSteps = [
  "Initializing secure ingestion tunnel...",
  "Parsing continuous transaction ledger...",
  "Building topological adjacency matrix...",
  "Executing heuristic cycle-detection...",
  "Running VF2 Graph Isomorphism algorithms...",
  "Finalizing risk intelligence scoring..."
];

const TerminalLog = ({ active, error }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!active) return;
    setCurrentStep(0);
    const interval = setInterval(() => {
      setCurrentStep(s => {
        if (s < processingSteps.length - 1) return s + 1;
        clearInterval(interval);
        return s;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [active]);

  if (!active && !error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto mt-12 bg-[#050505] border border-white/10 rounded-2xl p-6 font-mono text-sm shadow-2xl overflow-hidden relative"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accents-primary to-transparent opacity-50 animate-[pulse_2s_infinite]" />
      <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
        <div className="w-3 h-3 rounded-full bg-red-500/50" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
        <div className="w-3 h-3 rounded-full bg-green-500/50" />
        <span className="ml-4 text-text-tertiary tracking-widest text-xs uppercase">Engine Output Log</span>
      </div>

      <div className="space-y-4">
        {processingSteps.slice(0, currentStep + 1).map((step, idx) => {
          const isLast = idx === currentStep;
          if (error && isLast) {
            return (
              <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-4 text-accents-danger">
                <X size={18} className="mt-0.5 flex-shrink-0" />
                <span>[ERROR] {error}</span>
              </motion.div>
            )
          }
          return (
            <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`flex items-start gap-4 ${isLast ? 'text-accents-primary font-semibold' : 'text-text-tertiary'}`}>
              {isLast ? <Loader2 size={18} className="animate-spin mt-0.5 flex-shrink-0" /> : <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />}
              <span>{isLast ? "> " : ""}{step}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

const UploadCSV = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();

  // Config State
  const [config, setConfig] = useState({
    detectCycles: true,
    highRiskOnly: false,
    autoFlag: true
  });

  const handleFile = useCallback((selectedFile) => {
    setIsDragging(false);
    if (!selectedFile) return;

    const name = selectedFile.name.toLowerCase();
    if (!name.endsWith(".csv") && !name.endsWith(".json")) {
      setError("Invalid format. Please provide a structurally sound .csv or .json ledger.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
  }, []);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const uploadResult = await uploadFile(file);
      const analysisResult = await startAnalysis(uploadResult.dataset_id);
      await pollTask(analysisResult.celery_task_id);

      // Delay navigation slightly to let the terminal log finish feeling satisfying
      setTimeout(() => {
        navigate(`/analysis/${analysisResult.analysis_id}`);
      }, 1000);
    } catch (err) {
      const detail = err?.response?.data?.detail || err.message || "Network ingestion sequence failed.";
      setError(detail);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-base text-text-primary selection:bg-accents-primary/30">
      {/* ================= NAVBAR ================= */}
      <nav className="fixed top-0 w-full z-50 bg-background-base/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-accents-primary" size={24} strokeWidth={1.5} />
            <span className="text-xl font-heading font-black tracking-tight">
              Forensics<span className="text-text-secondary">Engine</span>
            </span>
          </div>

          <div className="flex gap-10 text-sm font-medium text-text-secondary">
            <Link to="/dashboard" className="hover:text-text-primary transition-colors focus-ring rounded-sm">
              Intelligence Dashboard
            </Link>
            <span className="text-text-primary">Data Ingestion</span>
          </div>

          <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 border border-white/10" } }} />
        </div>
      </nav>

      {/* ================= MAIN TUNNEL ================= */}
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center">

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-black mb-4 tracking-tighter">Initialize Target Ledger</h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">Upload raw transaction datasets to engage the deterministic parsing engine and map out threat typologies automatically.</p>
        </div>

        {!loading && !file && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-[50vh] min-h-[400px] mb-12 relative"
          >
            <label
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              htmlFor="ledgerUpload"
              className={`absolute inset-0 flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${isDragging
                  ? 'border-accents-primary bg-accents-primary/10 shadow-[0_0_50px_rgba(16,185,129,0.2)]'
                  : 'border-white/20 bg-background-panel/50 hover:border-accents-primary/50 hover:bg-background-panel'
                }`}
            >
              {/* Background Glow Ring */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[100px] pointer-events-none transition-opacity duration-500 ${isDragging ? 'opacity-30 bg-accents-primary' : 'opacity-0'}`} />

              <div className="relative z-10 flex flex-col items-center">
                <div className={`p-6 rounded-full mb-6 transition-all duration-300 ${isDragging ? 'bg-accents-primary/20 scale-110 text-accents-primary' : 'bg-white/5 text-text-secondary'}`}>
                  <UploadCloud size={48} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold font-heading mb-2 text-text-primary">Drag and drop dataset here</h2>
                <p className="text-text-tertiary font-mono uppercase tracking-widest text-sm mb-6">Supported formats: .CSV, .JSON</p>
                <span className="text-accents-primary font-bold px-6 py-2 rounded-full border border-accents-primary/30 bg-accents-primary/10">Browse Local Files</span>
              </div>
            </label>
            <input type="file" id="ledgerUpload" className="hidden" accept=".csv,.json" onChange={(e) => handleFile(e.target.files[0])} />
          </motion.div>
        )}

        {file && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl glass rounded-[2.5rem] p-10 mb-12 border border-accents-primary/30 shadow-[0_0_40px_rgba(16,185,129,0.15)] relative overflow-hidden">

            <div className="flex flex-col md:flex-row gap-10 items-start md:items-center justify-between relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-background-base flex items-center justify-center border border-white/10 shrink-0">
                  <File size={36} className="text-text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-heading mb-1 text-white">{file.name}</h3>
                  <p className="text-text-tertiary font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB • Staged for analysis</p>
                </div>
              </div>

              <div className="flex gap-4 w-full md:w-auto">
                <button onClick={() => { setFile(null); setError(""); }} className="flex-1 md:flex-none px-6 py-4 rounded-full font-bold border border-white/10 text-white hover:bg-white/5 transition-colors focus-ring">Discard</button>
                <button onClick={handleAnalyze} className="flex-1 md:flex-none px-8 py-4 rounded-full font-bold bg-accents-primary text-black flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-shadow">
                  <Play size={18} className="fill-black" />
                  Engage Engine
                </button>
              </div>
            </div>

            <div className="mt-12 grid md:grid-cols-2 gap-6 relative z-10 border-t border-white/10 pt-10">
              <div className="col-span-full mb-2">
                <h4 className="text-sm font-bold tracking-widest text-text-tertiary uppercase font-mono">Analysis Parameters</h4>
              </div>
              <Toggle label="Topological Cycle Detection" description="Deeply trace iterative loops within the transaction graph." enabled={config.detectCycles} onChange={(v) => setConfig({ ...config, detectCycles: v })} />
              <Toggle label="Isolate Critical Nodes" description="Filter the outcome tree to only extreme-risk entities." enabled={config.highRiskOnly} onChange={(v) => setConfig({ ...config, highRiskOnly: v })} />
            </div>
          </motion.div>
        )}

        <TerminalLog active={loading} error={error} />

        {error && !loading && (
          <div className="mt-8 text-center text-accents-danger font-mono bg-accents-danger/10 px-6 py-3 rounded-lg border border-accents-danger/20">
            [SYS_ERROR] {error}
          </div>
        )}

      </div>
    </div>
  );
};

export default UploadCSV;
