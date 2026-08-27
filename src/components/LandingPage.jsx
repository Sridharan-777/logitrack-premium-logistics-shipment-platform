import React, { useState } from "react";
import {
  ArrowRight,
  Search,
  Truck,
  Plane,
  ShieldCheck,
  Clock,
  Layers,
  Globe,
  Users,
  Sparkles,
  ChevronRight,
  Box,
  Zap,
} from "lucide-react";
import ThreeDCard from "./ThreeDCard";
import ThreeDTrackMap from "./ThreeDTrackMap";

export default function LandingPage({
  onNavigate,
  onSearchTrack,
  availableTrackingIds,
}) {
  const [trackId, setTrackId] = useState("");

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!trackId.trim()) return;
    const sanitizedId = trackId.trim().toUpperCase();
    onSearchTrack(sanitizedId);
  };

  const handleSampleTrackClick = (id) => {
    setTrackId(id);
    onSearchTrack(id);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* 3D Glassmorphic Navigation Bar */}
      <nav
        id="landing-navbar"
        className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl px-6 py-4 border-b border-slate-800 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-sky-600 to-blue-500 rounded-xl border border-sky-400/50 shadow-lg shadow-sky-500/20">
              <Truck className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-black tracking-wider text-white uppercase block leading-none bg-gradient-to-r from-white via-sky-200 to-sky-400 bg-clip-text text-transparent">
                LogiTrack 3D
              </span>
              <span className="block text-[10px] text-sky-400 font-bold uppercase tracking-widest mt-0.5">
                Next-Gen 3D Logistics Platform
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-300">
            <a href="#services" className="hover:text-sky-400 transition">
              3D Capabilities
            </a>
            <a href="#demo-3d" className="hover:text-sky-400 transition">
              Live Globe Engine
            </a>
            <a href="#stats" className="hover:text-sky-400 transition">
              Global Network
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-landing-login"
              onClick={() => onNavigate("login")}
              className="text-sm font-bold text-slate-200 hover:text-sky-400 transition px-3 py-2"
            >
              Sign In
            </button>
            <button
              id="btn-landing-dashboard"
              onClick={() => onNavigate("dashboard")}
              className="px-4 py-2 text-xs font-extrabold bg-slate-800 border border-slate-700 text-slate-200 rounded-xl hover:bg-slate-700 hover:border-sky-500/50 transition shadow-lg"
            >
              Dashboard
            </button>
            <button
              id="btn-landing-book-now"
              onClick={() => onNavigate("book-step1")}
              className="px-5 py-2.5 text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl shadow-lg shadow-amber-500/20 transition transform hover:scale-105 active:scale-95"
            >
              Book 3D Courier
            </button>
          </div>
        </div>
      </nav>

      {/* 3D Hero Section */}
      <section
        id="landing-hero"
        className="relative flex-1 flex flex-col justify-center items-center py-20 px-6 text-center border-b border-slate-800"
      >
        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-500/10 border border-sky-500/30 rounded-full text-xs font-bold text-sky-400 shadow-inner">
            <Sparkles className="h-4 w-4 text-sky-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>3D INTERACTIVE SHIPMENT & CARGO TRACKING</span>
          </div>

          <h1 className="text-4xl md:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Logistics in{" "}
            <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-amber-400 bg-clip-text text-transparent">
              3 Dimensions.
            </span>
            <br />
            <span className="text-slate-300 block text-2xl md:text-4xl font-bold mt-2">
              Real-Time Sat-Map Telemetry & Autonomous Routing.
            </span>
          </h1>

          <p className="text-slate-400 text-base md:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
            Experience next-generation logistics with our WebGL 3D Globe tracking engine,
            interactive 3D cargo inspection, and automated priority courier dispatch.
          </p>

          {/* Interactive Search Card */}
          <ThreeDCard className="max-w-2xl w-full mx-auto p-4 bg-slate-900/90 border border-slate-700/80 shadow-2xl rounded-3xl text-left">
            <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-4 h-5 w-5 text-sky-400" />
                <input
                  id="hero-track-id-input"
                  type="text"
                  placeholder="Enter Tracking ID (e.g. TRK-8924-M)"
                  value={trackId}
                  onChange={(e) => setTrackId(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-base text-slate-100 focus:outline-none focus:border-sky-500 placeholder-slate-500 font-mono"
                />
              </div>
              <button
                type="submit"
                id="btn-hero-track-shipment"
                className="px-6 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-sm font-extrabold rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-sky-500/25"
              >
                <span>Track 3D Route</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 font-medium">
              <span className="font-bold text-slate-300">Quick 3D Demo:</span>
              {availableTrackingIds.slice(0, 3).map((id) => (
                <button
                  key={id}
                  onClick={() => handleSampleTrackClick(id)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 font-mono font-bold rounded-lg transition"
                >
                  {id}
                </button>
              ))}
            </div>
          </ThreeDCard>

          {/* Action CTAs */}
          <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
            <button
              onClick={() => onNavigate("book-step1")}
              className="px-7 py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-base rounded-2xl flex items-center gap-2 shadow-xl shadow-sky-500/20 transform hover:-translate-y-0.5 transition"
            >
              <Box className="h-5 w-5" />
              <span>Book Courier with 3D Package Inspector</span>
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => onNavigate("dashboard")}
              className="px-7 py-4 bg-slate-900 border-2 border-slate-700 hover:border-sky-500 text-slate-200 hover:text-white font-extrabold text-base rounded-2xl transition shadow-lg"
            >
              Enter Control Terminal
            </button>
          </div>
        </div>
      </section>

      {/* Live GPS Map Interactive Showcase */}
      <section id="demo-3d" className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12 space-y-3">
          <span className="text-sky-400 bg-sky-500/10 border border-sky-500/30 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            HIGH-PRECISION LIVE GPS & SATELLITE ENGINE
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white">
            Real-Time Live GPS Logistics Tracking Map
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-base font-medium">
            Accurate coordinate mapping, high-definition satellite imagery, live waypoint telemetry, and animated carrier transit paths.
          </p>
        </div>

        <ThreeDTrackMap
          activeShipment={{
            id: "TRK-8924-M",
            senderCity: "Hamburg",
            receiverCity: "London",
            currentLocation: "Frankfurt Hub",
            speed: "Express",
            status: "In Transit",
          }}
        />
      </section>

      {/* 3D Bento Capabilities Grid */}
      <section id="services" className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16 space-y-3">
          <span className="text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Advanced Capabilities
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white">
            Next-Gen Logistics Engine
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ThreeDCard className="md:col-span-2 p-8 bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-3 bg-sky-500/10 rounded-2xl border border-sky-500/30 inline-block">
                <Clock className="h-7 w-7 text-sky-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Priority Same-Day 3D Dispatch</h3>
              <p className="text-slate-400 text-base leading-relaxed">
                Assign localized couriers on-demand with active temperature control, high-security smart cases, and instant telemetry updates directly on your 3D satellite map.
              </p>
            </div>
            <button
              onClick={() => onNavigate("book-step1")}
              className="mt-6 inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 font-extrabold text-sm"
            >
              <span>Book Priority Courier Now</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </ThreeDCard>

          <ThreeDCard className="p-8 bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/30 inline-block">
                <Plane className="h-7 w-7 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Global Air Freight</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Intercontinental priority slots with automated customs clearance and live parabolic flight paths.
              </p>
            </div>
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
              Overnight Global Reach
            </span>
          </ThreeDCard>

          <ThreeDCard className="p-8 bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 inline-block">
                <ShieldCheck className="h-7 w-7 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">High-Value Cargo Insurance</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Multi-layer insurance protection up to $5M USD with tamper-evident smart seal sensors.
              </p>
            </div>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
              Full Asset Coverage
            </span>
          </ThreeDCard>

          <ThreeDCard className="md:col-span-2 p-8 bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/30 inline-block">
                <Layers className="h-7 w-7 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Automated Customs & Manifest Engine</h3>
              <p className="text-slate-400 text-base leading-relaxed">
                Resolve customs holds in 1-click by uploading certified commercial invoices. Automatic timeline logging updates border authorities instantly.
              </p>
            </div>
            <button
              onClick={() => onNavigate("dashboard")}
              className="mt-6 inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-extrabold text-sm"
            >
              <span>Explore Dashboard Controls</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </ThreeDCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-12 px-6 text-slate-400 text-sm font-medium">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-sky-400" />
            <span className="font-extrabold text-white">LogiTrack 3D Platform</span>
            <span>&copy; {new Date().getFullYear()} LogiTrack Collective. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-xs font-bold text-slate-300">
            <a href="#landing-hero" className="hover:text-sky-400 transition">Privacy Shield</a>
            <a href="#landing-hero" className="hover:text-sky-400 transition">SLA Terms</a>
            <a href="#landing-hero" className="hover:text-sky-400 transition">3D API Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
