import { Link } from "react-router-dom";
import { Shield, Mail, Lock, User } from "lucide-react";
import { motion } from "framer-motion";

const Signup = () => {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/bg.gif"
          alt="background"
          className="w-full h-full object-cover opacity-40 brightness-110"
        />
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-emerald-400" size={22} />
            <span className="text-lg font-semibold">
              Forensics<span className="text-emerald-400">Engine</span>
            </span>
          </div>

          <Link
            to="/login"
            className="text-sm text-gray-400 hover:text-emerald-400 transition"
          >
            Back to Login
          </Link>
        </div>
      </nav>

      {/* SIGNUP CARD */}
      <div className="relative z-10 flex items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md bg-[#0F0F0F] border border-white/10 rounded-3xl p-10 shadow-[0_0_80px_rgba(16,185,129,0.08)]"
        >

          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold">
              Create Investigator Account
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              Register for secure forensic access
            </p>
          </div>

          {/* Name */}
          <div className="mb-6">
            <label className="text-xs text-gray-400 uppercase tracking-wide">
              Full Name
            </label>
            <div className="mt-2 flex items-center bg-black border border-white/10 rounded-xl px-4 py-3 focus-within:border-emerald-400 transition">
              <User size={16} className="text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="John Investigator"
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="text-xs text-gray-400 uppercase tracking-wide">
              Work Email
            </label>
            <div className="mt-2 flex items-center bg-black border border-white/10 rounded-xl px-4 py-3 focus-within:border-emerald-400 transition">
              <Mail size={16} className="text-gray-400 mr-3" />
              <input
                type="email"
                placeholder="name@firm.com"
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-8">
            <label className="text-xs text-gray-400 uppercase tracking-wide">
              Password
            </label>
            <div className="mt-2 flex items-center bg-black border border-white/10 rounded-xl px-4 py-3 focus-within:border-emerald-400 transition">
              <Lock size={16} className="text-gray-400 mr-3" />
              <input
                type="password"
                placeholder="••••••••"
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>
          </div>

          {/* Signup Button */}
          <button className="w-full bg-emerald-400 text-black py-3 rounded-xl font-semibold hover:scale-[1.02] transition">
            Create Account
          </button>

          {/* Already have account */}
          <p className="text-center text-sm text-gray-500 mt-8">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-emerald-400 hover:underline"
            >
              Sign In
            </Link>
          </p>

        </motion.div>
      </div>

    </div>
  );
};

export default Signup;
