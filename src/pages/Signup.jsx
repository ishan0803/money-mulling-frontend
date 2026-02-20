import { Link } from "react-router-dom";
import { SignUp } from "@clerk/clerk-react";
import { motion } from "framer-motion";

/* ─── Animated hexagon grid background ─── */
const HexGrid = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="hex" x="0" y="0" width="40" height="46" patternUnits="userSpaceOnUse">
        <polygon points="20,2 38,11 38,35 20,44 2,35 2,11" fill="none" stroke="#10b981" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hex)" />
  </svg>
);

const Signup = () => (
  <div className="min-h-screen bg-[#050505] flex relative overflow-hidden">
    <HexGrid />

    {/* Ambient glow */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accents-primary/8 rounded-full blur-[100px] pointer-events-none" />

    {/* ── Left branding panel ── */}
    <div className="hidden lg:flex w-5/12 flex-col p-14 relative border-r border-white/5">
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

      {/* Center message */}
      <div className="flex-1 flex flex-col justify-center z-10 max-w-sm">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="text-[11px] font-mono tracking-[0.2em] text-accents-primary uppercase mb-5 flex items-center gap-2">
            <span className="block w-8 h-px bg-accents-primary" />
            New Investigator Enrollment
          </p>
          <h1 className="text-4xl font-heading font-black text-white leading-[1.1] mb-6 tracking-tight">
            Join the network.<br />
            <span className="text-accents-primary">Fight financial crime.</span>
          </h1>
          <p className="text-text-secondary leading-relaxed font-body text-sm">
            Create an account to start uploading transaction data and running graph-based AML analysis. Fraud ring detection ready in minutes.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.3 }} className="grid grid-cols-3 gap-3 mt-10">
          {[
            { label: "Nodes analyzed", value: "10M+" },
            { label: "Fraud rings caught", value: "4.2K" },
            { label: "Accuracy", value: "97.4%" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center p-3 rounded-xl bg-white/3 border border-white/6">
              <p className="text-lg font-black font-mono text-accents-primary">{value}</p>
              <p className="text-[10px] font-mono text-text-tertiary mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <p className="text-[10px] font-mono text-text-tertiary z-10 tracking-widest uppercase">
        AML · KYC · FRAUD GRAPH INTELLIGENCE
      </p>
    </div>

    {/* ── Right auth panel ── */}
    <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 relative">
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
          <h2 className="text-2xl font-heading font-bold text-white tracking-tight">Create account</h2>
          <p className="text-text-secondary text-sm mt-1">Start detecting financial crime instantly.</p>
        </div>

        {/* Signup form scroll container for small screens */}
        <div className="overflow-y-auto max-h-[75vh]">
          <SignUp
            routing="hash"
            afterSignUpUrl="/dashboard"
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
        </div>

        <p className="text-center mt-5 text-sm text-text-tertiary">
          Have an account?{" "}
          <Link to="/login" className="text-accents-primary hover:text-[#34d399] font-bold transition-colors">
            Sign in →
          </Link>
        </p>
      </motion.div>
    </div>
  </div>
);

export default Signup;
