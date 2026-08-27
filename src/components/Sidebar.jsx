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
} from "lucide-react";

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

  const menuItems = [
    { id: "dashboard", label: "Dashboard Terminal", icon: LayoutDashboard },
    { id: "book-step1", label: "Book 3D Courier", icon: Truck },
    { id: "my-shipments", label: "Manifest Ledger", icon: Package },
    { id: "track-live", label: "Live GPS Sat-Map", icon: Globe },
    {
      id: "notifications",
      label: "Alert Board",
      icon: Bell,
      badge: unreadNotifications,
    },
    { id: "support", label: "Advisory Desk", icon: LifeBuoy },
    { id: "profile", label: "Profile & Addresses", icon: User },
  ];

  return (
    <aside
      id="app-sidebar"
      className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full md:translate-x-0 bg-slate-900/95 backdrop-blur-2xl text-slate-100 border-r border-slate-800 flex flex-col justify-between shadow-2xl"
    >
      {/* Brand Section */}
      <div className="p-6 border-b border-slate-800">
        <div
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="p-2.5 bg-gradient-to-tr from-sky-600 to-blue-500 rounded-xl border border-sky-400/50 shadow-lg shadow-sky-500/20 group-hover:scale-105 transition">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-base font-black tracking-wider text-white uppercase block leading-none bg-gradient-to-r from-white via-sky-200 to-sky-400 bg-clip-text text-transparent">
              LogiTrack 3D
            </span>
            <span className="block text-[10px] text-sky-400 font-bold uppercase tracking-widest mt-0.5">
              3D Logistics Collective
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-6 overflow-y-auto space-y-1.5 font-sans">
        <div className="text-[10px] font-mono font-bold text-slate-400 px-3 uppercase tracking-widest mb-3">
          3D Operations Engine
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
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25 border border-sky-400/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <IconComponent
                  className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-white animate-pulse" : "text-sky-400"}`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && item.badge > 0 ? (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-400 text-slate-950 rounded-full animate-bounce">
                  {item.badge}
                </span>
              ) : isActive ? (
                <ChevronRight className="h-4 w-4 text-white" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* User Profile & Sign Out */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80">
        <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-2xl border border-slate-800 mb-3 shadow-md">
          <div className="relative shrink-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white flex items-center justify-center font-extrabold text-xs border border-sky-400/40">
              {initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-400 rounded-full border-2 border-slate-900"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-extrabold text-white truncate">
              {user?.name || "Sridharan K"}
            </h4>
            <span className="block text-[10px] font-bold text-sky-400 truncate mt-0.5">
              {user?.role || "Developer & Operations"}
            </span>
          </div>
        </div>

        <button
          id="btn-sidebar-logout"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/30 rounded-xl transition"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
