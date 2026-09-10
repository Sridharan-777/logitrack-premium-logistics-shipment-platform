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
  Download,
  DollarSign,
  Fuel,
  Users,
  Award,
} from "lucide-react";
import ThreeDCard from "./ThreeDCard";
import ThreeDTrackMap from "./ThreeDTrackMap";
import { exportShipmentsToExcel } from "../utils/exportUtils";
import { ROLES } from "../data/mockData";

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
  user,
}) {
  const totalShipments = shipments.length;
  const transitCount = shipments.filter((s) => s.status === "In Transit").length;
  const deliveredCount = shipments.filter((s) => s.status === "Delivered").length;
  const holdCount = shipments.filter((s) => s.status === "Customs Hold").length;

  const isAdmin = user?.systemRole === ROLES.ADMIN;
  const isStaff = user?.systemRole === ROLES.STAFF;

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
              <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              {isAdmin ? "Administrator Terminal Online" : isStaff ? "Operations Staff Console Online" : "3D Logistics Telemetry Online"}
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
              {isAdmin ? "Executive Logistics Operations Terminal" : "3D Operations Control Terminal"}
            </h2>
            <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed">
              {isAdmin
                ? "Oversee total freight revenues, run Profit & Loss calculations, monitor fleet fuel consumption, and audit all transmissions."
                : "Real-time multi-carrier WebGL satellite map, 3D package inspector, and instant customs hold resolution engine."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {isAdmin ? (
              <>
                <button
                  id="btn-dash-pl"
                  onClick={() => onNavigate("profit-loss")}
                  className="px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs md:text-sm rounded-2xl flex items-center gap-2 shadow-xl shadow-emerald-500/20 transition cursor-pointer"
                >
                  <DollarSign className="h-4.5 w-4.5 stroke-[2.5]" />
                  <span>P&amp;L Calculator</span>
                </button>
                <button
                  id="btn-dash-fuel"
                  onClick={() => onNavigate("fuel-tracker")}
                  className="px-5 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs md:text-sm rounded-2xl flex items-center gap-2 shadow-xl shadow-amber-500/20 transition cursor-pointer"
                >
                  <Fuel className="h-4.5 w-4.5 stroke-[2.5]" />
                  <span>Fleet Fuel Tracker</span>
                </button>
                <button
                  id="btn-dash-export"
                  onClick={() => exportShipmentsToExcel(shipments)}
                  className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs md:text-sm rounded-2xl flex items-center gap-2 border border-slate-700 transition cursor-pointer"
                >
                  <Download className="h-4.5 w-4.5" />
                  <span>Download Excel</span>
                </button>
              </>
            ) : isStaff ? (
              <>
                <button
                  onClick={() => onNavigate("staff-workspace")}
                  className="px-5 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs md:text-sm rounded-2xl flex items-center gap-2 shadow-xl transition cursor-pointer"
                >
                  <Truck className="h-4.5 w-4.5" />
                  <span>Customer Tasks</span>
                </button>
                <button
                  onClick={() => onNavigate("staff-salary")}
                  className="px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs md:text-sm rounded-2xl flex items-center gap-2 shadow-xl transition cursor-pointer"
                >
                  <Award className="h-4.5 w-4.5" />
                  <span>My Salary Statement</span>
                </button>
              </>
            ) : (
              <>
                <button
                  id="btn-dash-book-now"
                  onClick={() => onNavigate("book-step1")}
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl flex items-center gap-2 shadow-xl shadow-amber-500/20 transition transform hover:scale-105 cursor-pointer"
                >
                  <Plus className="h-5 w-5 stroke-[3]" />
                  <span>Book 3D Courier</span>
                </button>
                <button
                  id="btn-dash-view-all"
                  onClick={() => onNavigate("track-live")}
                  className="px-6 py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm rounded-2xl flex items-center gap-2 shadow-xl shadow-sky-600/20 transition cursor-pointer"
                >
                  <Globe className="h-5 w-5" />
                  <span>Track Live Sat-Map</span>
                </button>
              </>
            )}
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
            <span>Full Satellite View</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <ThreeDCard className="p-2 md:p-3 bg-slate-900/90 border border-slate-800 shadow-2xl rounded-3xl overflow-hidden min-h-[420px]">
          {firstActiveShipment ? (
            <ThreeDTrackMap shipment={firstActiveShipment} />
          ) : (
            <div className="h-96 flex items-center justify-center text-slate-400">
              No active shipment in transit.
            </div>
          )}
        </ThreeDCard>
      </div>

      {/* Recent Manifest Overview List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-white">Recent Transmission Ledger</h3>
          <div className="flex gap-2">
            <button
              onClick={() => exportShipmentsToExcel(shipments)}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => onNavigate("my-shipments")}
              className="text-xs font-extrabold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer ml-3"
            >
              <span>View All Manifests</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shipments.slice(0, 3).map((shipment) => (
            <ThreeDCard
              key={shipment.id}
              className="p-5 bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-xs text-sky-400">
                    {shipment.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      shipment.status === "In Transit"
                        ? "bg-sky-500/20 text-sky-300"
                        : shipment.status === "Delivered"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-rose-500/20 text-rose-300 animate-pulse"
                    }`}
                  >
                    {shipment.status}
                  </span>
                </div>

                <p className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <span>{shipment.senderCity}</span>
                  <ArrowRight className="h-3 w-3 text-sky-400" />
                  <strong className="text-white">{shipment.receiverCity}</strong>
                </p>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  Recipient: {shipment.receiverName} ({shipment.weight} kg)
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="text-[11px] font-mono text-amber-400 font-bold">
                  €{shipment.cost?.toFixed(2)}
                </span>
                <button
                  onClick={() => onSelectShipment(shipment.id, "track-live")}
                  className="text-xs font-bold text-sky-400 hover:text-sky-300 cursor-pointer"
                >
                  Track Live →
                </button>
              </div>
            </ThreeDCard>
          ))}
        </div>
      </div>
    </div>
  );
}
