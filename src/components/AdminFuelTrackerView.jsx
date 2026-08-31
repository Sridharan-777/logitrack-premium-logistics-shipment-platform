import React, { useState } from "react";
import {
  Fuel,
  Truck,
  Zap,
  Download,
  Plus,
  Gauge,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  X,
  Search,
  Filter,
} from "lucide-react";
import ThreeDCard from "./ThreeDCard";
import { exportFuelLogsToExcel } from "../utils/exportUtils";

export default function AdminFuelTrackerView({
  fleet,
  fuelLogs,
  onAddFuelLog,
  staffList,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVehicle, setFilterVehicle] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  // New fuel log form state
  const [newLog, setNewLog] = useState({
    vehicleId: fleet[0]?.id || "VEH-01",
    driverName: staffList[0]?.name || "Alex Rivera",
    route: "",
    distanceKm: "",
    fuelAmount: "",
    fuelUnit: "Liters",
    costPerUnit: "1.75",
    notes: "",
  });

  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + (Number(f.totalCost) || 0), 0);
  const totalDistanceKm = fuelLogs.reduce((sum, f) => sum + (Number(f.distanceKm) || 0), 0);
  const totalLiters = fuelLogs
    .filter((f) => f.fuelUnit === "Liters")
    .reduce((sum, f) => sum + (Number(f.fuelAmount) || 0), 0);
  const totalkWh = fuelLogs
    .filter((f) => f.fuelUnit === "kWh")
    .reduce((sum, f) => sum + (Number(f.fuelAmount) || 0), 0);

  const filteredLogs = fuelLogs.filter((log) => {
    const matchSearch =
      log.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.route.toLowerCase().includes(searchTerm.toLowerCase());
    const matchVehicle = filterVehicle === "All" || log.vehicleId === filterVehicle;
    return matchSearch && matchVehicle;
  });

  const handleExport = () => {
    exportFuelLogsToExcel(fuelLogs, fleet);
  };

  const handleVehicleChange = (vId) => {
    const selectedVeh = fleet.find((v) => v.id === vId);
    if (selectedVeh) {
      const isElectric = selectedVeh.fuelType.includes("Electric");
      setNewLog((prev) => ({
        ...prev,
        vehicleId: vId,
        driverName: selectedVeh.driverName || prev.driverName,
        fuelUnit: isElectric ? "kWh" : "Liters",
        costPerUnit: selectedVeh.fuelCostPerUnit.toString(),
      }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!newLog.route || !newLog.distanceKm || !newLog.fuelAmount) {
      alert("Please fill in all mandatory log fields.");
      return;
    }

    const dist = parseFloat(newLog.distanceKm) || 0;
    const amount = parseFloat(newLog.fuelAmount) || 0;
    const cpu = parseFloat(newLog.costPerUnit) || 0;
    const cost = amount * cpu;
    const veh = fleet.find((v) => v.id === newLog.vehicleId);

    const calculatedEfficiency =
      newLog.fuelUnit === "kWh"
        ? `${(amount / (dist || 1)).toFixed(2)} kWh/km`
        : `${(dist / (amount || 1)).toFixed(2)} km/L`;

    const entry = {
      id: `FUEL-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }),
      vehicleId: newLog.vehicleId,
      vehicleName: veh ? `${veh.name} (${veh.plate})` : newLog.vehicleId,
      driverName: newLog.driverName,
      route: newLog.route,
      distanceKm: dist,
      fuelAmount: amount,
      fuelUnit: newLog.fuelUnit,
      costPerUnit: cpu,
      totalCost: parseFloat(cost.toFixed(2)),
      efficiency: calculatedEfficiency,
      notes: newLog.notes || "Standard verified logistics telemetry entry.",
    };

    onAddFuelLog(entry);
    setShowAddModal(false);
    setNewLog({
      vehicleId: fleet[0]?.id || "VEH-01",
      driverName: staffList[0]?.name || "Alex Rivera",
      route: "",
      distanceKm: "",
      fuelAmount: "",
      fuelUnit: "Liters",
      costPerUnit: "1.75",
      notes: "",
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <ThreeDCard className="p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/80 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-xs font-black text-amber-300 uppercase tracking-wider">
              <Fuel className="h-3.5 w-3.5 text-amber-400" /> Fleet Energy & Mileage Tracker
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
              Fuel Consumption & Distance Ledger
            </h2>
            <p className="text-slate-300 text-sm md:text-base font-medium">
              Monitor real-time diesel, jet aviation fuel, and electric kilowatt consumption across the transport carrier fleet.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              id="btn-add-fuel-entry"
              className="px-5 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl flex items-center gap-2 shadow-xl shadow-amber-500/20 transition cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5 stroke-[3]" />
              <span>Log Fuel Entry</span>
            </button>
            <button
              onClick={handleExport}
              id="btn-export-fuel-excel"
              className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-sm rounded-2xl flex items-center gap-2 border border-slate-700 transition cursor-pointer"
            >
              <Download className="h-4.5 w-4.5" />
              <span>Export Fuel Excel Sheet</span>
            </button>
          </div>
        </div>
      </ThreeDCard>

      {/* Quick Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ThreeDCard className="p-6 bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Fuel Expense
              </span>
              <p className="text-2xl md:text-3xl font-black text-amber-400 font-mono">
                €{totalFuelCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-[11px] font-bold text-slate-400">
                Aggregated fuel bills
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Fuel className="h-6 w-6" />
            </div>
          </div>
        </ThreeDCard>

        <ThreeDCard className="p-6 bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Fleet Mileage
              </span>
              <p className="text-2xl md:text-3xl font-black text-sky-400 font-mono">
                {totalDistanceKm.toLocaleString()} km
              </p>
              <span className="text-[11px] font-bold text-slate-400">
                Cross-corridor distance
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-sky-500/20 border border-sky-500/40 text-sky-400">
              <Gauge className="h-6 w-6" />
            </div>
          </div>
        </ThreeDCard>

        <ThreeDCard className="p-6 bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Liquid Fuel Burned
              </span>
              <p className="text-2xl md:text-3xl font-black text-white font-mono">
                {totalLiters.toLocaleString()} L
              </p>
              <span className="text-[11px] font-bold text-slate-400">
                Diesel &amp; Jet-A1
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400">
              <Truck className="h-6 w-6" />
            </div>
          </div>
        </ThreeDCard>

        <ThreeDCard className="p-6 bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Electric Energy Used
              </span>
              <p className="text-2xl md:text-3xl font-black text-emerald-400 font-mono">
                {totalkWh.toLocaleString()} kWh
              </p>
              <span className="text-[11px] font-bold text-emerald-400">
                Zero-emission haulage
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Zap className="h-6 w-6" />
            </div>
          </div>
        </ThreeDCard>
      </div>

      {/* Fleet Vehicles Status Cards */}
      <div className="space-y-4">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <Truck className="h-5 w-5 text-sky-400" /> Carrier Fleet Assets & Energy Capacity
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {fleet.map((veh) => {
            const isElectric = veh.fuelType.includes("Electric");
            return (
              <ThreeDCard key={veh.id} className="p-5 bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                      {veh.plate}
                    </span>
                    <h4 className="text-sm font-extrabold text-white mt-1.5 line-clamp-1">
                      {veh.name}
                    </h4>
                  </div>
                  <div className={`p-2 rounded-xl border ${isElectric ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-sky-500/20 text-sky-400 border-sky-500/30"}`}>
                    {isElectric ? <Zap className="h-4 w-4" /> : <Fuel className="h-4 w-4" />}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Driver:</span>
                    <strong className="text-slate-200">{veh.driverName}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Fuel Tank / Battery:</span>
                    <strong className="text-slate-200">{veh.fuelCapacity} {isElectric ? "kWh" : "L"}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Avg Efficiency:</span>
                    <strong className="text-amber-400 font-mono">{veh.avgEfficiency}</strong>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-400">Current Level</span>
                    <span className="text-white font-mono">{veh.currentFuelLevel}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        veh.currentFuelLevel > 50
                          ? "bg-emerald-400"
                          : veh.currentFuelLevel > 25
                          ? "bg-amber-400"
                          : "bg-rose-500 animate-pulse"
                      }`}
                      style={{ width: `${veh.currentFuelLevel}%` }}
                    ></div>
                  </div>
                </div>
              </ThreeDCard>
            );
          })}
        </div>
      </div>

      {/* Fuel Log History Table */}
      <ThreeDCard className="p-6 md:p-8 bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-white">
              Fuel &amp; Energy Transmission Registry
            </h3>
            <p className="text-xs text-slate-400">
              Verified pump receipts, kilowatt charging cycles, and journey efficiency scores.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="h-4 w-4 absolute inset-y-0 left-3 my-auto text-slate-400" />
              <input
                type="text"
                placeholder="Search route, driver, vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <select
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="All">All Fleet Vehicles</option>
              {fleet.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                <th className="pb-3 px-3">Log ID &amp; Date</th>
                <th className="pb-3 px-3">Vehicle &amp; Driver</th>
                <th className="pb-3 px-3">Mission Route</th>
                <th className="pb-3 px-3 text-right">Distance</th>
                <th className="pb-3 px-3 text-right">Fuel Consumed</th>
                <th className="pb-3 px-3 text-right">Total Cost</th>
                <th className="pb-3 px-3 text-right">Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-sky-400 block">
                        {log.id}
                      </span>
                      <span className="text-[10px] text-slate-400">{log.date}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-white font-bold block">
                        {log.vehicleName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Driver: {log.driverName}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span>{log.route}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-white">
                      {log.distanceKm} km
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-amber-300">
                      {log.fuelAmount} {log.fuelUnit}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                      €{Number(log.totalCost).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px]">
                        {log.efficiency}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500 font-bold">
                    No fuel telemetry logs match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ThreeDCard>

      {/* Add Fuel Log Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 relative text-slate-100">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400 inline-block mb-1">
                <Fuel className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-black text-white">Log Vehicle Fuel / Charging Entry</h3>
              <p className="text-xs text-slate-400">
                Record trip telemetry for automated Profit &amp; Loss operational cost auditing.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Fleet Vehicle</label>
                <select
                  value={newLog.vehicleId}
                  onChange={(e) => handleVehicleChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {fleet.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.plate}) - {v.fuelType}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Dispatched Driver / Operator</label>
                <select
                  value={newLog.driverName}
                  onChange={(e) => setNewLog({ ...newLog, driverName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {staffList.map((st) => (
                    <option key={st.id} value={st.name}>
                      {st.name} ({st.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Transit Route / Mission Description</label>
                <input
                  type="text"
                  placeholder="e.g. Frankfurt Cargo Terminal -> Paris Central Depot"
                  value={newLog.route}
                  onChange={(e) => setNewLog({ ...newLog, route: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 450"
                    value={newLog.distanceKm}
                    onChange={(e) => setNewLog({ ...newLog, distanceKm: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Fuel Used ({newLog.fuelUnit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 120"
                    value={newLog.fuelAmount}
                    onChange={(e) => setNewLog({ ...newLog, fuelAmount: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Rate Per Unit (€ per {newLog.fuelUnit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newLog.costPerUnit}
                  onChange={(e) => setNewLog({ ...newLog, costPerUnit: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Audit Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Receipt number, pump telemetry or fast charge station ID"
                  value={newLog.notes}
                  onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition shadow-lg shadow-amber-500/20"
                >
                  Submit Fuel Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
