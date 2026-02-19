import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ForceGraph3D from "react-force-graph-3d";

const Analysis = () => {
  const [fullscreen, setFullscreen] = useState(false);
  const fgRef = useRef();

  /* ================= GRAPH DATA ================= */
  const generateGraphData = () => {
    const nodes = [];
    const links = [];
    const totalNodes = 80;

    for (let i = 0; i < totalNodes; i++) {
      nodes.push({
        id: `N${i}`,
        risk: Math.random() > 0.85 ? "high" : "low"
      });
    }

    for (let i = 0; i < totalNodes * 1.5; i++) {
      links.push({
        source: `N${Math.floor(Math.random() * totalNodes)}`,
        target: `N${Math.floor(Math.random() * totalNodes)}`
      });
    }

    return { nodes, links };
  };

  const graphDataRef = useRef(generateGraphData());

  /* ================= AUTO FIT ================= */
  useEffect(() => {
    if (fgRef.current) {
      setTimeout(() => {
        fgRef.current.zoomToFit(800, 80);
      }, 600);
    }
  }, []);

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

          <div className="flex gap-10 text-sm text-gray-400">
            <Link to="/dashboard" className="hover:text-emerald-400 transition">
              Dashboard
            </Link>
            <Link to="/upload" className="hover:text-emerald-400 transition">
              Upload CSV
            </Link>
          </div>

          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm">
            Download JSON Report
          </button>
        </div>
      </nav>


      {/* ================= MAIN ================= */}
      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="grid lg:grid-cols-4 gap-8">

          {/* ================= GRAPH AREA ================= */}
          <div className="lg:col-span-3 relative">

            <div
              className={`relative bg-[#0F0F0F] border border-white/10 rounded-3xl overflow-hidden ${
                fullscreen ? "fixed inset-6 z-50" : "min-h-[520px]"
              }`}
            >

              {/* Floating Stats */}
              <div className="absolute top-6 left-6 z-20 grid md:grid-cols-3 gap-4">
                <FloatingStat title="Total Analyzed" value="$1.42B" sub="+12.4%" />
                <FloatingStat title="Flagged Accounts" value="1,284" sub="CRITICAL" danger />
                <FloatingStat title="Processing Time" value="42ms" sub="Optimized" />
              </div>

              {/* Graph Controls */}
              <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
                <GraphButton
                  label="+"
                  onClick={() => {
                    const distance = fgRef.current.cameraPosition().z;
                    fgRef.current.cameraPosition({ z: distance / 1.2 }, undefined, 400);
                  }}
                />
                <GraphButton
                  label="−"
                  onClick={() => {
                    const distance = fgRef.current.cameraPosition().z;
                    fgRef.current.cameraPosition({ z: distance * 1.2 }, undefined, 400);
                  }}
                />
                <GraphButton
                  label="⤢"
                  onClick={() => setFullscreen(!fullscreen)}
                />
              </div>

              {/* Analysis Legend */}
              <div className="absolute bottom-6 left-6 z-20 bg-black/70 border border-white/10 rounded-xl p-4 text-xs text-gray-400 space-y-2">
                <p className="text-white text-sm mb-2">Analysis Legend</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                  Verified Personal Account
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  Flagged Shell Entity
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-white"></div>
                  Suspicious Flow
                </div>
              </div>

              {/* Fraud Ring Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  <div className="w-72 h-72 rounded-full border-2 border-red-500/60 animate-ping opacity-30"></div>
                  <div className="absolute inset-0 w-72 h-72 rounded-full border-2 border-red-500"></div>
                  <div className="absolute inset-6 w-60 h-60 rounded-full border border-red-500/40 border-dashed"></div>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-red-400 tracking-widest">
                    IDENTIFIED RING • ALPHA-9
                  </div>
                </div>
              </div>

              {/* 3D Graph */}
              <div className="w-full h-[520px]">
                <ForceGraph3D
                  ref={fgRef}
                  graphData={graphDataRef.current}
                  backgroundColor="#050505"
                  warmupTicks={100}
                  cooldownTicks={200}
                  d3AlphaDecay={0.03}
                  d3VelocityDecay={0.4}
                  nodeColor={(node) =>
                    node.risk === "high" ? "#ff3b3b" : "#10B981"
                  }
                  linkColor={() => "rgba(255,255,255,0.2)"}
                  linkWidth={0.5}
                  linkDirectionalParticles={1}
                  linkDirectionalParticleWidth={2}
                  linkDirectionalParticleColor={() => "#10B981"}
                  linkDirectionalParticleSpeed={0.003}
                  enableNodeDrag
                  enableNavigationControls
                  showNavInfo={false}
                />
              </div>

            </div>
          </div>

          {/* ================= RIGHT SIDE PANEL ================= */}
          {!fullscreen && (
            <div className="space-y-6">

              {/* Node Intelligence */}
              <div className="bg-[#0F0F0F] border border-white/10 rounded-2xl p-6 space-y-6">
                <h3 className="text-lg font-semibold">Node Intelligence</h3>

                <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      NODE_9942_X
                    </p>
                    <p className="text-xs text-gray-400">
                      San Francisco, CA
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-400">
                  <p>
                    <span className="text-white">Risk Level:</span>{" "}
                    <span className="text-red-500 font-semibold">
                      High Sensitivity
                    </span>
                  </p>
                  <p>
                    <span className="text-white">Inbound Flow:</span> $1.2M (48h)
                  </p>
                  <p>
                    <span className="text-white">Connections:</span> 142 Entities
                  </p>
                </div>
              </div>

              {/* Live Alerts */}
              <div className="bg-[#0F0F0F] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Live Alerts</h3>
                <div className="space-y-4 text-sm text-gray-400">
                  <div>
                    <p className="text-red-400 font-medium">
                      ▲ Rapid Flow Detected
                    </p>
                    <p className="text-xs">
                      24 high-velocity transactions detected in 60 seconds.
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-400 font-medium">
                      ● Graph Re-clustered
                    </p>
                    <p className="text-xs">
                      3 new potential rings identified.
                    </p>
                  </div>
                  <div>
                    <p className="text-emerald-400 font-medium">
                      ✔ Report Generated
                    </p>
                    <p className="text-xs">
                      Daily compliance snapshot ready.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ================= FRAUD RING SUMMARY ================= */}
        {!fullscreen && (
          <div className="mt-16 bg-[#0F0F0F] border border-white/10 rounded-2xl p-8">

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                Detailed Fraud Ring Summary
              </h3>

              <div className="flex gap-3">
                <button className="bg-blue-600 px-4 py-2 rounded-lg text-sm">
                  Export CSV
                </button>
                <button className="bg-white/10 px-4 py-2 rounded-lg text-sm">
                  Filter View
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="py-3">Ring ID</th>
                    <th>Members</th>
                    <th>Total Volume</th>
                    <th>Risk Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-white/5">
                    <td className="py-3 text-emerald-400 font-medium">
                      ALPHA-992
                    </td>
                    <td>24 Nodes</td>
                    <td>$12,492,000</td>
                    <td className="text-red-500 font-semibold">88%</td>
                    <td className="text-red-500">ACTIVE</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 text-emerald-400 font-medium">
                      BETA-102
                    </td>
                    <td>8 Nodes</td>
                    <td>$2,100,000</td>
                    <td>42%</td>
                    <td>Monitoring</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-emerald-400 font-medium">
                      GAMMA-SEC
                    </td>
                    <td>15 Nodes</td>
                    <td>$45,000,000</td>
                    <td className="text-red-500 font-semibold">96%</td>
                    <td className="text-red-500">CRITICAL</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};


/* ================= FLOATING STAT ================= */

const FloatingStat = ({ title, value, sub, danger }) => (
  <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 w-[200px]">
    <p className="text-xs text-gray-400 mb-1">{title}</p>
    <h3 className={`text-xl font-bold ${danger ? "text-red-500" : "text-white"}`}>
      {value}
    </h3>
    <p className="text-xs text-emerald-400">{sub}</p>
  </div>
);

/* ================= GRAPH BUTTON ================= */

const GraphButton = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="w-10 h-10 bg-black/60 border border-white/10 rounded-lg text-white hover:border-emerald-400 transition"
  >
    {label}
  </button>
);

export default Analysis;
