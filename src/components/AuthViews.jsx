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
} from "lucide-react";

export function LoginView({ onNavigate, onLoginSuccess }) {
  const [email, setEmail] = useState("24104029@nec.edu.in");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(
        "Please enter a valid business email address (e.g., name@company.com).",
      );
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess("Sridharan K", email);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Left Column: Interactive Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24 bg-slate-950 relative z-10">
        <div className="max-w-md w-full mx-auto space-y-8 bg-slate-900/90 p-8 md:p-10 rounded-2xl border border-slate-800 shadow-xl">
          {/* Brand Logo Header */}
          <div
            onClick={() => onNavigate("landing")}
            className="flex items-center gap-3 cursor-pointer group w-fit"
          >
            <div className="p-2.5 bg-sky-500/15 rounded-lg border border-sky-500/30 group-hover:bg-sky-500/25 transition">
              <Truck className="h-6 w-6 text-sky-400" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              Logi<span className="text-sky-400">Track 3D</span>
            </span>
          </div>

          {/* Form Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Welcome back
            </h2>
            <p className="text-slate-400 text-base">
              Sign in to manage active shipments, book on-demand couriers, and
              view billing analytics.
            </p>
          </div>

          {/* Error Message Panel */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-300 text-sm animate-shake">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Authentication issue:</span>
                {error}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                className="text-base font-bold text-slate-200"
                htmlFor="login-email"
              >
                Business Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-base text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-all placeholder:text-slate-500 pl-icon-left"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  className="text-base font-bold text-slate-200"
                  htmlFor="login-password"
                >
                  Password
                </label>
                <button
                  type="button"
                  className="text-sm font-bold text-sky-400 hover:text-sky-300 hover:underline transition"
                  onClick={() =>
                    alert(
                      "Demo Feature: Password recovery request submitted to administration.",
                    )
                  }
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full pl-11 pr-11 py-3 bg-slate-950 border border-slate-800 rounded-xl text-base text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-all placeholder:text-slate-500 pl-icon-left pr-icon-right"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-sky-500/50 text-slate-950 text-base font-black rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-sky-500/20 border border-transparent focus:ring-2 focus:ring-sky-500/40"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Terminal</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Signup */}
          <p className="text-sm text-slate-400 text-center">
            Don't have an enterprise account?{" "}
            <button
              onClick={() => onNavigate("register")}
              className="font-bold text-sky-400 hover:text-sky-300 hover:underline transition cursor-pointer"
            >
              Register corporate account
            </button>
          </p>
        </div>
      </div>

      {/* Right Column: Dark themed testimonial panel */}
      <div className="hidden md:flex flex-1 relative bg-slate-900 items-center justify-center p-8">
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 to-slate-900 opacity-90"></div>
        <img
          src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800"
          alt="Cargo Distribution Logistics"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-10"
          referrerPolicy="no-referrer"
        />

        {/* Informative, Dark themed Testimonial */}
        <div className="relative z-10 max-w-md p-8 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center gap-2 text-sky-400 text-sm font-bold uppercase tracking-wider">
            <ShieldCheck className="h-5 w-5 text-sky-400" />
            <span>Frictionless Fleet Network</span>
          </div>
          <p className="text-base font-medium text-slate-300 leading-relaxed">
            "LogiTrack 3D handles our intercontinental medical distribution. Their
            on-time record is spotless, and the real-time API integrations
            reduced our operational friction by 40%."
          </p>
          <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
            <div className="h-10 w-10 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center font-bold text-sky-400 text-sm">
              MV
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Dr. Marcus Vance
              </p>
              <p className="text-xs text-slate-400">
                Global Health Labs, Director of Logistics
              </p>
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
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid business email.");
      return;
    }

    if (!company.trim()) {
      setError("Please enter your company or organization name.");
      return;
    }

    if (password.length < 8) {
      setError(
        "For security, enterprise passwords must be at least 8 characters long.",
      );
      return;
    }

    if (!agreeTerms) {
      setError(
        "You must agree to the Terms of Service & Privacy Protection Shield.",
      );
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(name, email);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Left Column: Form Registration Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24 bg-slate-950 relative z-10">
        <div className="max-w-md w-full mx-auto space-y-8 bg-slate-900/90 p-8 md:p-10 rounded-2xl border border-slate-800 shadow-xl">
          {/* Brand Logo Header */}
          <div
            onClick={() => onNavigate("landing")}
            className="flex items-center gap-3 cursor-pointer group w-fit"
          >
            <div className="p-2.5 bg-sky-500/15 rounded-lg border border-sky-500/30 group-hover:bg-sky-500/25 transition">
              <Truck className="h-6 w-6 text-sky-400" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              Logi<span className="text-sky-400">Track 3D</span>
            </span>
          </div>

          {/* Form Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Create an Account
            </h2>
            <p className="text-slate-400 text-base">
              Register a secure corporate dashboard workspace. Manage instant
              dispatches, track cargo lists, and control API configurations.
            </p>
          </div>

          {/* Error Message Panel */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-300 text-sm animate-shake">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Registration issue:</span>
                {error}
              </div>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <label
                className="text-base font-bold text-slate-200"
                htmlFor="reg-name"
              >
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <User className="h-5 w-5" />
                </span>
                <input
                  id="reg-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sridharan K"
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-base text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-all placeholder:text-slate-500 pl-icon-left"
                />
              </div>
            </div>

            {/* Business Email */}
            <div className="space-y-2">
              <label
                className="text-base font-bold text-slate-200"
                htmlFor="reg-email"
              >
                Business Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="24104029@nec.edu.in"
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-base text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-all placeholder:text-slate-500 pl-icon-left"
                />
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <label
                className="text-base font-bold text-slate-200"
                htmlFor="reg-company"
              >
                Company / Organization
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Truck className="h-5 w-5" />
                </span>
                <input
                  id="reg-company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Enterprise Inc."
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-base text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-all placeholder:text-slate-500 pl-icon-left"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                className="text-base font-bold text-slate-200"
                htmlFor="reg-password"
              >
                Security Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-base text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-all placeholder:text-slate-500 pl-icon-left"
                />
              </div>
            </div>

            {/* Terms check */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="reg-agree"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 h-5 w-5 rounded-sm border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500/20"
              />
              <label
                htmlFor="reg-agree"
                className="text-sm text-slate-400 leading-normal"
              >
                I agree to the{" "}
                <span className="text-sky-400 hover:underline cursor-pointer">
                  SLA Agreement
                </span>
                ,{" "}
                <span className="text-sky-400 hover:underline cursor-pointer">
                  Terms of Service
                </span>
                , and{" "}
                <span className="text-sky-400 hover:underline cursor-pointer">
                  Privacy Shield
                </span>
                .
              </label>
            </div>

            {/* Signup CTA */}
            <button
              id="btn-register-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-sky-500/50 text-slate-950 text-base font-black rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-sky-500/20 focus:ring-2 focus:ring-sky-500/40"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Create Enterprise Workspace</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <p className="text-sm text-slate-400 text-center">
            Already have an enterprise dashboard?{" "}
            <button
              onClick={() => onNavigate("login")}
              className="font-bold text-sky-400 hover:text-sky-300 hover:underline transition cursor-pointer"
            >
              Sign in to terminal
            </button>
          </p>
        </div>
      </div>

      {/* Right Column: Dark themed feature panel */}
      <div className="hidden md:flex flex-1 relative bg-slate-900 items-center justify-center p-8">
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 to-slate-900 opacity-95"></div>
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800"
          alt="LogiTrack Distribution Facility"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-10"
          referrerPolicy="no-referrer"
        />

        {/* Feature overlay cards */}
        <div className="relative z-10 max-w-sm p-8 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center gap-2 text-sky-400 text-sm font-bold uppercase tracking-wider">
            <CheckCircle className="h-5 w-5 text-sky-400" />
            <span>Secure Corporate Account</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Active Distribution Protection
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="p-1 bg-sky-500/15 rounded-md text-sky-400 shrink-0 h-fit mt-0.5 border border-sky-500/20">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  Full AES-256 Transport Encryption
                </p>
                <p className="text-xs text-slate-400 leading-normal">
                  Your physical transit schedules, addresses, and secure
                  documents are fully encrypted.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="p-1 bg-sky-500/15 rounded-md text-sky-400 shrink-0 h-fit mt-0.5 border border-sky-500/20">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  Instant API access and Sandbox Keys
                </p>
                <p className="text-xs text-slate-400 leading-normal">
                  Generate private developer access keys immediately upon
                  registration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
