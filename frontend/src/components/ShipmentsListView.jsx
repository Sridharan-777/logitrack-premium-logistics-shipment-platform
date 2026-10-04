import React, { useState } from "react";
import {
  Search,
  MapPin,
  AlertTriangle,
  Package,
  Scale,
  Globe,
  Download,
  Edit2,
  User,
  Fuel,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import ThreeDCard from "./ThreeDCard";
import { exportShipmentsToExcel } from "../utils/exportUtils";
import { ROLES } from "../data/mockData";

export default function ShipmentsListView({
  shipments,
  onSelectShipment,
  onQuickActionResolveHold,
  onEditShipment,
  user,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const isAdmin = user?.systemRole === ROLES.ADMIN;
  const isStaff = user?.systemRole === ROLES.STAFF;

  const filteredShipments = shipments.filter((s) => {
    const matchesSearch =
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.receiverCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.assignedStaffName && s.assignedStaffName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "All" || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    exportShipmentsToExcel(shipments);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Title & Stats Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Manifest Ledger Terminal
            {isAdmin && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Master Admin Mode
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Audit waybill registries, download transmission spreadsheets, and inspect live 3D routes.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={handleExport}
            id="btn-export-manifest-excel"
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition cursor-pointer"
          >
            <Download className="h-4 w-4 stroke-[2.5]" />
            <span>Download Excel Transmissions</span>
          </button>

          <div className="flex gap-2 text-xs font-mono">
            <div className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
              <span className="text-slate-400 font-bold">TOTAL:</span>{" "}
              <strong className="text-sky-300 font-extrabold">{shipments.length}</strong>
            </div>
            <div className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
              <span className="text-emerald-400 font-bold">IN TRANSIT:</span>{" "}
              <strong className="text-white font-extrabold">
                {shipments.filter((s) => s.status === "In Transit").length}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <ThreeDCard className="p-4 bg-slate-900/90 border border-slate-800 shadow-xl rounded-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {["All", "Pending", "In Transit", "Out for Delivery", "Delivered", "Customs Hold"].map((status) => {
              const isSel = statusFilter === status;
              const count =
                status === "All"
                  ? shipments.length
                  : shipments.filter((s) => s.status === status).length;

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-3.5 py-2 text-xs font-extrabold rounded-xl transition cursor-pointer ${
                    isSel
                      ? "bg-sky-500 border border-sky-400 text-slate-950 shadow-md shadow-sky-500/20"
                      : "bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {status} <span className="font-mono opacity-80">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="relative max-w-md w-full ml-auto">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sky-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              id="ledger-search-input"
              type="text"
              placeholder="Search ID, city, driver, recipient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-sky-500 placeholder-slate-500"
            />
          </div>
        </div>
      </ThreeDCard>

      {/* Ledger Cards */}
      <div className="space-y-4">
        {filteredShipments.length > 0 ? (
          filteredShipments.map((shipment) => (
            <ThreeDCard
              key={shipment.id}
              className="p-6 bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-base font-black font-mono text-sky-400">
                    {shipment.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-amber-300 border border-slate-700">
                    {shipment.speed}
                  </span>
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                      shipment.status === "In Transit"
                        ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                        : shipment.status === "Delivered"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : shipment.status === "Out for Delivery"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                    }`}
                  >
                    {shipment.status}
                  </span>

                  {shipment.assignedStaffName && (
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                      <User className="h-3.5 w-3.5 text-sky-400" />
                      <span>Driver: <strong className="text-slate-200">{shipment.assignedStaffName}</strong></span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-sky-400" />
                    <span>
                      {shipment.senderCity} ➔ <strong className="text-white">{shipment.receiverCity}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <Scale className="h-4 w-4 text-amber-400" />
                    <span>{shipment.weight} kg</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Package className="h-4 w-4 text-purple-400" />
                    <span>{shipment.category}</span>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-2 font-mono text-[11px] bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      <span className="text-emerald-400 font-bold">€{shipment.cost?.toFixed(2)}</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-amber-400">Fuel: €{shipment.fuelExpense?.toFixed(1) || 0}</span>
                    </div>
                  )}
                </div>

                {shipment.customerNeeds && (
                  <p className="text-xs text-slate-400 italic line-clamp-1">
                    Customer Note: "{shipment.customerNeeds}"
                  </p>
                )}
              </div>

              {shipment.status === "Customs Hold" && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/40 rounded-xl flex items-center gap-2 text-rose-300 text-xs font-bold">
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>Customs Hold - Document Audit Required</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {isAdmin && (
                  <button
                    onClick={() => onEditShipment(shipment)}
                    className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    title="Edit Shipment Parameters"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit Data</span>
                  </button>
                )}

                {shipment.status === "Customs Hold" ? (
                  <button
                    onClick={() => onQuickActionResolveHold(shipment.id)}
                    className="px-4 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs rounded-xl transition shadow-lg shadow-rose-500/20 cursor-pointer"
                  >
                    Resolve Issue
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectShipment(shipment.id, "track-live")}
                    className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl transition shadow-lg shadow-sky-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Globe className="h-4 w-4" /> Live Map
                  </button>
                )}

                <button
                  onClick={() => onSelectShipment(shipment.id, "shipment-details")}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs rounded-xl transition cursor-pointer"
                >
                  Details
                </button>
              </div>
            </ThreeDCard>
          ))
        ) : (
          <div className="p-12 text-center bg-slate-900/90 border border-slate-800 rounded-3xl text-slate-400">
            <Package className="h-12 w-12 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-bold text-white">No manifest lines match your filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
