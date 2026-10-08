import React, { useState } from "react";
import {
  Truck,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Eye,
  EyeOff,
  AlertCircle,
  Building,
  Sparkles,
  Users,
  KeyRound,
  Bike,
} from "lucide-react";
import { ROLES, INITIAL_USERS } from "../data/mockData";
import apiClient from "../api/client.js";
import GoogleSignInButton from "./GoogleSignInButton.jsx";

const googleSignInConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim());
const demoLoginEnabled = import.meta.env.VITE_ENABLE_DEMO_LOGIN === "true";

export function LoginView({ onNavigate, onLoginSuccess }) {
  const [activeRoleTab, setActiveRoleTab] = useState(ROLES.USER); // 'admin', 'staff', 'worker', 'user'
  const [email, setEmail] = useState(demoLoginEnabled ? "sridharan@logitrack.test" : "");
  const [password, setPassword] = useState(demoLoginEnabled ? "Customer@123" : "");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleTabSelect = (role) => {
    setActiveRoleTab(role);
    setError("");
    if (!demoLoginEnabled) {
      setEmail("");
      setPassword("");
    } else if (role === ROLES.ADMIN) {
      setEmail("admin@logitrack.test");
      setPassword("Admin@123");
    } else if (role === ROLES.STAFF) {
      setEmail("alex.rivera@logitrack.test");
      setPassword("Staff@123");
    } else if (role === ROLES.WORKER) {
      setEmail("rahul.worker@logitrack.test");
      setPassword("Worker@123");
    } else {
      setEmail("sridharan@logitrack.test");
      setPassword("Customer@123");
    }
  };

  const handleQuickDemoLogin = async (role) => {
    const credentials = {
      [ROLES.ADMIN]: ["admin@logitrack.test", "Admin@123"],
      [ROLES.STAFF]: ["alex.rivera@logitrack.test", "Staff@123"],
      [ROLES.WORKER]: ["rahul.worker@logitrack.test", "Worker@123"],
      [ROLES.USER]: ["sridharan@logitrack.test", "Customer@123"],
    };
    setLoading(true);
    setError("");
    try {
      const result = await apiClient.login(...credentials[role]);
      onLoginSuccess(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address (e.g. name@company.com).");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const result = await apiClient.login(email, password);
      const backendRole = result.user.role === "CUSTOMER" ? ROLES.USER : result.user.role.toLowerCase();
      if (backendRole !== activeRoleTab) {
        apiClient.setToken(null);
        throw new Error(`This account belongs to the ${result.user.role.toLowerCase()} workspace. Select the matching role tab.`);
      }
      onLoginSuccess(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Left Column: Interactive Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-20 bg-slate-950 relative z-10">
        <div className="max-w-md w-full mx-auto space-y-6 bg-slate-900/90 p-8 md:p-9 rounded-3xl border border-slate-800 shadow-2xl">
          {/* Brand Logo Header */}
          <div
            onClick={() => onNavigate("landing")}
            className="flex items-center gap-3 cursor-pointer group w-fit"
          >
            <div className="p-2.5 bg-sky-500/15 rounded-xl border border-sky-500/30 group-hover:bg-sky-500/25 transition">
              <Truck className="h-6 w-6 text-sky-400" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              Logi<span className="text-sky-400">Track 3D</span>
            </span>
          </div>

          {/* Form Header */}
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Sign in to your workspace
            </h2>
            <p className="text-slate-400 text-xs">
              Secure access for customers, supervisors, couriers, and administrators.
            </p>
          </div>

          {/* 4 Role Selector Tabs */}
          <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleRoleTabSelect(ROLES.USER)}
              className={`py-2 px-1 rounded-xl text-[11px] font-black transition flex flex-col items-center gap-1 cursor-pointer ${
                activeRoleTab === ROLES.USER
                  ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Customer</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabSelect(ROLES.WORKER)}
              className={`py-2 px-1 rounded-xl text-[11px] font-black transition flex flex-col items-center gap-1 cursor-pointer ${
                activeRoleTab === ROLES.WORKER
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Bike className="h-3.5 w-3.5" />
              <span>Worker</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabSelect(ROLES.STAFF)}
              className={`py-2 px-1 rounded-xl text-[11px] font-black transition flex flex-col items-center gap-1 cursor-pointer ${
                activeRoleTab === ROLES.STAFF
                  ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Staff</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabSelect(ROLES.ADMIN)}
              className={`py-2 px-1 rounded-xl text-[11px] font-black transition flex flex-col items-center gap-1 cursor-pointer ${
                activeRoleTab === ROLES.ADMIN
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin</span>
            </button>
          </div>

          {/* 1-Click Quick Demo Login Row */}
          {demoLoginEnabled && <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span className="flex items-center gap-1 text-sky-300">
                <Sparkles className="h-3 w-3 text-sky-400" /> 1-Click Instant Demo Login
              </span>
              <span className="text-[10px] text-amber-400 uppercase font-mono">No Pass Required</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin(ROLES.USER)}
                className="py-1.5 px-1.5 bg-sky-500/10 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 rounded-xl text-[10px] font-extrabold transition cursor-pointer"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin(ROLES.WORKER)}
                className="py-1.5 px-1.5 bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-xl text-[10px] font-extrabold transition cursor-pointer"
              >
                2-Wheeler Worker
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin(ROLES.STAFF)}
                className="py-1.5 px-1.5 bg-purple-500/10 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 rounded-xl text-[10px] font-extrabold transition cursor-pointer"
              >
                Staff Ops
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin(ROLES.ADMIN)}
                className="py-1.5 px-1.5 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl text-[10px] font-extrabold transition cursor-pointer"
              >
                Master Admin
              </button>
            </div>
          </div>}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">
                {activeRoleTab === ROLES.ADMIN
                  ? "Admin Security Email"
                  : activeRoleTab === ROLES.WORKER
                  ? "Field Worker / Two-Wheeler Courier Email"
                  : activeRoleTab === ROLES.STAFF
                  ? "Staff Supervisor Email"
                  : "Customer Email Address"}
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute inset-y-0 left-3.5 my-auto text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-300">Password</label>
                <span className="text-[10px] text-sky-400">Use the seeded role credential</span>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 absolute inset-y-0 left-3.5 my-auto text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-slate-950 text-xs md:text-sm font-black rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
                activeRoleTab === ROLES.ADMIN
                  ? "bg-emerald-400 hover:bg-emerald-300 shadow-emerald-500/20"
                  : activeRoleTab === ROLES.WORKER
                  ? "bg-amber-400 hover:bg-amber-300 shadow-amber-500/20"
                  : activeRoleTab === ROLES.STAFF
                  ? "bg-purple-400 hover:bg-purple-300 shadow-purple-500/20"
                  : "bg-sky-400 hover:bg-sky-300 shadow-sky-500/20"
              }`}
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>
                    Sign In as{" "}
                    {activeRoleTab === ROLES.ADMIN
                      ? "Administrator"
                      : activeRoleTab === ROLES.WORKER
                      ? "Field Delivery Worker"
                      : activeRoleTab === ROLES.STAFF
                      ? "Staff Supervisor"
                      : "Customer"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {googleSignInConfigured && (
            <>
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500"><span className="h-px flex-1 bg-slate-700" />or<span className="h-px flex-1 bg-slate-700" /></div>
              <GoogleSignInButton onSuccess={onLoginSuccess} onError={setError} />
            </>
          )}

          <p className="text-xs text-slate-400 text-center">
            New to LogiTrack 3D?{" "}
            <button
              onClick={() => onNavigate("register")}
              className="font-bold text-sky-400 hover:underline"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>

      {/* Right Column: Role Architecture */}
      <div className="hidden md:flex flex-1 relative bg-slate-900 items-center justify-center p-8">
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 to-slate-900 opacity-90"></div>
        <div className="relative z-10 max-w-md p-8 bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="h-5 w-5 text-sky-400" />
            <span>4-Tier Integrated Logistics Architecture</span>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="font-black text-emerald-400 block mb-0.5">Administrator:</span>
              <span>Full Master CRUD on Users, Workers, Staff, Shipments, Fleet; live Profit &amp; Loss Calculator and Excel exports.</span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="font-black text-purple-400 block mb-0.5">Staff Supervisor:</span>
              <span>Monitors parcel data &amp; customer receipt status, triggers rapid two-wheeler redeliveries, and performs CRUD on workers and users.</span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="font-black text-amber-400 block mb-0.5">Doorstep Delivery Worker:</span>
              <span>Reports transport vehicle (Two-Wheeler EV Scooter / Bike / Van), executes doorstep deliveries, and captures customer signatures.</span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="font-black text-sky-400 block mb-0.5">Customer / Client:</span>
              <span>On-demand 3D package booking, live GPS map tracking, and instant delivery receipt confirmations.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RegisterView({ onNavigate, onLoginSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || password.length < 8) {
      setError("Please fill in all fields (password min 8 chars).");
      return;
    }
    setLoading(true);
    try {
      const result = await apiClient.register({ name, email, password, company });
      onLoginSuccess(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24 bg-slate-950 relative z-10">
        <div className="max-w-md w-full mx-auto space-y-6 bg-slate-900/90 p-8 md:p-10 rounded-3xl border border-slate-800 shadow-2xl">
          <div
            onClick={() => onNavigate("landing")}
            className="flex items-center gap-3 cursor-pointer group w-fit"
          >
            <div className="p-2.5 bg-sky-500/15 rounded-xl border border-sky-500/30 group-hover:bg-sky-500/25 transition">
              <Truck className="h-6 w-6 text-sky-400" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              Logi<span className="text-sky-400">Track 3D</span>
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black text-white">
              Create Your Profile
            </h2>
            <p className="text-xs text-slate-400">
              Your account is stored in MongoDB. Use a strong, unique password.
            </p>
          </div>

          <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-xs text-sky-200">
            Public registration creates a Customer account. Staff, worker, and administrator accounts are provisioned securely by an administrator.
          </div>

          {error && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold rounded-xl">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sridharan K / Rahul Sharma"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Company / Affiliation</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="National Engineering College"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs md:text-sm font-black rounded-xl transition cursor-pointer shadow-lg shadow-sky-500/20 mt-2"
            >
              {loading ? "Creating..." : "Create Account & Enter"}
            </button>
          </form>

          {googleSignInConfigured && (
            <>
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500"><span className="h-px flex-1 bg-slate-700" />or<span className="h-px flex-1 bg-slate-700" /></div>
              <GoogleSignInButton onSuccess={onLoginSuccess} onError={setError} />
            </>
          )}

          <p className="text-xs text-slate-400 text-center">
            Already registered?{" "}
            <button onClick={() => onNavigate("login")} className="font-bold text-sky-400 hover:underline">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
