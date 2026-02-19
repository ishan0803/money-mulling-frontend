import { Link } from "react-router-dom";
import { Shield, Search, Bell, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-black text-white">

      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <Shield className="text-emerald-400" size={22} />
            <span className="text-lg font-semibold">
              Forensics<span className="text-emerald-400">Engine</span>
            </span>
          </div>

          {/* Only 2 nav items */}
          <div className="flex gap-10 text-sm text-gray-400">
            <span className="text-emerald-400 font-medium cursor-pointer">
              Dashboard
            </span>

            <Link
              to="/upload"
              className="hover:text-emerald-400 transition"
            >
              Upload CSV
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-[#0F0F0F] border border-white/10 px-4 py-2 rounded-xl text-sm text-gray-400">
              <Search size={14} className="mr-2" />
              Search entity ID...
            </div>

            <Bell size={18} className="text-gray-400 hover:text-emerald-400 cursor-pointer" />
          </div>

        </div>
      </nav>



      {/* ================= CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="mb-12">
          <h1 className="text-3xl font-semibold mb-4">
            Analysis History
          </h1>

          <p className="text-gray-400 max-w-2xl">
            Review historical forensic sessions and batch transaction audits.
            High-density overview of flagged anomalies and risk distribution.
          </p>
        </div>


        {/* ================= CARDS GRID ================= */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          <AnalysisCard
            title="Q4_LEDGER_FINAL.CSV"
            risk="high"
            total="1,240,812"
            flagged="432"
            date="Oct 24, 2024"
          />

          <AnalysisCard
            title="SWIFT_OCT_WIRE_TRANSFER.CSV"
            risk="medium"
            total="842,000"
            flagged="89"
            date="Oct 22, 2024"
          />

          <AnalysisCard
            title="KYC_BATCH_DELTA_01.CSV"
            risk="low"
            total="2,105,440"
            flagged="12"
            date="Oct 20, 2024"
          />

          <AnalysisCard
            title="EMERGING_MKT_SOVEREIGN.CSV"
            risk="high"
            total="154,200"
            flagged="1,102"
            date="Oct 18, 2024"
          />

        </div>

      </div>

    </div>
  );
};



/* ================= CARD COMPONENT ================= */

const AnalysisCard = ({ title, risk, total, flagged, date }) => {

  const riskStyles = {
    high: {
      border: "border-red-500/50",
      glow: "shadow-[0_0_40px_rgba(239,68,68,0.25)]",
      badge: "bg-red-500/20 text-red-400",
      flagged: "text-red-400"
    },
    medium: {
      border: "border-yellow-500/50",
      glow: "shadow-[0_0_40px_rgba(234,179,8,0.25)]",
      badge: "bg-yellow-500/20 text-yellow-400",
      flagged: "text-yellow-400"
    },
    low: {
      border: "border-emerald-500/50",
      glow: "shadow-[0_0_40px_rgba(16,185,129,0.25)]",
      badge: "bg-emerald-500/20 text-emerald-400",
      flagged: "text-emerald-400"
    }
  };

  const style = riskStyles[risk];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -10,
        scale: 1.04,
      }}
      transition={{ type: "spring", stiffness: 200 }}
      className={`
        relative
        bg-white/5
        backdrop-blur-xl
        border ${style.border}
        rounded-3xl
        p-6
        overflow-hidden
        transition
        ${style.glow}
      `}
    >

      {/* Glass Inner Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

      <div className="relative z-10">

        <div className="flex justify-between items-start mb-6">
          <h3 className="text-sm font-semibold tracking-wide">
            {title}
          </h3>

          <span className={`text-xs px-3 py-1 rounded-full ${style.badge}`}>
            {risk.toUpperCase()} RISK
          </span>
        </div>

        <p className="text-xs text-gray-400 mb-6 leading-relaxed">
          Review historical forensic sessions and batch transaction audits.
          High-density overview of flagged anomalies and risk distribution.
        </p>

        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-gray-500 text-xs uppercase">
              Total Transactions
            </p>
            <p className="text-lg font-semibold">
              {total}
            </p>
          </div>

          <div className="text-right">
            <p className="text-gray-500 text-xs uppercase">
              Flagged
            </p>
            <p className={`text-lg font-semibold ${style.flagged}`}>
              {flagged}
            </p>
          </div>
        </div>

        <div className="flex items-center text-gray-500 text-xs">
          {date}
        </div>

      </div>
    </motion.div>
  );
};


export default Dashboard;
