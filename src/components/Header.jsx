import React, { useState } from "react";
import {
  Search,
  Menu,
  Bell,
  HelpCircle,
  Clock,
  Zap,
  Sun,
  Moon,
  Palette,
  ShieldCheck,
  Truck,
  User,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { ROLES, INITIAL_USERS } from "../data/mockData";

export default function Header({
  title,
  onSearchShipment,
  onNavigate,
  unreadNotifications,
  user,
  theme,
  onToggleTheme,
  onSwitchRole,
}) {
  const [searchVal, setSearchVal] = useState("");
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const systemRole = user?.systemRole || ROLES.USER;

  const getInitials = (name) => {
    if (!name) return "SK";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const initials = user?.avatar || getInitials(user?.name);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      onSearchShipment(searchVal.trim());
    }
  };

  const getTodayString = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const themes = [
    { id: "dark", label: "Midnight Dark", icon: Moon, color: "from-slate-600 to-slate-800", accent: "text-sky-400" },
    { id: "light", label: "Crystal Light", icon: Sun, color: "from-amber-400 to-orange-400", accent: "text-amber-500" },
    { id: "cyber", label: "Cyber Neon", icon: Zap, color: "from-purple-500 to-pink-500", accent: "text-purple-400" },
  ];

  const currentTheme = themes.find((t) => t.id === theme) || themes[0];
  const ThemeIcon = currentTheme.icon;

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl px-4 md:px-8 shadow-2xl font-sans"
    >
      {/* Left side: Mobile Hamburger and Title */}
      <div className="flex items-center gap-4">
        <button
          id="btn-mobile-sidebar-toggle"
          onClick={() => {
            const sidebar = document.getElementById("app-sidebar");
            if (sidebar) {
              sidebar.classList.toggle("-translate-x-full");
            }
          }}
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 md:hidden cursor-pointer"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <h1 className="text-lg md:text-xl font-black text-white tracking-tight flex items-center gap-2">
            {title}
          </h1>

          {/* Active Role Badge with Switcher Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition cursor-pointer ${
                systemRole === ROLES.ADMIN
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                  : systemRole === ROLES.STAFF
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                  : "bg-sky-500/20 text-sky-300 border-sky-500/40 hover:bg-sky-500/30"
              }`}
              title="Click to quickly switch roles"
            >
              {systemRole === ROLES.ADMIN ? (
                <>
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  <span>Admin Mode</span>
                </>
              ) : systemRole === ROLES.STAFF ? (
                <>
                  <Truck className="h-3 w-3 text-amber-400" />
                  <span>Staff Mode</span>
                </>
              ) : (
                <>
                  <User className="h-3 w-3 text-sky-400" />
                  <span>Customer Mode</span>
                </>
              )}
              <ChevronDown className="h-3 w-3 ml-0.5 opacity-70" />
            </button>

            {showRoleMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowRoleMenu(false)}></div>
                <div className="absolute left-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in p-2 space-y-1">
                  <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Switch Role Terminal
                    </span>
                    <Sparkles className="h-3 w-3 text-amber-400" />
                  </div>

                  <button
                    onClick={() => {
                      onSwitchRole(ROLES.ADMIN);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                      systemRole === ROLES.ADMIN
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      👑
                    </div>
                    <div>
                      <span className="block font-black text-white">Administrator</span>
                      <span className="text-[10px] text-slate-400">P&amp;L Calculator, Fuel &amp; Payroll</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSwitchRole(ROLES.STAFF);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                      systemRole === ROLES.STAFF
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div className="h-6 w-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      👷
                    </div>
                    <div>
                      <span className="block font-black text-white">Operations Staff</span>
                      <span className="text-[10px] text-slate-400">Parcel Audit &amp; Dispatch CRUD</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSwitchRole(ROLES.WORKER);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                      systemRole === ROLES.WORKER
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div className="h-6 w-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      🛵
                    </div>
                    <div>
                      <span className="block font-black text-white">Field Delivery Worker</span>
                      <span className="text-[10px] text-slate-400">Two-Wheeler &amp; Doorstep Runs</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSwitchRole(ROLES.USER);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                      systemRole === ROLES.USER
                        ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div className="h-6 w-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                      👤
                    </div>
                    <div>
                      <span className="block font-black text-white">Customer User</span>
                      <span className="text-[10px] text-slate-400">3D Booking &amp; Live Tracking</span>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Center: Search Bar */}
      <form
        onSubmit={handleSubmit}
        className="hidden sm:flex max-w-md w-full mx-6"
      >
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-sky-400">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            id="header-shipment-search-input"
            type="text"
            placeholder="Search Waybill Code (e.g. TRK-8924-M)..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-10 pr-16 py-2 border border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-100 bg-slate-950 focus:border-sky-500 outline-none transition-all placeholder-slate-500"
          />
          {searchVal && (
            <button
              type="submit"
              className="absolute right-1.5 top-1 px-3 py-1 text-xs font-bold text-slate-950 bg-sky-400 rounded-lg hover:bg-sky-300 transition cursor-pointer"
            >
              Track
            </button>
          )}
        </div>
      </form>

      {/* Right side: Quick Info & Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold text-sky-400 font-mono">
          <Clock className="h-3.5 w-3.5 text-sky-400" />
          <span>{getTodayString()}</span>
        </div>

        {/* Theme Switcher */}
        <div className="relative">
          <button
            id="btn-theme-toggle"
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer relative group"
            title="Switch Theme"
          >
            <ThemeIcon className={`h-5 w-5 transition-transform group-hover:rotate-12 ${currentTheme.accent}`} />
          </button>

          {showThemeMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowThemeMenu(false)}></div>
              <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-fade-in">
                <div className="p-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-sky-400" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">Appearance</span>
                  </div>
                </div>
                <div className="p-2 space-y-1">
                  {themes.map((t) => {
                    const Icon = t.icon;
                    const isActive = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          onToggleTheme(t.id);
                          setShowThemeMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                          isActive
                            ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent"
                        }`}
                      >
                        <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center shadow-inner`}>
                          <Icon className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span>{t.label}</span>
                        {isActive && (
                          <span className="ml-auto text-sky-400 text-[10px] font-black uppercase tracking-wider">Active</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => onNavigate("support")}
          className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title="Help Center"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        <button
          onClick={() => onNavigate("notifications")}
          className="relative rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title="Alerts"
        >
          <Bell className="h-5 w-5" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          )}
        </button>

        <button
          onClick={() => onNavigate("profile")}
          className="flex items-center gap-2 pl-2 border-l border-slate-800 cursor-pointer"
        >
          <div className={`h-9 w-9 rounded-xl text-white flex items-center justify-center font-extrabold text-xs border shadow-lg ${
            systemRole === ROLES.ADMIN
              ? "bg-gradient-to-tr from-emerald-600 to-teal-500 border-emerald-400/40 shadow-emerald-500/20"
              : systemRole === ROLES.STAFF
              ? "bg-gradient-to-tr from-amber-600 to-orange-500 border-amber-400/40 shadow-amber-500/20"
              : "bg-gradient-to-tr from-sky-600 to-blue-500 border-sky-400/40 shadow-sky-500/20"
          }`}>
            {initials}
          </div>
        </button>
      </div>
    </header>
  );
}
