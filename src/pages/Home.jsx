import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const Home = () => {
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

          <div className="hidden md:flex gap-10 text-sm text-gray-400">
            <a href="#detection" className="hover:text-emerald-400 transition">
              Detection Engine
            </a>
            <a href="#intelligence" className="hover:text-emerald-400 transition">
              Network Intelligence
            </a>
            <a href="#reports" className="hover:text-emerald-400 transition">
              Investigation Reports
            </a>
          </div>

          <Link
            to="/login"
            className="bg-emerald-400 text-black px-6 py-2 rounded-full font-semibold hover:scale-105 transition"
          >
            Get Started
          </Link>

        </div>
      </nav>



      {/* ================= HERO ================= */}
      <section className="py-32 px-6 relative overflow-hidden">

        {/* GIF Background */}
        <div className="absolute inset-0 z-0">
  <img
    src="/bg.gif"
    alt="background animation"
    className="w-full h-full object-cover opacity-60 brightness-125 contrast-110 saturate-110"
  />
  <div className="absolute inset-0 bg-black/50"></div>
</div>


        <div className="max-w-7xl mx-auto relative z-10">

          <motion.div
  className="space-y-8 max-w-2xl"
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1 }}
>


            <div className="inline-block bg-emerald-400/10 border border-emerald-400/30 px-4 py-1.5 rounded-full text-emerald-400 text-xs uppercase tracking-widest font-semibold">
              Financial Forensics Platform
            </div>

            <h1 className="text-6xl font-black leading-tight">
              Expose Hidden <br />
              <span className="text-emerald-400">
                Money Muling Networks
              </span>
            </h1>

            <p className="text-gray-400 text-lg max-w-lg leading-relaxed">
              Upload transaction data, reconstruct financial graphs,
              detect fraud rings, and generate structured investigation reports.
            </p>

            <div className="flex gap-6 pt-4">

              <Link
                to="/login"
                className="inline-block bg-emerald-400 text-black px-8 py-4 rounded-full font-bold hover:scale-105 transition"
              >
                Start Analysis
              </Link>

              <button
                className="border border-white/20 px-8 py-4 rounded-full font-semibold text-white hover:border-emerald-400 hover:text-emerald-400 transition"
              >
                Watch Demo
              </button>

            </div>
            </motion.div>
          </div>
        
      </section>


      {/* ================= DETECTION ENGINE ================= */}
      <Reveal>
      <section id="detection" className="py-28 px-6 bg-[#050505]">

        <SectionHeader
          title="Detection Engine"
          description="Process uploaded CSV transaction files to reconstruct money flow patterns and automatically identify suspicious multi-hop activity."
        />

        <FeatureBlock
          title="Cycle Detection"
          text="Identify circular transaction chains where funds move through multiple accounts and return to the origin."
        />

        <FeatureBlock
          title="High Velocity Monitoring"
          text="Detect abnormal transaction speeds and rapid fund movements that indicate potential layering behavior."
        />

        <FeatureBlock
          title="Suspicion Scoring"
          text="Assign dynamic risk scores (0–100) to accounts based on behavioral anomalies and graph positioning."
        />

      </section>
        </Reveal>


      {/* ================= NETWORK INTELLIGENCE ================= */}
      <Reveal>
      <section id="intelligence" className="py-28 px-6">

        <SectionHeader
          title="Network Intelligence"
          description="Transform transaction data into interactive graph visualizations that clearly highlight suspicious accounts and fraud rings."
        />

        <FeatureBlock
          title="Interactive Graph View"
          text="Visualize accounts as nodes and transactions as directed edges for full investigative clarity."
        />

        <FeatureBlock
          title="Ring Highlighting"
          text="Clearly distinguish fraud rings using visual clustering and pattern grouping techniques."
        />

        <FeatureBlock
          title="Suspicious Node Emphasis"
          text="Flag high-risk accounts with distinct styling, borders, and visual prominence."
        />

      </section>
    </Reveal>


      {/* ================= INVESTIGATION REPORTS ================= */}
      <Reveal>
      <section id="reports" className="py-28 px-6 bg-[#050505]">

        <SectionHeader
          title="Investigation Reports"
          description="Generate structured JSON outputs and summarized fraud ring reports for compliance and forensic review."
        />

        <FeatureBlock
          title="Downloadable JSON Output"
          text="Export suspicious accounts, fraud rings, and summary metrics in standardized JSON format."
        />

        <FeatureBlock
          title="Fraud Ring Summary Table"
          text="Display ring IDs, member accounts, pattern types, and risk scores in a structured tabular format."
        />

        <FeatureBlock
          title="Processing Metrics"
          text="Track total accounts analyzed, suspicious accounts flagged, fraud rings detected, and processing time."
        />

      </section>
    </Reveal>
    </div>
  );
};



/* ================= REUSABLE COMPONENTS ================= */

const SectionHeader = ({ title, description }) => (
  <div className="max-w-4xl mx-auto text-center mb-16">
    <h2 className="text-4xl font-bold mb-6">{title}</h2>
    <p className="text-gray-400">{description}</p>
  </div>
);


const FeatureBlock = ({ title, text }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="max-w-4xl mx-auto bg-[#0F0F0F] border border-white/10 rounded-2xl p-8 mb-8 hover:border-emerald-400 transition"
  >
    <h3 className="text-xl font-semibold mb-3 text-emerald-400">{title}</h3>
    <p className="text-gray-400">{text}</p>
  </motion.div>
);


const Reveal = ({ children }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, filter: "blur(8px)" }}
      animate={
        isInView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : {}
      }
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export default Home;
