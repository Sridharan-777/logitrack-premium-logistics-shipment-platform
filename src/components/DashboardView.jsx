import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Truck,
  FileText,
  Plus,
  Globe,
  Zap,
  Radio,
} from "lucide-react";
import ThreeDCard from "./ThreeDCard";
import ThreeDTrackMap from "./ThreeDTrackMap";

function AnimatedNumber({ value, duration = 800 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const diff = value - start;
    if (diff === 0) {
      setDisplay(value);
      return;
    }
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setDisplay(Math.round(start + diff * progress));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);
  return <span className="block text-3xl font-black text-white font-mono">{display}</span>;
}

export default function DashboardView({
  shipments,
  notifications,
  onNavigate,
  onSelectShipment,
  onQuickActionResolveHold,
}) {
  const totalShipments = shipments.length;
  const transitCount = shipments.filter((s) => s.status === "In Transit").length;
  const pendingCount = shipments.filter((s) => s.status === "Pending").length;
  const deliveredCount = shipments.filter((s) => s.status === "Delivered").length;
  const holdCount = shipments.filter((s) => s.status === "Customs Hold").length;

  const stats = [
    {
      label: "Total Manifest",
      value: totalShipments,
      icon: Package,
      gradient: "from-sky-500/20 to-blue-500/20 text-sky-400 border-sky-500/30",
    },
    {
      label: "In 3D Transit",
      value: transitCount,
      icon: Truck,
      gradient: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30",
    },
    {
      label: "Customs Hold",
      value: holdCount,
      icon: AlertTriangle,
      gradient: "from-rose-500/20 to-amber-500/20 text-rose-400 border-rose-500/30",
    },
    {
      label: "Delivered",
      value: deliveredCount,
      icon: CheckCircle,
      gradient: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    },
  ];

  const firstActiveShipment = shipments.find((s) => s.status === "In Transit") || shipments[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Hero Welcome Card */}
      <ThreeDCard className="p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/80 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-xs font-black text-amber-300 uppercase tracking-wider">
              <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> 3D Logistics Telemetry Online
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
              3D Operations Control Terminal
            </h2>
            <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed">
              Real-time multi-carrier WebGL satellite map, 3D package inspector, and instant customs hold resolution engine.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              id="btn-dash-book-now"
              onClick={() => onNavigate("book-step1")}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl flex items-center gap-2 shadow-xl shadow-amber-500/20 transition transform hover:scale-105"
            >
              <Plus className="h-5 w-5 stroke-[3]" />
              <span>Book 3D Courier</span>
            </button>
            <button
              id="btn-dash-view-all"
              onClick={() => onNavigate("track-live")}
              className="px-6 py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm rounded-2xl flex items-center gap-2 shadow-xl shadow-sky-600/20 transition"
            >
              <Globe className="h-5 w-5" />
              <span>Track Live Sat-Map</span>
            </button>
          </div>
        </div>
      </ThreeDCard>

      {/* 3D Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <ThreeDCard key={i} className="p-6 bg-slate-900/90 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <AnimatedNumber value={stat.value} />
                </div>
                <div className={`p-3.5 rounded-2xl border bg-gradient-to-br ${stat.gradient}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </ThreeDCard>
          );
        })}
      </div>

      {/* Embedded Live GPS Satellite Map Widget */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Radio className="h-5 w-5 text-sky-400 animate-pulse" /> Active Live GPS Carrier Telemetry
          </h3>
          <button
            onClick={() => onNavigate("track-live")}
            className="text-xs font-extrabold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Full Screen Live Map</span> <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <ThreeDTrackMap activeShipment={firstActiveShipment} />
      </div>

      {/* Shipments Ledger & Quick Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white">Active Manifest Ledger</h3>
            <button
              onClick={() => onNavigate("my-shipments")}
              className="text-xs font-bold text-sky-400 hover:underline flex items-center gap-1"
            >
              View Full Ledger <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold text-xs uppercase">
                  <th className="py-3">Tracking ID</th>
                  <th className="py-3">Recipient</th>
                  <th className="py-3">Speed SLA</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 font-mono font-bold text-sky-300">{s.id}</td>
                    <td className="py-4 font-semibold text-slate-200">
                      <div>{s.receiverName}</div>
                      <div className="text-xs text-slate-500 font-mono">{s.receiverCity}</div>
                    </td>
                    <td className="py-4 font-mono text-xs font-bold text-amber-300">{s.speed}</td>
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                          s.status === "In Transit"
                            ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                            : s.status === "Delivered"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onSelectShipment(s.id, "track-live")}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition"
                        >
                          Track 3D
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational Notices */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-black text-white">Customs & Advisory Desk</h3>

            {shipments.some((s) => s.status === "Customs Hold") && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/40 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase">
                  <AlertTriangle className="h-4 w-4" /> UK Border Customs Hold
                </div>
                <p className="text-xs text-rose-200 font-medium">
                  Shipment TRK-900112-E is paused awaiting certified commercial invoice documentation.
                </p>
                <button
                  onClick={() => onQuickActionResolveHold("TRK-900112-E")}
                  className="w-full py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl text-xs transition"
                >
                  Resolve Customs Hold Now
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate("support")}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition"
          >
            <span>Open Support Advisory Desk</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
