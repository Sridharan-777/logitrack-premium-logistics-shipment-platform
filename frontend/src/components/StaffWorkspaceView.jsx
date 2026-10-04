import React, { useState } from "react";
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  AlertTriangle,
  FileText,
  User,
  Users,
  ArrowRight,
  ShieldAlert,
  Fuel,
  DollarSign,
  Plus,
  Bike,
  UserPlus,
  Edit2,
  X,
  Zap,
  RotateCcw,
  Check,
  Search,
  Star,
  Download,
} from "lucide-react";
import ThreeDCard from "./ThreeDCard";
import { exportShipmentsToExcel, exportWorkersToExcel } from "../utils/exportUtils";

export default function StaffWorkspaceView({
  staffUser,
  shipments,
  workersList = [],
  customersList = [],
  onUpdateShipmentStatus,
  onReassignWorker,
  onTriggerRedelivery,
  onAddWorker,
  onAddCustomer,
  onUpdateWorker,
  onDeleteWorker,
  onUpdateCustomer,
  onDeleteCustomer,
  onAddFuelLog,
  onNavigate,
}) {
  const [mainTab, setMainTab] = useState("parcels"); // 'parcels', 'workers-crud', 'users-crud'
  const [filterReceiptStatus, setFilterReceiptStatus] = useState("all"); // 'all', 'received', 'not-received'
  const [searchTerm, setSearchTerm] = useState("");

  // Reassignment Modal state
  const [reassignModalShipment, setReassignModalShipment] = useState(null);
  const [selectedWorkerForReassign, setSelectedWorkerForReassign] = useState(workersList[0]?.id || "");

  // Add Worker Modal (Staff CRUD)
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [newWorkerData, setNewWorkerData] = useState({
    name: "",
    email: "",
    phone: "",
    vehicleType: "Two-Wheeler (Ather 450X EV Scooter)",
    transportMode: "two-wheeler",
    zone: "Urban Delivery Sector",
    doorStepServiceType: "Same-Day Door Delivery",
  });

  // Add Customer Modal (Staff CRUD)
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    location: "",
  });

  // Quick Action feedback
  const [actionFeedback, setActionFeedback] = useState(null);

  // Compute metrics
  const totalParcels = shipments.length;
  const receivedCount = shipments.filter((s) => s.receivedByCustomer || s.status === "Delivered").length;
  const notReceivedCount = totalParcels - receivedCount;
  const actionRequiredCount = shipments.filter((s) => s.escalationStatus === "Action Required" || s.status === "Customs Hold").length;

  const filteredShipments = shipments.filter((s) => {
    const matchesSearch =
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.receiverCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.assignedWorkerName && s.assignedWorkerName.toLowerCase().includes(searchTerm.toLowerCase()));

    const isReceived = s.receivedByCustomer || s.status === "Delivered";
    if (filterReceiptStatus === "received") return matchesSearch && isReceived;
    if (filterReceiptStatus === "not-received") return matchesSearch && !isReceived;
    return matchesSearch;
  });

  const handleActionDispatchTwoWheeler = (shipment) => {
    if (shipment.status === "Customs Hold") { setActionFeedback("Resolve the customs hold before dispatching a courier."); return; }
    // Find an active two-wheeler worker
    const twoWheelerWorker = workersList.find((w) => w.transportMode === "two-wheeler") || workersList[0];
    if (!twoWheelerWorker) { setActionFeedback("Add a courier before dispatching."); return; }
    onReassignWorker(shipment.id, twoWheelerWorker.id, twoWheelerWorker.name, "two-wheeler");
    onUpdateShipmentStatus(shipment.id, "Out for Delivery", "Supervisor dispatched the assigned courier.");
    setActionFeedback(`Dispatched Rapid Two-Wheeler Courier (${twoWheelerWorker.name}) for Waybill ${shipment.id}!`);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const handleActionTriggerRedelivery = (shipment) => {
    onTriggerRedelivery(shipment.id);
    setActionFeedback(`Expedited Redelivery Task scheduled for ${shipment.id}.`);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const handleSaveReassignment = (e) => {
    e.preventDefault();
    if (!reassignModalShipment) return;
    const worker = workersList.find((w) => w.id === selectedWorkerForReassign);
    if (worker) {
      onReassignWorker(reassignModalShipment.id, worker.id, worker.name, worker.transportMode || "two-wheeler");
      setActionFeedback(`Consignment ${reassignModalShipment.id} assigned to ${worker.name}.`);
      setTimeout(() => setActionFeedback(null), 5000);
    }
    setReassignModalShipment(null);
  };

  const handleCreateWorkerSubmit = (e) => {
    e.preventDefault();
    if (!newWorkerData.name || !newWorkerData.email) return;

    const created = {
      id: `worker-${Date.now()}`,
      name: newWorkerData.name,
      email: newWorkerData.email,
      phone: newWorkerData.phone || "+91 90000 00000",
      role: `${newWorkerData.transportMode === "two-wheeler" ? "Two-Wheeler" : "Van"} Doorstep Courier`,
      avatar: newWorkerData.name.slice(0, 2).toUpperCase(),
      vehicleType: newWorkerData.vehicleType,
      transportMode: newWorkerData.transportMode,
      zone: newWorkerData.zone,
      activeDeliveriesCount: 0,
      completedToday: 0,
      rating: 5.0,
      status: "Available for Dispatch",
      batteryLevel: 100,
      dailyEarnings: 0,
      doorStepServiceType: newWorkerData.doorStepServiceType,
    };

    onAddWorker(created);
    setShowAddWorkerModal(false);
    setNewWorkerData({
      name: "",
      email: "",
      phone: "",
      vehicleType: "Two-Wheeler (Ather 450X EV Scooter)",
      transportMode: "two-wheeler",
      zone: "Urban Delivery Sector",
      doorStepServiceType: "Same-Day Door Delivery",
    });
    setActionFeedback(`New Worker "${created.name}" registered successfully!`);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const handleCreateCustomerSubmit = (e) => {
    e.preventDefault();
    if (!newCustomerData.name || !newCustomerData.email) return;

    const created = {
      id: `usr-cust-${Date.now()}`,
      name: newCustomerData.name,
      email: newCustomerData.email,
      phone: newCustomerData.phone || "+1 (555) 012-3456",
      company: newCustomerData.company || "Enterprise Customer",
      location: newCustomerData.location || "Global Metro",
      accountType: "Verified Customer",
      totalBookings: 0,
      activeParcels: 0,
      joinedDate: "Aug 2026",
    };

    onAddCustomer(created);
    setShowAddCustomerModal(false);
    setNewCustomerData({
      name: "",
      email: "",
      phone: "",
      company: "",
      location: "",
    });
    setActionFeedback(`Customer "${created.name}" created and verified.`);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Staff Supervisor Hero Banner */}
      <ThreeDCard className="p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/80 border border-sky-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/20 border border-sky-500/40 rounded-full text-xs font-black text-sky-300 uppercase tracking-wider">
              <Users className="h-4 w-4 text-sky-400" /> Operations Staff Supervisor Console • {staffUser.name}
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
              Parcel Receipt Monitoring &amp; Worker Dispatch
            </h2>
            <p className="text-slate-300 text-sm md:text-base font-medium">
              Audit customer receipt confirmations, dispatch rapid two-wheeler redeliveries, and manage worker and customer accounts.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAddWorkerModal(true)}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs md:text-sm rounded-2xl flex items-center gap-2 shadow-xl shadow-amber-500/20 transition cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5 stroke-[3]" />
              <span>Add Worker</span>
            </button>
            <button
              onClick={() => setShowAddCustomerModal(true)}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs md:text-sm rounded-2xl flex items-center gap-2 border border-slate-700 transition cursor-pointer"
            >
              <UserPlus className="h-4.5 w-4.5 text-sky-400" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>
      </ThreeDCard>

      {/* Action Toast Feedback */}
      {actionFeedback && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs font-bold flex items-center justify-between animate-fade-in shadow-xl">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>{actionFeedback}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Staff KPI Oversight Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ThreeDCard className="p-6 bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Parcels Monitored
              </span>
              <p className="text-2xl md:text-3xl font-black text-white font-mono">
                {totalParcels} Waybills
              </p>
              <span className="text-[11px] font-bold text-sky-400">
                MongoDB Records Loaded
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-sky-500/20 border border-sky-500/40 text-sky-400">
              <Package className="h-6 w-6" />
            </div>
          </div>
        </ThreeDCard>

        <ThreeDCard className="p-6 bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Received by Customer
              </span>
              <p className="text-2xl md:text-3xl font-black text-emerald-400 font-mono">
                {receivedCount}
              </p>
              <span className="text-[11px] font-bold text-emerald-300">
                {((receivedCount / (totalParcels || 1)) * 100).toFixed(0)}% Receipt Success
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </ThreeDCard>

        <ThreeDCard className="p-6 bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pending Customer Receipt
              </span>
              <p className="text-2xl md:text-3xl font-black text-amber-400 font-mono">
                {notReceivedCount}
              </p>
              <span className="text-[11px] font-bold text-amber-300">
                En route to Doorstep
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </ThreeDCard>

        <ThreeDCard className="p-6 bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Field Delivery Workers
              </span>
              <p className="text-2xl md:text-3xl font-black text-purple-400 font-mono">
                {workersList.length} Couriers
              </p>
              <span className="text-[11px] font-bold text-purple-300">
                Two-Wheeler &amp; Van Fleet
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400">
              <Bike className="h-6 w-6" />
            </div>
          </div>
        </ThreeDCard>
      </div>

      {/* Main Staff Function Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setMainTab("parcels")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
            mainTab === "parcels"
              ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Parcel Receipt &amp; Action Center ({totalParcels})</span>
        </button>

        <button
          onClick={() => setMainTab("workers-crud")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
            mainTab === "workers-crud"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Bike className="h-4 w-4" />
          <span>Manage Workers / Two-Wheelers ({workersList.length})</span>
        </button>

        <button
          onClick={() => setMainTab("users-crud")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
            mainTab === "users-crud"
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Manage Customers / Users ({customersList.length})</span>
        </button>
      </div>

      {/* TAB 1: Parcel Receipt Monitor & Escalation Actions */}
      {mainTab === "parcels" && (
        <div className="space-y-6">
          {/* Sub-Filters and Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterReceiptStatus("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterReceiptStatus === "all" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-900"
                }`}
              >
                All Parcels
              </button>
              <button
                onClick={() => setFilterReceiptStatus("not-received")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  filterReceiptStatus === "not-received"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black"
                    : "text-slate-400 hover:bg-slate-900"
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span>Not Received Yet ({notReceivedCount})</span>
              </button>
              <button
                onClick={() => setFilterReceiptStatus("received")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  filterReceiptStatus === "received"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black"
                    : "text-slate-400 hover:bg-slate-900"
                }`}
              >
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Received &amp; Verified ({receivedCount})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => exportShipmentsToExcel(shipments)}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition cursor-pointer"
                title="Download Excel Sheet of all Parcels"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Excel Export</span>
              </button>

              <div className="relative max-w-sm w-full">
                <Search className="h-4 w-4 absolute inset-y-0 left-3 my-auto text-slate-400" />
                <input
                  type="text"
                  placeholder="Search waybill, customer, courier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>
          </div>

          {/* Parcels List */}
          <div className="space-y-4">
            {filteredShipments.map((shipment) => {
              const isReceived = shipment.receivedByCustomer || shipment.status === "Delivered";

              return (
                <ThreeDCard
                  key={shipment.id}
                  className="p-6 bg-slate-900/95 border border-slate-800 rounded-3xl shadow-xl space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono font-black text-sky-400 text-base">{shipment.id}</span>
                        <span
                          className={`px-3 py-0.5 rounded-full text-xs font-black ${
                            isReceived
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                          }`}
                        >
                          {isReceived ? "✓ Received by Customer" : "⚠️ Customer Receipt Pending"}
                        </span>
                        <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono font-bold">
                          Mode: {shipment.transportModeUsed?.toUpperCase() || "TWO-WHEELER"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400">
                        Customer: <strong className="text-white">{shipment.receiverName}</strong> ({shipment.receiverCity}) • Phone: <span className="font-mono text-slate-300">{shipment.receiverPhone}</span>
                      </p>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Assigned Field Courier</span>
                      <strong className="text-amber-400 font-bold flex items-center gap-1 justify-end">
                        🛵 {shipment.assignedWorkerName || "Unassigned"}
                      </strong>
                    </div>
                  </div>

                  {/* Customer Instruction & Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-slate-500 font-mono text-[10px] uppercase block">Current Live Location</span>
                      <span className="text-white font-medium">{shipment.currentLocation || "In Movement"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-mono text-[10px] uppercase block">Customer Delivery Instruction</span>
                      <span className="text-slate-300 italic line-clamp-1">{shipment.customerNeeds || "Standard doorstep handoff."}</span>
                    </div>
                  </div>

                  {/* Staff Supervisory Actions if NOT received or issues */}
                  {!isReceived ? (
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-rose-400" />
                        <span>Receipt Action Required by Staff:</span>
                      </span>

                      <div className="flex flex-wrap gap-2">
                        {/* 1-Click Dispatch Two-Wheeler */}
                        <button
                          onClick={() => handleActionDispatchTwoWheeler(shipment)}
                          className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Zap className="h-3.5 w-3.5" />
                          <span>Dispatch Rapid Two-Wheeler</span>
                        </button>

                        {/* Reassign Worker */}
                        <button
                          onClick={() => setReassignModalShipment(shipment)}
                          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Bike className="h-3.5 w-3.5 text-sky-400" />
                          <span>Reassign Courier</span>
                        </button>

                        {/* Force Redelivery */}
                        <button
                          onClick={() => handleActionTriggerRedelivery(shipment)}
                          className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Trigger Redelivery</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Check className="h-4 w-4" /> Parcel verified received at customer doorstep.
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {shipment.proofOfDelivery?.timestamp || "Delivered"}
                      </span>
                    </div>
                  )}
                </ThreeDCard>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Manage Workers */}
      {mainTab === "workers-crud" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-white">Doorstep Field Delivery Workers Directory</h3>
              <p className="text-xs text-slate-400">Create and manage two-wheeler couriers and field delivery agents.</p>
            </div>
            <button
              onClick={() => setShowAddWorkerModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Add New Delivery Worker</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workersList.map((worker) => (
              <ThreeDCard
                key={worker.id}
                className="p-6 bg-slate-900/95 border border-slate-800 rounded-3xl shadow-xl space-y-4"
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
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {worker.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Vehicle:</span>
                    <strong className="text-amber-300">🛵 {worker.vehicleType}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Zone:</span>
                    <span>{worker.zone}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-mono text-emerald-400">{worker.phone}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Completed Drops: <strong>{worker.completedToday || 0}</strong></span>
                  <span className="text-amber-400 font-bold">Rating: {worker.rating || "5.0"} ★</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => { const zone = window.prompt("Update worker operating zone", worker.zone || ""); if (zone !== null) onUpdateWorker({ ...worker, zone }); }} className="flex-1 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs font-bold text-sky-300 hover:bg-sky-500/20">Edit Worker</button>
                  <button type="button" onClick={() => { if (window.confirm(`Deactivate worker ${worker.name}?`)) onDeleteWorker(worker.id); }} className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20">Deactivate</button>
                </div>
              </ThreeDCard>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Manage Customers / Users (Staff CRUD) */}
      {mainTab === "users-crud" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-white">Registered Customer Profiles</h3>
              <p className="text-xs text-slate-400">View and create new enterprise or individual customer accounts</p>
            </div>
            <button
              onClick={() => setShowAddCustomerModal(true)}
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-sky-500/20 cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>Register New Customer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {customersList.map((cust) => (
              <ThreeDCard
                key={cust.id}
                className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center font-black text-xs">
                    {cust.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white line-clamp-1">{cust.name}</h4>
                    <p className="text-[11px] text-sky-300 font-medium">{cust.company || "Direct Client"}</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
                  <div className="text-[11px] text-slate-400 truncate">{cust.email}</div>
                  <div className="text-[11px] text-emerald-400">{cust.phone}</div>
                </div>

                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>Location: {cust.location || "Global"}</span>
                  <span className="text-sky-400 font-bold">{cust.accountType}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => { const company = window.prompt("Update customer company", cust.company || ""); if (company !== null) onUpdateCustomer({ ...cust, company }); }} className="flex-1 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs font-bold text-sky-300 hover:bg-sky-500/20">Edit Customer</button>
                  <button type="button" onClick={() => { if (window.confirm(`Deactivate customer ${cust.name}?`)) onDeleteCustomer(cust.id); }} className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20">Deactivate</button>
                </div>
              </ThreeDCard>
            ))}
          </div>
          </div>
      )}

      {/* Reassign Worker Modal */}
      {reassignModalShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5 text-slate-100">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Reassign Field Courier</h3>
              <p className="text-xs text-slate-400">
                Assign consignment {reassignModalShipment.id} to an available Two-Wheeler / Van worker.
              </p>
            </div>

            <form onSubmit={handleSaveReassignment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Select Available Courier</label>
                <select
                  value={selectedWorkerForReassign}
                  onChange={(e) => setSelectedWorkerForReassign(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                >
                  {workersList.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.vehicleType}) - {w.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReassignModalShipment(null)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Worker Modal (Staff CRUD) */}
      {showAddWorkerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5 text-slate-100">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">Register Doorstep Field Worker</h3>
              <p className="text-xs text-slate-400">
                Add a new two-wheeler EV scooter or delivery van courier to the operations roster.
              </p>
            </div>

            <form onSubmit={handleCreateWorkerSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Worker Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Leo Dubois"
                  value={newWorkerData.name}
                  onChange={(e) => setNewWorkerData({ ...newWorkerData, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Email Address</label>
                <input
                  type="email"
                  placeholder="leo.worker@logitrack.com"
                  value={newWorkerData.email}
                  onChange={(e) => setNewWorkerData({ ...newWorkerData, email: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 94432 12345"
                  value={newWorkerData.phone}
                  onChange={(e) => setNewWorkerData({ ...newWorkerData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Transport Mode &amp; Vehicle Type</label>
                <select
                  value={newWorkerData.transportMode}
                  onChange={(e) => {
                    const mode = e.target.value;
                    const vehName =
                      mode === "two-wheeler"
                        ? "Two-Wheeler (Ather 450X EV Scooter)"
                        : mode === "bike"
                        ? "E-Cargo Bicycle"
                        : "Ford E-Transit Urban Van";
                    setNewWorkerData({
                      ...newWorkerData,
                      transportMode: mode,
                      vehicleType: vehName,
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                >
                  <option value="two-wheeler">🛵 Two-Wheeler (Ather 450X / EV Scooter)</option>
                  <option value="van">🚚 Cargo Delivery Van</option>
                  <option value="bike">🚲 E-Cargo Bicycle</option>
                  <option value="truck">🚛 Semi-Truck Hauler</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Assigned Operating Zone</label>
                <input
                  type="text"
                  placeholder="e.g. Tamil Nadu Metro / Kovilpatti Hub"
                  value={newWorkerData.zone}
                  onChange={(e) => setNewWorkerData({ ...newWorkerData, zone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddWorkerModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition shadow-lg shadow-amber-500/20"
                >
                  Create Field Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal (Staff CRUD) */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5 text-slate-100">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">Create New Customer Account</h3>
              <p className="text-xs text-slate-400">
                Add an individual customer or enterprise corporate partner.
              </p>
            </div>

            <form onSubmit={handleCreateCustomerSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Customer Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Jane Goodall"
                  value={newCustomerData.name}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Business Email Address</label>
                <input
                  type="email"
                  placeholder="jane@organization.com"
                  value={newCustomerData.email}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 94432 99887"
                  value={newCustomerData.phone}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Company / University</label>
                <input
                  type="text"
                  placeholder="e.g. National Engineering College"
                  value={newCustomerData.company}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, company: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl transition shadow-lg shadow-sky-500/20"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
