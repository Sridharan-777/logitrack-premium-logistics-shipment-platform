import React, { useState } from "react";
import {
  Users,
  DollarSign,
  Download,
  Edit2,
  CheckCircle,
  Star,
  Truck,
  ShieldCheck,
  Phone,
  Mail,
  X,
  Plus,
  Save,
  Trash2,
  Bike,
  UserPlus,
  Building,
  UserCheck,
} from "lucide-react";
import ThreeDCard from "./ThreeDCard";
import { exportPayrollToExcel, downloadCSV } from "../utils/exportUtils";

export default function AdminStaffManagementView({
  staffList = [],
  workersList = [],
  customersList = [],
  onUpdateStaff,
  onAddStaff,
  onDeleteStaff,
  onUpdateWorker,
  onAddWorker,
  onDeleteWorker,
  onUpdateCustomer,
  onAddCustomer,
  onDeleteCustomer,
}) {
  const [activeTab, setActiveTab] = useState("staff"); // 'staff', 'workers', 'customers'

  // Edit Modals
  const [editingStaff, setEditingStaff] = useState(null);
  const [editingWorker, setEditingWorker] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Creation Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState("worker"); // 'staff', 'worker', 'customer'
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "",
    company: "",
    vehicleType: "Two-Wheeler (Ather 450X EV Scooter)",
    transportMode: "two-wheeler",
    monthlyBaseSalary: "3800",
    tripBonusRate: "35",
    zone: "Metro Zone",
  });

  const totalPayrollGross = staffList.reduce((sum, st) => {
    const tripBonus = (st.completedTripsThisMonth || 0) * (st.tripBonusRate || 0);
    const overtime = (st.overtimeHours || 0) * (st.hourlyRate * 1.5 || 0);
    return sum + (st.monthlyBaseSalary || 0) + tripBonus + overtime;
  }, 0);

  const handleExportRoster = () => {
    if (activeTab === "staff") {
      exportPayrollToExcel(staffList);
    } else if (activeTab === "workers") {
      const headers = ["Worker ID", "Name", "Role", "Email", "Phone", "Vehicle Type", "Transport Mode", "Zone", "Completed Drops", "Rating"];
      const rows = workersList.map((w) => [w.id, w.name, w.role, w.email, w.phone, w.vehicleType, w.transportMode, w.zone, w.completedToday, `${w.rating} / 5.0`]);
      downloadCSV(`LogiTrack_Field_Workers_${Date.now()}.csv`, headers, rows);
    } else {
      const headers = ["Customer ID", "Name", "Email", "Phone", "Company", "Location", "Account Type"];
      const rows = customersList.map((c) => [c.id, c.name, c.email, c.phone, c.company, c.location, c.accountType]);
      downloadCSV(`LogiTrack_Customers_Directory_${Date.now()}.csv`, headers, rows);
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email) return;

    if (createType === "staff") {
      const newStaff = {
        id: `staff-${Date.now()}`,
        name: createForm.name,
        email: createForm.email,
        phone: createForm.phone || "+49 69 0000 1111",
        role: createForm.role || "Operations Logistics Officer",
        avatar: createForm.name.slice(0, 2).toUpperCase(),
        assignedVehicle: createForm.vehicleType || "Fleet Semi-Truck",
        monthlyBaseSalary: parseFloat(createForm.monthlyBaseSalary) || 3800,
        hourlyRate: 25.0,
        tripBonusRate: parseFloat(createForm.tripBonusRate) || 35,
        completedTripsThisMonth: 0,
        hoursWorkedThisMonth: 160,
        overtimeHours: 0,
        rating: 5.0,
        status: "Active Duty",
        zone: createForm.zone || "Central Logistics Hub",
        deductions: 520,
        lastPayoutDate: "08/31/2026",
        paymentMethod: "Direct Bank Transfer",
      };
      onAddStaff({ ...newStaff, password: createForm.password });
    } else if (createType === "worker") {
      const newWorker = {
        id: `worker-${Date.now()}`,
        name: createForm.name,
        email: createForm.email,
        phone: createForm.phone || "+91 98401 00000",
        role: `${createForm.transportMode === "two-wheeler" ? "Rapid Two-Wheeler" : "Van"} Door Courier`,
        avatar: createForm.name.slice(0, 2).toUpperCase(),
        vehicleType: createForm.vehicleType || "Two-Wheeler (Ather 450X EV Scooter)",
        transportMode: createForm.transportMode || "two-wheeler",
        zone: createForm.zone || "Metro Zone",
        activeDeliveriesCount: 0,
        completedToday: 0,
        rating: 5.0,
        status: "Available for Dispatch",
        batteryLevel: 100,
        dailyEarnings: 0,
        doorStepServiceType: "Door-to-Door Delivery",
      };
      onAddWorker({ ...newWorker, password: createForm.password });
    } else {
      const newCust = {
        id: `usr-cust-${Date.now()}`,
        name: createForm.name,
        email: createForm.email,
        phone: createForm.phone || "+1 (555) 000-1111",
        company: createForm.company || "Enterprise Partner",
        location: createForm.zone || "Global City",
        accountType: "Verified Customer",
        totalBookings: 0,
        activeParcels: 0,
        joinedDate: "Aug 2026",
      };
      onAddCustomer({ ...newCust, password: createForm.password });
    }

    setShowCreateModal(false);
    setCreateForm({
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "",
      company: "",
      vehicleType: "Two-Wheeler (Ather 450X EV Scooter)",
      transportMode: "two-wheeler",
      monthlyBaseSalary: "3800",
      tripBonusRate: "35",
      zone: "Metro Zone",
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <ThreeDCard className="p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/80 border border-sky-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/20 border border-sky-500/40 rounded-full text-xs font-black text-sky-300 uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-400" /> Master Entity Management &amp; CRUD (Admin Only)
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
              Human Capital &amp; Fleet Roster Control
            </h2>
            <p className="text-slate-300 text-sm md:text-base font-medium">
              Create, edit, and manage Staff supervisors, doorstep Two-Wheeler field Workers, and Customer directories with instant data export.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setCreateType(activeTab === "staff" ? "staff" : activeTab === "workers" ? "worker" : "customer");
                setShowCreateModal(true);
              }}
              className="px-5 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs md:text-sm rounded-2xl flex items-center gap-2 shadow-xl shadow-amber-500/20 transition cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5 stroke-[3]" />
              <span>Add New {activeTab === "staff" ? "Staff Supervisor" : activeTab === "workers" ? "Field Worker" : "Customer"}</span>
            </button>

            <button
              onClick={handleExportRoster}
              className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs md:text-sm rounded-2xl flex items-center gap-2 border border-slate-700 transition cursor-pointer"
            >
              <Download className="h-4.5 w-4.5" />
              <span>Export Roster Excel</span>
            </button>
          </div>
        </div>
      </ThreeDCard>

      {/* Navigation Tabs between Staff, Workers, Customers */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("staff")}
          className={`px-5 py-3 rounded-2xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
            activeTab === "staff"
              ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Staff Supervisors ({staffList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("workers")}
          className={`px-5 py-3 rounded-2xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
            activeTab === "workers"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Bike className="h-4 w-4" />
          <span>Field Delivery Workers / Two-Wheelers ({workersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("customers")}
          className={`px-5 py-3 rounded-2xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
            activeTab === "customers"
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Registered Customers &amp; Clients ({customersList.length})</span>
        </button>
      </div>

      {/* TAB 1: Staff Management & Payroll */}
      {activeTab === "staff" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {staffList.map((st) => {
            const tripBonusTotal = (st.completedTripsThisMonth || 0) * (st.tripBonusRate || 0);
            const overtimePay = (st.overtimeHours || 0) * (st.hourlyRate * 1.5 || 0);
            const gross = (st.monthlyBaseSalary || 0) + tripBonusTotal + overtimePay;

            return (
              <ThreeDCard
                key={st.id}
                className="p-6 bg-slate-900/95 border border-slate-800 rounded-3xl shadow-xl space-y-5 relative"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-slate-950 font-black text-base flex items-center justify-center border border-sky-400/40">
                      {st.avatar || "ST"}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">{st.name}</h3>
                      <p className="text-xs text-sky-400 font-bold">{st.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingStaff(st)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition cursor-pointer"
                      title="Edit Staff Data & Salary"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete staff member ${st.name}?`)) onDeleteStaff(st.id);
                      }}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition cursor-pointer"
                      title="Delete Staff"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Assigned Asset</span>
                    <strong className="text-white line-clamp-1">{st.assignedVehicle}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Territory</span>
                    <strong className="text-amber-300 line-clamp-1">{st.zone}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Base Salary</span>
                    <span className="font-mono text-emerald-400 font-bold">€{st.monthlyBaseSalary?.toFixed(2)}/mo</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Trip Bonus Rate</span>
                    <span className="font-mono text-purple-400 font-bold">€{st.tripBonusRate?.toFixed(2)} / trip</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Monthly Gross Total: <strong className="text-emerald-400 font-mono">€{gross.toFixed(2)}</strong></span>
                  <span className="text-sky-400 font-bold">Rating: {st.rating || "4.95"} ★</span>
                </div>
              </ThreeDCard>
            );
          })}
        </div>
      )}

      {/* TAB 2: Workers / Two-Wheelers Field Fleet */}
      {activeTab === "workers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workersList.map((worker) => (
            <ThreeDCard
              key={worker.id}
              className="p-6 bg-slate-900/95 border border-slate-800 rounded-3xl shadow-xl space-y-4 relative"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-black text-sm">
                    {worker.avatar || "WK"}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">{worker.name}</h4>
                    <p className="text-xs text-amber-400 font-bold">{worker.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingWorker(worker)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove worker ${worker.name}?`)) onDeleteWorker(worker.id);
                    }}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 font-mono">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Vehicle:</span>
                  <strong className="text-amber-300">🛵 {worker.vehicleType}</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Mode:</span>
                  <span className="uppercase text-sky-400">{worker.transportMode}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Zone:</span>
                  <span>{worker.zone}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Phone:</span>
                  <span className="text-emerald-400">{worker.phone}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
                <span className="text-slate-400">Today Drops: <strong className="text-white">{worker.completedToday || 0}</strong></span>
                <span className="text-emerald-400 font-bold font-mono">€{(worker.dailyEarnings || 95).toFixed(2)} / day</span>
              </div>
            </ThreeDCard>
          ))}
        </div>
      )}

      {/* TAB 3: Customers Directory */}
      {activeTab === "customers" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {customersList.map((cust) => (
            <ThreeDCard
              key={cust.id}
              className="p-6 bg-slate-900/95 border border-slate-800 rounded-3xl shadow-xl space-y-4 relative"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-black text-sm">
                    {cust.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white line-clamp-1">{cust.name}</h4>
                    <p className="text-xs text-slate-400">{cust.company || "Individual Client"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingCustomer(cust)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove customer ${cust.name}?`)) onDeleteCustomer(cust.id);
                    }}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 font-mono">
                <div className="text-slate-300 truncate">Email: {cust.email}</div>
                <div className="text-emerald-400">Phone: {cust.phone}</div>
                <div className="text-slate-400">Location: {cust.location}</div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
                <span className="text-slate-400">Account: <strong>{cust.accountType}</strong></span>
                <span className="text-sky-400 font-bold">{cust.totalBookings || 0} Bookings</span>
              </div>
            </ThreeDCard>
          ))}
        </div>
      )}

      {/* Unified Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5 text-slate-100">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">
                Add New {createType === "staff" ? "Staff Supervisor" : createType === "worker" ? "Delivery Worker" : "Customer"}
              </h3>
              <p className="text-xs text-slate-400">
                Configure credentials, role parameters, and fleet vehicle assignments.
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Leo Dubois"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Email Address</label>
                <input
                  type="email"
                  placeholder="user@logitrack.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Phone</label>
                <input
                  type="text"
                  placeholder="+91 94432 10987"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Temporary Login Password</label>
                <input type="password" minLength="6" required value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} placeholder="Minimum 6 characters" className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-400" />
              </div>

              {createType === "worker" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Vehicle / Transport Mode</label>
                  <select
                    value={createForm.transportMode}
                    onChange={(e) => {
                      const mode = e.target.value;
                      setCreateForm({
                        ...createForm,
                        transportMode: mode,
                        vehicleType:
                          mode === "two-wheeler"
                            ? "Two-Wheeler (Ather 450X EV Scooter)"
                            : mode === "bike"
                            ? "E-Cargo Bicycle"
                            : "Ford E-Transit Van",
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                  >
                    <option value="two-wheeler">🛵 Two-Wheeler (EV Scooter / Motorbike)</option>
                    <option value="van">🚚 Cargo Delivery Van</option>
                    <option value="bike">🚲 E-Cargo Bicycle</option>
                    <option value="truck">🚛 Freight Semi-Truck</option>
                  </select>
                </div>
              )}

              {createType === "staff" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Base Salary (€)</label>
                    <input
                      type="number"
                      value={createForm.monthlyBaseSalary}
                      onChange={(e) => setCreateForm({ ...createForm, monthlyBaseSalary: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Trip Bonus (€)</label>
                    <input
                      type="number"
                      value={createForm.tripBonusRate}
                      onChange={(e) => setCreateForm({ ...createForm, tripBonusRate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Territory / Zone</label>
                <input
                  type="text"
                  placeholder="e.g. Tamil Nadu Metro / Central Hub"
                  value={createForm.zone}
                  onChange={(e) => setCreateForm({ ...createForm, zone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl transition shadow-lg shadow-sky-500/20"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5 text-slate-100">
            <h3 className="text-lg font-black text-white">Edit Staff: {editingStaff.name}</h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Base Salary (€/mo)</label>
                <input
                  type="number"
                  defaultValue={editingStaff.monthlyBaseSalary}
                  id="edit-staff-salary"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Trip Bonus (€/trip)</label>
                <input
                  type="number"
                  defaultValue={editingStaff.tripBonusRate}
                  id="edit-staff-bonus"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Operating Zone</label>
                <input
                  type="text"
                  defaultValue={editingStaff.zone}
                  id="edit-staff-zone"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditingStaff(null)}
                className="flex-1 py-2.5 bg-slate-800 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const salary = parseFloat(document.getElementById("edit-staff-salary")?.value) || editingStaff.monthlyBaseSalary;
                  const bonus = parseFloat(document.getElementById("edit-staff-bonus")?.value) || editingStaff.tripBonusRate;
                  const zone = document.getElementById("edit-staff-zone")?.value || editingStaff.zone;
                  onUpdateStaff({ ...editingStaff, monthlyBaseSalary: salary, tripBonusRate: bonus, zone });
                  setEditingStaff(null);
                }}
                className="flex-1 py-2.5 bg-sky-500 text-slate-950 font-black text-xs rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Worker Modal */}
      {editingWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5 text-slate-100">
            <h3 className="text-lg font-black text-white">Edit Worker: {editingWorker.name}</h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Vehicle / Two-Wheeler Type</label>
                <input
                  type="text"
                  defaultValue={editingWorker.vehicleType}
                  id="edit-worker-veh"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Zone</label>
                <input
                  type="text"
                  defaultValue={editingWorker.zone}
                  id="edit-worker-zone"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditingWorker(null)}
                className="flex-1 py-2.5 bg-slate-800 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const veh = document.getElementById("edit-worker-veh")?.value || editingWorker.vehicleType;
                  const zone = document.getElementById("edit-worker-zone")?.value || editingWorker.zone;
                  onUpdateWorker({ ...editingWorker, vehicleType: veh, zone });
                  setEditingWorker(null);
                }}
                className="flex-1 py-2.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5 text-slate-100">
            <h3 className="text-lg font-black text-white">Edit Customer: {editingCustomer.name}</h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Company / Affiliation</label>
                <input
                  type="text"
                  defaultValue={editingCustomer.company}
                  id="edit-cust-comp"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Location</label>
                <input
                  type="text"
                  defaultValue={editingCustomer.location}
                  id="edit-cust-loc"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditingCustomer(null)}
                className="flex-1 py-2.5 bg-slate-800 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const comp = document.getElementById("edit-cust-comp")?.value || editingCustomer.company;
                  const loc = document.getElementById("edit-cust-loc")?.value || editingCustomer.location;
                  onUpdateCustomer({ ...editingCustomer, company: comp, location: loc });
                  setEditingCustomer(null);
                }}
                className="flex-1 py-2.5 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
