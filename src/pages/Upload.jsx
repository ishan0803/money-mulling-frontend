import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, UploadCloud } from "lucide-react";
import { motion } from "framer-motion";


const UploadCSV = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);


  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
      setError("Only CSV files are allowed.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    handleFile(e.target.files[0]);
  };

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
            <span className="text-emerald-400 font-medium">
              Upload CSV
            </span>
          </div>

        </div>
      </nav>


      {/* ================= MAIN LAYOUT ================= */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-4 gap-10">

        {/* ================= LEFT PANEL ================= */}
        <div className="bg-[#0F0F0F] border border-white/10 rounded-2xl p-6 space-y-6">

          <h3 className="text-sm font-semibold text-gray-400 uppercase">
            Analysis Config
          </h3>

          <label className="flex items-center gap-3 text-gray-300">
            <input type="checkbox" className="accent-emerald-400" />
            Detect Cycles
          </label>

          <label className="flex items-center gap-3 text-gray-300">
            <input type="checkbox" defaultChecked className="accent-emerald-400" />
            High-Risk Entities Only
          </label>

          <label className="flex items-center gap-3 text-gray-300">
            <input type="checkbox" className="accent-emerald-400" />
            Auto-Flag Thresholds
          </label>

        </div>


        {/* ================= UPLOAD SECTION ================= */}
        <div className="lg:col-span-3">

          <div className="bg-[#0F0F0F] border border-white/10 rounded-2xl p-10">

            <h2 className="text-3xl font-bold mb-4">
              Upload the CSV file
            </h2>

            <p className="text-gray-400 mb-10">
              Upload your transaction ledger to reconstruct financial networks
              and detect hidden fraud patterns.
            </p>

            {/* Drag Drop Area */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-white/20 rounded-2xl p-16 text-center cursor-pointer hover:border-emerald-400 transition"
            >
              <UploadCloud size={40} className="mx-auto mb-6 text-emerald-400" />

              <p className="text-gray-300 mb-3">
                Drop transaction ledger (CSV) or browse files
              </p>

              <input
                type="file"
                accept=".csv"
                onChange={handleChange}
                className="hidden"
                id="fileUpload"
              />

              <label
                htmlFor="fileUpload"
                className="text-emerald-400 cursor-pointer hover:underline"
              >
                Browse Files
              </label>

              {file && (
                <p className="mt-6 text-emerald-400 font-medium">
                  Uploaded: {file.name}
                </p>
              )}

              {error && (
                <p className="mt-4 text-red-500">
                  {error}
                </p>
              )}
            </motion.div>


            {/* Buttons */}
            <div className="flex gap-6 mt-10">

              <button
  disabled={!file || loading}
  onClick={() => {
    if (!file) return;

    setLoading(true);

    setTimeout(() => {
      navigate("/analysis");
    }, 2500);
  }}
  className={`px-8 py-4 rounded-full font-semibold transition
    ${
      file
        ? "bg-emerald-400 text-black hover:scale-105"
        : "bg-gray-700 text-gray-400 cursor-not-allowed"
    }`}
>
  {loading ? "Analyzing..." : "Analyze Network"}
</button>


              <button
                onClick={() => {
                  setFile(null);
                  setError("");
                }}
                className="border border-white/20 px-8 py-4 rounded-full hover:border-emerald-400 hover:text-emerald-400 transition"
              >
                Clear Staging
              </button>

            </div>

          </div>


          {/* ================= DATA PREVIEW ================= */}
          {file && (
            <div className="mt-14 bg-[#0F0F0F] border border-white/10 rounded-2xl p-8">

              <h3 className="text-xl font-semibold mb-6">
                Staged Data Preview
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-gray-400 border-b border-white/10">
                    <tr>
                      <th className="py-3">Timestamp</th>
                      <th>Source</th>
                      <th>Destination</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-white/5">
                      <td className="py-3">2023-11-21</td>
                      <td>0x42a...f881</td>
                      <td>0xbc1...e092</td>
                      <td>$45,000</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3">2023-11-22</td>
                      <td>0x981...cc12</td>
                      <td>0x772...aa99</td>
                      <td>$1,240,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>
      </div>
      {loading && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
      <p className="text-white text-lg font-medium">
        Reconstructing Financial Network...
      </p>
    </div>
  </div>
)}
    </div>
  );
};

export default UploadCSV;
