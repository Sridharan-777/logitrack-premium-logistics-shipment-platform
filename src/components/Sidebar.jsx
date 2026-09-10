import React from "react";
import {
  LayoutDashboard,
  Truck,
  Package,
  MapPin,
  Bell,
  LifeBuoy,
  User,
  LogOut,
  ChevronRight,
  Globe,
  DollarSign,
  Fuel,
  Users,
  Briefcase,
  FileSpreadsheet,
  ShieldCheck,
  Award,
  Bike,
  CheckCircle2,
} from "lucide-react";
import { ROLES } from "../data/mockData";

export default function Sidebar({
  currentView,
  onNavigate,
  unreadNotifications,
  onLogout,
  user,
}) {
  const getInitials = (name) => {
    if (!name) return "SK";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const initials = user?.avatar || getInitials(user?.name);
  const systemRole = user?.systemRole || ROLES.USER;

  // Build role-tailored navigation items
  let menuItems = [];

  if (systemRole === ROLES.ADMIN) {
    menuItems = [
      { id: "dashboard", label: "Executive Control", icon: LayoutDashboard },
      { id: "profit-loss", label: "P&L Calculator (Admin)", icon: DollarSign, badgeText: "P&L" },
      { id: "fuel-tracker", label: "Fleet & Fuel Tracker", icon: Fuel },
      { id: "staff-management", label: "Staff & Workers CRUD", icon: Users },
      { id: "my-shipments", label: "Master Manifest & Editor", icon: Package },
      { id: "track-live", label: "Live GPS Sat-Map", icon: Globe },
      { id: "notifications", label: "Alert Board", icon: Bell, badge: unreadNotifications },
      { id: "support", label: "Advisory Desk", icon: LifeBuoy },
      { id: "profile", label: "Admin Profile", icon: User },
    ];
  } else if (systemRole === ROLES.STAFF) {
    menuItems = [
      { id: "staff-workspace", label: "Parcel Monitor & CRUD", icon: Briefcase, badgeText: "Active" },
      { id: "staff-salary", label: "My Salary & Earnings", icon: Award, badgeText: "Private" },
      { id: "fuel-tracker", label: "Log Trip Fuel & Fleet", icon: Fuel },
      { id: "my-shipments", label: "Manifest Ledger", icon: Package },
      { id: "track-live", label: "Live GPS Sat-Map", icon: Globe },
      { id: "notifications", label: "Alert Board", icon: Bell, badge: unreadNotifications },
      { id: "support", label: "Advisory Desk", icon: LifeBuoy },
      { id: "profile", label: "Staff Profile", icon: User },
    ];
  } else if (systemRole === ROLES.WORKER) {
    menuItems = [
      { id: "worker-workspace", label: "Doorstep Runs & Vehicle", icon: Bike, badgeText: "Field" },
      { id: "track-live", label: "Live GPS Sat-Map", icon: Globe },
      { id: "fuel-tracker", label: "Log EV / Fuel Telemetry", icon: Fuel },
      { id: "notifications", label: "Alert Board", icon: Bell, badge: unreadNotifications },
      { id: "support", label: "Field Courier Helpline", icon: LifeBuoy },
      { id: "profile", label: "Worker Profile", icon: User },
    ];
  } else {
    menuItems = [
      { id: "dashboard", label: "Dashboard Terminal", icon: LayoutDashboard },
      { id: "book-step1", label: "Book 3D Courier", icon: Truck },
      { id: "my-shipments", label: "Manifest Ledger", icon: Package },
      { id: "track-live", label: "Live GPS Sat-Map", icon: Globe },
      { id: "notifications", label: "Alert Board", icon: Bell, badge: unreadNotifications },
      { id: "support", label: "Advisory Desk", icon: LifeBuoy },
      { id: "profile", label: "Profile & Addresses", icon: User },
    ];
  }

  return (
    <aside
      id="app-sidebar"
      className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full md:translate-x-0 bg-slate-900/95 backdrop-blur-2xl text-slate-100 border-r border-slate-800 flex flex-col justify-between shadow-2xl"
    >
      {/* Brand Section */}
      <div className="p-6 border-b border-slate-800">
        <div
          onClick={() => onNavigate(systemRole === ROLES.STAFF ? "staff-workspace" : systemRole === ROLES.WORKER ? "worker-workspace" : "dashboard")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className={`p-2.5 rounded-xl border shadow-lg group-hover:scale-105 transition ${
            systemRole === ROLES.ADMIN
              ? "bg-gradient-to-tr from-emerald-600 to-teal-500 border-emerald-400/50 shadow-emerald-500/20"
              : systemRole === ROLES.STAFF
              ? "bg-gradient-to-tr from-purple-600 to-indigo-500 border-purple-400/50 shadow-purple-500/20"
              : systemRole === ROLES.WORKER
              ? "bg-gradient-to-tr from-amber-600 to-orange-500 border-amber-400/50 shadow-amber-500/20"
              : "bg-gradient-to-tr from-sky-600 to-blue-500 border-sky-400/50 shadow-sky-500/20"
          }`}>
            {systemRole === ROLES.WORKER ? (
              <Bike className="h-6 w-6 text-white" />
            ) : (
              <Truck className="h-6 w-6 text-white" />
            )}
          </div>
          <div>
            <span className="text-base font-black tracking-wider text-white uppercase block leading-none bg-gradient-to-r from-white via-sky-200 to-sky-400 bg-clip-text text-transparent">
              LogiTrack 3D
            </span>
            <span className={`block text-[10px] font-bold uppercase tracking-widest mt-1 ${
              systemRole === ROLES.ADMIN
                ? "text-emerald-400"
                : systemRole === ROLES.STAFF
                ? "text-purple-400"
                : systemRole === ROLES.WORKER
                ? "text-amber-400"
                : "text-sky-400"
            }`}>
              {systemRole === ROLES.ADMIN
                ? "Admin Console"
                : systemRole === ROLES.STAFF
                ? "Staff Console"
                : systemRole === ROLES.WORKER
                ? "Field Worker"
                : "Customer Portal"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-5 overflow-y-auto space-y-1.5 font-sans">
        <div className="text-[10px] font-mono font-bold text-slate-400 px-3 uppercase tracking-widest mb-3">
          {systemRole === ROLES.ADMIN
            ? "Executive Controls"
            : systemRole === ROLES.STAFF
            ? "Staff Operations"
            : systemRole === ROLES.WORKER
            ? "Doorstep Services"
            : "Client Services"}
        </div>

        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive =
            currentView === item.id ||
            (item.id === "book-step1" && currentView.startsWith("book-"));

          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? systemRole === ROLES.ADMIN
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-lg shadow-emerald-500/25 border border-emerald-400/40 font-black"
                    : systemRole === ROLES.STAFF
                    ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/25 border border-purple-400/40 font-black"
                    : systemRole === ROLES.WORKER
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/25 border border-amber-400/40 font-black"
                    : "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25 border border-sky-400/30"
                  : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <IconComponent
                  className={`h-4 w-4 ${
                    isActive
                      ? systemRole === ROLES.ADMIN || systemRole === ROLES.WORKER
                        ? "text-slate-950"
                        : "text-white"
                      : "text-slate-400 group-hover:text-white"
                  }`}
                />
                <span className="font-semibold">{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-500 text-slate-950 rounded-full font-mono">
                  {item.badge}
                </span>
              )}

              {item.badgeText && (
                <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded ${
                  isActive
                    ? "bg-black/30 text-white"
                    : "bg-slate-800 text-slate-300"
                }`}>
                  {item.badgeText}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Status Card & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 font-sans">
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 mb-2">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-xl font-black text-xs flex items-center justify-center border shadow-md ${
              systemRole === ROLES.ADMIN
                ? "bg-emerald-500 text-slate-950 border-emerald-400/50"
                : systemRole === ROLES.STAFF
                ? "bg-purple-500 text-white border-purple-400/50"
                : systemRole === ROLES.WORKER
                ? "bg-amber-500 text-slate-950 border-amber-400/50"
                : "bg-sky-500 text-slate-950 border-sky-400/50"
            }`}>
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white truncate max-w-[105px]">
                {user?.name || "Sridharan K"}
              </span>
              <span className="text-[10px] font-mono font-medium text-slate-400 truncate max-w-[105px]">
                {systemRole.toUpperCase()}
              </span>
            </div>
          </div>

          <button
            id="btn-sidebar-logout"
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
