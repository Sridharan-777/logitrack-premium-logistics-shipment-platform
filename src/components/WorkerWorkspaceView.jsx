import React, { useState } from "react";
import {
  Bike,
  Truck,
  Package,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  AlertTriangle,
  User,
  ShieldCheck,
  Fuel,
  DollarSign,
  QrCode,
  FileCheck,
  Send,
  Navigation,
  Sparkles,
  Award,
  Radio,
  Zap,
} from "lucide-react";
import ThreeDCard from "./ThreeDCard";

export default function WorkerWorkspaceView({
  workerUser,
  shipments,
  onCompleteDelivery,
  onReportDeliveryIssue,
  onUpdateTransportMode,
  onAddFuelLog,
  onNavigate,
}) {
  const [activeTab, setActiveTab] = useState("todo"); // 'todo', 'completed'
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [customerSignature, setCustomerSignature] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [showProofModal, setShowProofModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueReason, setIssueReason] = useState("Customer not answering door/phone");
  const [activeTransportMode, setActiveTransportMode] = useState(workerUser.transportMode || "two-wheeler");

  // Filter shipments assigned to this worker
  const myAssignedShipments = shipments.filter(
    (s) => s.assignedWorkerId === workerUser.id || s.assignedWorkerName?.includes(workerUser.name)
  );

  const pendingDoorDeliveries = myAssignedShipments.filter((s) => s.status !== "Delivered");
  const completedDoorDeliveries = myAssignedShipments.filter((s) => s.status === "Delivered");

  const handleTransportModeChange = (mode) => {
    setActiveTransportMode(mode);
    onUpdateTransportMode(workerUser.id, mode);
  };

  const handleOpenProofModal = (shipment) => {
    setSelectedShipment(shipment);
    setCustomerSignature(shipment.receiverName);
    setDeliveryNote("Handed directly to recipient at doorstep. Package seals intact.");
    setShowProofModal(true);
  };

  const handleConfirmProof = (e) => {
    e.preventDefault();
    if (!selectedShipment) return;

    onCompleteDelivery(selectedShipment.id, {
      signedBy: customerSignature || selectedShipment.receiverName,
      note: deliveryNote,
      transportMode: activeTransportMode,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });

    setShowProofModal(false);
    setSelectedShipment(null);
  };

  const handleOpenIssueModal = (shipment) => {
    setSelectedShipment(shipment);
    setShowIssueModal(true);
  };

  const handleSendIssueReport = (e) => {
    e.preventDefault();
    if (!selectedShipment) return;

    onReportDeliveryIssue(selectedShipment.id, {
      reason: issueReason,
      reportedBy: workerUser.name,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });

    setShowIssueModal(false);
    setSelectedShipment(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Worker Hero Card */}
      <ThreeDCard className="p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/80 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-xs font-black text-amber-300 uppercase tracking-wider">
              <Bike className="h-4 w-4 text-amber-400" /> Doorstep Delivery Courier Terminal • {workerUser.name}
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
              Door-to-Door Service &amp; Delivery Console
            </h2>
            <p className="text-slate-300 text-sm md:text-base font-medium">
              Execute doorstep customer handoffs, report active transport vehicles, capture recipient verification signatures, and log two-wheeler EV telemetry.
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Today's Field Earnings
            </span>
            <p className="text-2xl font-black text-emerald-400 font-mono">
              €{(workerUser.dailyEarnings || 95.0).toFixed(2)}
            </p>
            <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
              <Award className="h-3.5 w-3.5" /> {workerUser.completedToday || 18} Drops Completed Today
            </span>
          </div>
        </div>
      </ThreeDCard>

      {/* MANDATORY FEATURE: Transport Mode Selector & Status */}
      <ThreeDCard className="p-6 bg-slate-900/95 border border-sky-500/30 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                Active Transport Mode Reporting
              </h3>
              <p className="text-xs text-slate-400">
                Specify your active delivery vehicle to synchronize live GPS map telemetry and fleet analytics.
              </p>
            </div>
          </div>

          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-mono font-bold">
            Battery / Fuel: {workerUser.batteryLevel || 88}%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Two-Wheeler (EV Scooter / Motorbike) */}
          <button
            type="button"
            onClick={() => handleTransportModeChange("two-wheeler")}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-3 cursor-pointer ${
              activeTransportMode === "two-wheeler"
                ? "bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 font-bold">
                🛵
              </span>
              {activeTransportMode === "two-wheeler" && (
                <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  Active
                </span>
              )}
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Two-Wheeler (EV / Bike)</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">High-speed urban doorstep delivery</p>
            </div>
          </button>

          {/* Cargo Delivery Van */}
          <button
            type="button"
            onClick={() => handleTransportModeChange("van")}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-3 cursor-pointer ${
              activeTransportMode === "van"
                ? "bg-sky-500/20 border-sky-500 text-white shadow-lg shadow-sky-500/20 ring-2 ring-sky-400/40"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-sky-500/20 text-sky-400 font-bold">
                🚚
              </span>
              {activeTransportMode === "van" && (
                <span className="text-[10px] font-black uppercase text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                  Active
                </span>
              )}
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Cargo Van</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Multi-package bulk door drops</p>
            </div>
          </button>

          {/* E-Cargo Bicycle */}
          <button
            type="button"
            onClick={() => handleTransportModeChange("bike")}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-3 cursor-pointer ${
              activeTransportMode === "bike"
                ? "bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/40"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold">
                🚲
              </span>
              {activeTransportMode === "bike" && (
                <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Active
                </span>
              )}
            </div>
            <div>
              <h4 className="text-xs font-black text-white">E-Cargo Bicycle</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Eco-friendly pedestrian zones</p>
            </div>
          </button>

          {/* Regional Freight Truck */}
          <button
            type="button"
            onClick={() => handleTransportModeChange("truck")}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-3 cursor-pointer ${
              activeTransportMode === "truck"
                ? "bg-purple-500/20 border-purple-500 text-white shadow-lg shadow-purple-500/20 ring-2 ring-purple-400/40"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 font-bold">
                🚛
              </span>
              {activeTransportMode === "truck" && (
                <span className="text-[10px] font-black uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                  Active
                </span>
              )}
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Heavy Freight Semi</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Palletized inter-terminal runs</p>
            </div>
          </button>
        </div>
      </ThreeDCard>

      {/* Tabs Row */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("todo")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
            activeTab === "todo"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          Pending Door Deliveries ({pendingDoorDeliveries.length})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
            activeTab === "completed"
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          Completed Proof Receipts ({completedDoorDeliveries.length})
        </button>
      </div>

      {/* Doorstep Deliveries Task List */}
      <div className="space-y-6">
        {activeTab === "todo" ? (
          pendingDoorDeliveries.length > 0 ? (
            pendingDoorDeliveries.map((shipment) => (
              <ThreeDCard
                key={shipment.id}
                className="p-6 md:p-8 bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl space-y-6"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-black font-mono text-sky-400">
                        {shipment.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Doorstep Run
                      </span>
                      <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                        {shipment.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      Item: <strong className="text-white">{shipment.itemDescription || shipment.category}</strong> ({shipment.weight} kg)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate("track-live")}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Navigation className="h-3.5 w-3.5 text-sky-400" />
                      <span>GPS Route</span>
                    </button>
                  </div>
                </div>

                {/* Doorstep Customer Coordinates & Notes */}
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">Recipient Contact</span>
                      <strong className="text-white block text-sm">{shipment.receiverName}</strong>
                      <span className="font-mono text-emerald-400 flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {shipment.receiverPhone}
                      </span>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">Doorstep Delivery Address</span>
                      <strong className="text-amber-300 block">{shipment.receiverAddress}, {shipment.receiverCity}</strong>
                      <span className="text-[11px] text-slate-400 block">
                        Estimated target: {shipment.estimatedDelivery}
                      </span>
                    </div>
                  </div>

                  {shipment.customerNeeds && (
                    <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-200 font-medium">
                      <strong>Customer Special Instruction:</strong> "{shipment.customerNeeds}"
                    </div>
                  )}
                </div>

                {/* Worker Execution Actions */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => handleOpenProofModal(shipment)}
                    className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs md:text-sm rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <CheckCircle className="h-4.5 w-4.5 stroke-[2.5]" />
                    <span>Complete Doorstep Delivery (Capture Signature)</span>
                  </button>

                  <button
                    onClick={() => handleOpenIssueModal(shipment)}
                    className="px-5 py-3.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs rounded-2xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span>Report Doorstep Issue</span>
                  </button>
                </div>
              </ThreeDCard>
            ))
          ) : (
            <div className="p-12 text-center bg-slate-900/90 border border-slate-800 rounded-3xl text-slate-400">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-emerald-400" />
              <p className="text-base font-bold text-white">All doorstep deliveries fulfilled!</p>
              <p className="text-xs text-slate-400 mt-1">No pending runs assigned to your two-wheeler vehicle.</p>
            </div>
          )
        ) : (
          completedDoorDeliveries.map((shipment) => (
            <ThreeDCard
              key={shipment.id}
              className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-sky-400 text-sm">{shipment.id}</span>
                  <h4 className="text-base font-black text-white mt-1">
                    Delivered to {shipment.receiverName}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Address: {shipment.receiverAddress}, {shipment.receiverCity}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold">
                    ✓ Verified by Customer
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 block mt-1">
                    {shipment.proofOfDelivery?.timestamp || "Delivered Today"}
                  </span>
                </div>
              </div>

              {shipment.proofOfDelivery && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 flex justify-between">
                  <span>Signer: <strong>{shipment.proofOfDelivery.signedBy}</strong></span>
                  <span className="text-emerald-400">Code: {shipment.proofOfDelivery.signatureCode || "SIG-VERIFIED"}</span>
                </div>
              )}
            </ThreeDCard>
          ))
        )}
      </div>

      {/* Signature & Proof of Delivery Modal */}
      {showProofModal && selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 relative text-slate-100">
            <div className="space-y-1">
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 inline-block">
                <FileCheck className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-black text-white">Capture Doorstep Delivery Proof</h3>
              <p className="text-xs text-slate-400">
                Waybill {selectedShipment.id} • Delivering to {selectedShipment.receiverName}
              </p>
            </div>

            <form onSubmit={handleConfirmProof} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Recipient / Signer Full Name</label>
                <input
                  type="text"
                  value={customerSignature}
                  onChange={(e) => setCustomerSignature(e.target.value)}
                  required
                  placeholder="e.g. Dr. Marcus Vance"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Delivery Confirmation Note</label>
                <textarea
                  rows={2}
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Transport Mode:</span>
                <span className="text-amber-400 font-bold uppercase">{activeTransportMode}</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProofModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl transition shadow-lg shadow-emerald-500/20"
                >
                  Confirm &amp; Complete Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Doorstep Issue Modal */}
      {showIssueModal && selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 relative text-slate-100">
            <div className="space-y-1">
              <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-400 inline-block">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-black text-white">Report Doorstep Delivery Issue</h3>
              <p className="text-xs text-slate-400">
                Alerts operations staff supervisors immediately to take redelivery or contact action.
              </p>
            </div>

            <form onSubmit={handleSendIssueReport} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Issue Category</label>
                <select
                  value={issueReason}
                  onChange={(e) => setIssueReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-400"
                >
                  <option value="Customer not answering door/phone">Customer not answering door/phone</option>
                  <option value="Incorrect or incomplete street address">Incorrect or incomplete street address</option>
                  <option value="Premises gated / access code required">Premises gated / access code required</option>
                  <option value="Customer requested reschedule">Customer requested reschedule</option>
                  <option value="Vehicle breakdown / traffic delay">Vehicle breakdown / traffic delay</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-rose-500 hover:bg-rose-400 text-white font-black text-xs rounded-xl transition shadow-lg shadow-rose-500/20"
                >
                  Notify Supervisor Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
