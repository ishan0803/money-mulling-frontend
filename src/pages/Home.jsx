import { Link } from "react-router-dom";
import { Shield, Activity, Network, FileJson, AlertTriangle, Eye, Lock } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import ParticleNetwork from "../components/ParticleNetwork";
import ScrollAnimation from "../components/ScrollAnimation";


const MagneticButton = ({ children, className, ...props }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.1, y: middleY * 0.1 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`relative overflow-hidden group focus-ring ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-accents-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
    </motion.button>
  );
};

const BentoCard = ({ title, text, icon: Icon, className, delay = 0 }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={`relative overflow-hidden glass rounded-3xl p-8 group ${className}`}
      style={{
        "--mouse-x": `${mousePosition.x}px`,
        "--mouse-y": `${mousePosition.y}px`,
      }}
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(16, 185, 129, 0.15), transparent 40%)`
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl border border-white/0 transition duration-300 group-hover:border-accents-primary/50"
        style={{
          maskImage: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), black, transparent)`,
          WebkitMaskImage: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), black, transparent)`
        }}
      />

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

      <div className="relative z-10 flex flex-col h-full">
        {Icon && (
          <div className="mb-6 inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 text-accents-primary group-hover:scale-110 group-hover:bg-accents-primary/20 transition-all duration-500">
            <Icon size={24} strokeWidth={1.5} />
          </div>
        )}
        <h3 className="text-2xl font-heading font-bold mb-3 text-text-primary group-hover:text-accents-primary transition-colors">{title}</h3>
        <p className="text-text-secondary leading-relaxed mt-auto">{text}</p>
      </div>
    </motion.div>
  );
};

const AnimatedTextReveal = ({ text }) => {
  const words = text.split(" ");

  return (
    <span className="inline-flex flex-wrap gap-x-3 gap-y-2">
      {words.map((word, index) => {
        if (word === "Money") {
          return <motion.span key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="text-accents-primary">Money</motion.span>
        }
        if (word === "Muling") {
          return <motion.span key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="text-accents-primary">Muling</motion.span>
        }
        if (word === "Networks") {
          return (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-accents-primary drop-shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-[pulse_4s_ease-in-out_infinite]"
            >
              {word}
            </motion.span>
          );
        }
        return (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {word}
          </motion.span>
        );
      })}
    </span>
  );
};

const Home = () => {
  const scrollRef = useRef(null);

  return (
    <div
      ref={scrollRef}
      className="relative min-h-[300vh] bg-background-base text-text-primary selection:bg-accents-primary/30 selection:text-accents-primary overflow-x-hidden"
    >
      {/* Scroll Frame Animation Background */}
      <ScrollAnimation containerRef={scrollRef} />

      {/* ================= NAVBAR ================= */}
      <nav className="fixed top-0 w-full z-50 bg-background-base/50 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-accents-primary" size={24} strokeWidth={1.5} />
            <span className="text-xl font-heading font-black tracking-tight">
              Ozark
            </span>
          </div>

          <div className="hidden md:flex gap-10 text-sm font-medium text-text-secondary">
            <a href="#features" className="hover:text-text-primary transition-colors focus-ring rounded-sm">
              Features
            </a>
            <a href="#intelligence" className="hover:text-text-primary transition-colors focus-ring rounded-sm">
              Intelligence
            </a>
          </div>

          <Link to="/login" tabIndex={-1}>
            <MagneticButton className="bg-white text-black px-6 py-2.5 rounded-full font-semibold text-sm hover:scale-105 transition-transform duration-300">
              Launch Platform
            </MagneticButton>
          </Link>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden z-20">
        {/* Particle Vector Network Background */}
        <div className="absolute inset-0 z-0">
          <ParticleNetwork />
          {/* Edge masking to fade into background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#09090b_100%)] pointer-events-none"></div>
          <div className="absolute bottom-0 w-full h-64 bg-gradient-to-t from-background-base to-transparent pointer-events-none"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <motion.div
            className="max-w-4xl space-y-8"
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-accents-primary/10 border border-accents-primary/20 px-4 py-1.5 rounded-full text-accents-primary text-xs uppercase tracking-widest font-mono font-semibold"
            >
              <Activity size={14} className="animate-pulse" />
              <span>Military-Grade Investigation</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tighter">
              <AnimatedTextReveal text="Expose Hidden Money Muling Networks" />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-text-secondary text-lg md:text-xl max-w-2xl leading-relaxed"
            >
              Injest massive transaction graphs in milliseconds. Utilize deep topological analysis to detect hyper-complex fraud chains and hidden layering cycles.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex flex-wrap gap-4 pt-6"
            >
              <Link to="/login" tabIndex={-1}>
                <MagneticButton className="bg-accents-primary text-black px-8 py-4 rounded-full font-bold shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)]">
                  Start Analysis
                </MagneticButton>
              </Link>
              <button className="px-8 py-4 rounded-full font-semibold text-text-primary border border-white/10 glass hover:bg-white/5 transition-colors focus-ring">
                View Demo Data
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================= FEATURES BENTO GRID ================= */}
      <section id="features" className="py-32 px-6 relative z-20">

        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 tracking-tight">System Capabilities</h2>
            <p className="text-text-secondary text-lg max-w-2xl">A unified suite of tools designed to tear through obfuscation and expose multi-hop financial crime with surgical precision.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min">
            {/* Large Feature Card */}
            <BentoCard
              className="md:col-span-2 md:row-span-2 min-h-[400px]"
              delay={0}
              icon={Network}
              title="Graph Intelligence Engine"
              text="Our core visualizer processes thousands of nodes into a performant 3D WebGL canvas. Pinpoint clusters of high-activity accounts and trace funds across infinite hops without breaking a sweat. Select any node to immediately dim unconnected noise and focus on critical adjacency paths."
            />

            <BentoCard
              delay={0.1}
              icon={AlertTriangle}
              title="Heuristic Scoring"
              text="Every entity receives a dynamic risk score between 0 and 100 instantly powered by edge-velocity and cyclic pattern matching."
            />

            <BentoCard
              delay={0.2}
              icon={Eye}
              title="Cycle Detection"
              text="Automatically trace circular logic networks where capital returns to its origin point, the definitive signature of layering."
            />

            <BentoCard
              className="md:col-span-3"
              delay={0}
              icon={FileJson}
              title="Compliance-Ready Output"
              text="Export generated intelligence networks, suspect graphs, and detected ring metadata into standardized JSON payloads instantly. Built for seamless integration downward into case management tools or federal reporting systems."
            />
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;