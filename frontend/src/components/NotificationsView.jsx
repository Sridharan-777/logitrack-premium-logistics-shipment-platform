import React, { useState } from "react";
import {
  Bell,
  Check,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileText,
  Key,
  Clock,
  Zap,
  Filter,
} from "lucide-react";
import ThreeDCard from "./ThreeDCard";

export default function NotificationsView({
  notifications,
  onMarkAllRead,
  onToggleRead,
  onClearAll,
}) {
  const [activeTab, setActiveTab] = useState("All");

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "Unread") return !n.read;
    if (activeTab === "Updates") return n.type === "update";
    if (activeTab === "Billing") return n.type === "billing";
    return true; // All
  });

  const getIcon = (type, title) => {
    if (
      title.toLowerCase().includes("customs") ||
      title.toLowerCase().includes("delay") ||
      title.toLowerCase().includes("alert")
    ) {
      return <AlertTriangle className="h-5 w-5 text-rose-400" />;
    }
    if (type === "billing") {
      return <FileText className="h-5 w-5 text-amber-400" />;
    }
    if (
      title.toLowerCase().includes("api") ||
      title.toLowerCase().includes("security") ||
      title.toLowerCase().includes("key")
    ) {
      return <Key className="h-5 w-5 text-purple-400" />;
    }
    return <CheckCircle className="h-5 w-5 text-emerald-400" />;
  };

  const getIconBg = (type, title) => {
    if (
      title.toLowerCase().includes("customs") ||
      title.toLowerCase().includes("delay") ||
      title.toLowerCase().includes("alert")
    ) {
      return "bg-rose-500/10 border-rose-500/20";
    }
    if (type === "billing") {
      return "bg-amber-500/10 border-amber-500/20";
    }
    if (
      title.toLowerCase().includes("api") ||
      title.toLowerCase().includes("security") ||
      title.toLowerCase().includes("key")
    ) {
      return "bg-purple-500/10 border-purple-500/20";
    }
    return "bg-emerald-500/10 border-emerald-500/20";
  };

  const getBgColor = (read, title) => {
    if (!read) {
      if (
        title.toLowerCase().includes("customs") ||
        title.toLowerCase().includes("delay") ||
        title.toLowerCase().includes("alert")
      ) {
        return "bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40";
      }
      return "bg-sky-500/5 border-sky-500/20 hover:border-sky-500/40";
    }
    return "bg-slate-950/40 border-slate-800 hover:border-slate-700";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Zap className="h-6 w-6 text-amber-400" />
            Enterprise Alert Board
          </h2>
          <p className="text-sm text-slate-500 font-bold mt-1">
            Stored customs, courier, and invoicing notifications.
          </p>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={onMarkAllRead}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>Mark all read</span>
          </button>

          <button
            onClick={onClearAll}
            className="px-4 py-2.5 bg-slate-800 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/30 text-rose-400 text-sm font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear board</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <ThreeDCard className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-3 shadow-2xl">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "All", label: "All Alerts", count: notifications.length },
            {
              id: "Unread",
              label: "Unread",
              count: notifications.filter((n) => !n.read).length,
            },
            {
              id: "Updates",
              label: "Shipment Updates",
              count: notifications.filter((n) => n.type === "update").length,
            },
            {
              id: "Billing",
              label: "Billing & Account",
              count: notifications.filter((n) => n.type === "billing").length,
            },
          ].map((tab) => {
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-bold rounded-xl transition cursor-pointer ${
                  isSel
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {tab.label}{" "}
                <span
                  className={`font-mono text-xs ${isSel ? "text-sky-200" : "text-slate-600"}`}
                >
                  ({tab.count})
                </span>
              </button>
            );
          })}
        </div>
      </ThreeDCard>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((n) => {
            return (
              <div
                key={n.id}
                onClick={() => onToggleRead(n.id)}
                className={`p-4 border rounded-2xl flex items-start justify-between gap-4 transition duration-200 cursor-pointer ${getBgColor(n.read, n.title)}`}
              >
                <div className="flex gap-3">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${getIconBg(n.type, n.title)}`}>
                    {getIcon(n.type, n.title)}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-sm font-black ${n.read ? "text-slate-400" : "text-white"}`}
                      >
                        {n.title}
                      </h4>
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse"></span>
                      )}
                    </div>
                    <p className={`text-xs font-medium leading-relaxed max-w-2xl ${n.read ? "text-slate-600" : "text-slate-400"}`}>
                      {n.message}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-bold font-mono pt-0.5">
                      <Clock className="h-3 w-3" />
                      <span>{n.time}</span>
                    </div>
                  </div>
                </div>

                {/* Mark read action */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleRead(n.id);
                  }}
                  className={`p-2.5 rounded-xl hover:bg-slate-800 transition shrink-0 ${n.read ? "text-slate-700" : "text-sky-400"}`}
                  title={n.read ? "Mark as unread" : "Mark as read"}
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                </button>
              </div>
            );
          })
        ) : (
          <ThreeDCard className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl">
            <div className="p-16 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto">
                <Bell className="h-8 w-8 text-slate-600" />
              </div>
              <p className="text-base font-black text-white">
                No alerts found here.
              </p>
              <p className="text-sm text-slate-500 font-bold max-w-md mx-auto">
                All caught up! You will be notified of transit and invoice updates
                instantly.
              </p>
            </div>
          </ThreeDCard>
        )}
      </div>
    </div>
  );
}
