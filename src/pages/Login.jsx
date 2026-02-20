import { Link } from "react-router-dom";
import { SignIn } from "@clerk/clerk-react";
import { motion } from "framer-motion";

/* ─── Animated data-stream lines background ─── */
const DataLines = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
    {Array.from({ length: 14 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute top-0 w-px"
        style={{ left: `${(i + 1) * 7}%`, background: "linear-gradient(to bottom, transparent, rgba(16,185,129,0.15), transparent)" }}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: [0, 1, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 3 + Math.random() * 4, delay: i * 0.22, repeat: Infinity, ease: "linear" }}
      />
    ))}
  </div>
);

const Login = () => (
  <div className="min-h-screen bg-[#050505] flex relative overflow-hidden">
    <DataLines />

    {/* ── Left branding panel ── */}
    <div className="hidden lg:flex w-1/2 flex-col p-14 relative border-r border-white/5">
      {/* Glowing orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accents-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-accents-danger/5 rounded-full blur-3xl pointer-events-none" />

      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 group w-max z-10">
        <div className="w-9 h-9 rounded-xl bg-accents-primary/10 border border-accents-primary/30 flex items-center justify-center group-hover:border-accents-primary/60 transition-all">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-accents-primary fill-none stroke-current" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-white font-heading font-black text-xl tracking-tight">
          Forensics<span className="text-accents-primary">Engine</span>
        </span>
      </Link>

      {/* Center content */}
      <div className="flex-1 flex flex-col justify-center z-10 max-w-md">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="text-[11px] font-mono tracking-[0.2em] text-accents-primary uppercase mb-5 flex items-center gap-2">
            <span className="block w-8 h-px bg-accents-primary" />
            Secure Access Portal
          </p>
          <h1 className="text-5xl font-heading font-black text-white leading-[1.1] mb-6 tracking-tight">
            Detect.<br />Investigate.<br />
            <span className="text-accents-primary">Neutralize.</span>
          </h1>
          <p className="text-text-secondary text-base leading-relaxed font-body">
            Real-time financial graph analysis. Identify money mule networks, track layering cycles, and flag fraudulent rings — all in one intelligence canvas.
          </p>
        </motion.div>

        {/* Feature chips */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.3 }} className="flex flex-wrap gap-2 mt-8">
          {["VF2 Subgraph Search", "Cycle Detection", "Fan-in / Fan-out", "3D Network Graph", "Risk Scoring"].map((f) => (
            <span key={f} className="px-3 py-1.5 text-[11px] font-mono text-text-secondary border border-white/8 rounded-full bg-white/3">
              {f}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Bottom tagline */}
      <p className="text-[10px] font-mono text-text-tertiary z-10 tracking-widest uppercase">
        AML · KYC · FRAUD GRAPH INTELLIGENCE
      </p>
    </div>

    {/* ── Right auth panel ── */}
    <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-14 relative">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center gap-2 mb-10">
        <div className="w-8 h-8 rounded-xl bg-accents-primary/10 border border-accents-primary/30 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-accents-primary fill-none stroke-current" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-white font-heading font-black text-lg tracking-tight">
          Forensics<span className="text-accents-primary">Engine</span>
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-heading font-bold text-white tracking-tight">Welcome back</h2>
          <p className="text-text-secondary text-sm mt-1">Sign in to access your investigation workspace.</p>
        </div>

        <SignIn
          routing="hash"
          afterSignInUrl="/dashboard"
          appearance={{
            layout: { socialButtonsPlacement: "bottom", logoPlacement: "none" },
            variables: {
              colorPrimary: "#10b981",
              colorBackground: "#0d0d0d",
              colorText: "#f9fafb",
              colorTextSecondary: "#9ca3af",
              colorInputBackground: "#0a0a0a",
              colorInputText: "#f9fafb",
              colorShimmer: "#1a1a1a",
              borderRadius: "0.75rem",
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "14px",
            },
            elements: {
              rootBox: "w-full",
              card: "bg-[#111111] border border-white/8 shadow-[0_0_60px_rgba(0,0,0,0.8)] w-full",
              formButtonPrimary: "bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-colors",
              formFieldInput: "bg-[#0a0a0a] border-white/10 text-white",
              socialButtonsBlockButton: "bg-[#1a1a1a] border-white/10 text-white hover:bg-[#222]",
              dividerText: "text-white/30",
              footerActionLink: "text-emerald-400 hover:text-emerald-300",
            },
          }}
        />

        <p className="text-center mt-5 text-sm text-text-tertiary">
          No account?{" "}
          <Link to="/signup" className="text-accents-primary hover:text-[#34d399] font-bold transition-colors">
            Create one →
          </Link>
        </p>
      </motion.div>
    </div>
  </div>
);

export default Login;
