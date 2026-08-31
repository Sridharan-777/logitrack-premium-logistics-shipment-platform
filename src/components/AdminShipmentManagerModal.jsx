import React, { useState } from "react";
import {
  Package,
  X,
  Save,
  Truck,
  MapPin,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  FileText,
  User,
} from "lucide-react";

export default function AdminShipmentManagerModal({
  shipment,
  staffList,
  onClose,
  onSave,
}) {
  const [formData, setFormData] = useState({
    status: shipment.status || "In Transit",
    cost: shipment.cost?.toString() || "0",
    operationalCost: shipment.operationalCost?.toString() || "0",
    fuelExpense: shipment.fuelExpense?.toString() || "0",
    assignedStaffId: shipment.assignedStaffId || (staffList[0]?.id || ""),
    currentLocation: shipment.currentLocation || "",
    estimatedDelivery: shipment.estimatedDelivery || "",
    customerNeeds: shipment.customerNeeds || "",
    receiverName: shipment.receiverName || "",
    receiverCity: shipment.receiverCity || "",
    receiverAddress: shipment.receiverAddress || "",
    weight: shipment.weight?.toString() || "1",
    fragile: !!shipment.fragile,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const assignedStaff = staffList.find((s) => s.id === formData.assignedStaffId);
    
    const updated = {
      ...shipment,
      status: formData.status,
      cost: parseFloat(formData.cost) || 0,
      operationalCost: parseFloat(formData.operationalCost) || 0,
      fuelExpense: parseFloat(formData.fuelExpense) || 0,
      assignedStaffId: formData.assignedStaffId,
      assignedStaffName: assignedStaff ? assignedStaff.name : shipment.assignedStaffName,
      currentLocation: formData.currentLocation,
      estimatedDelivery: formData.estimatedDelivery,
      customerNeeds: formData.customerNeeds,
      receiverName: formData.receiverName,
      receiverCity: formData.receiverCity,
      receiverAddress: formData.receiverAddress,
      weight: parseFloat(formData.weight) || 1,
      fragile: formData.fragile,
      timeline: [
        {
          id: `t-edit-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: formData.status,
          location: formData.currentLocation,
          description: `Admin updated shipment status to '${formData.status}'. Location: ${formData.currentLocation}.`,
        },
        ...shipment.timeline,
      ],
    };

    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-6 relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
              {shipment.id}
            </span>
            <span className="text-xs font-bold text-amber-400">Admin Live Editor</span>
          </div>
          <h3 className="text-xl font-black text-white">
            Modify Shipment Transmission Parameters
          </h3>
          <p className="text-xs text-slate-400">
            Override routes, reassign operations couriers, adjust financial charges, or resolve status holds.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Status & Driver Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Shipment Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-sky-400"
              >
                <option value="Booking Created">Booking Created</option>
                <option value="Picked Up">Picked Up</option>
                <option value="In Transit">In Transit</option>
                <option value="Customs Hold">Customs Hold</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Assigned Operations Staff / Driver</label>
              <select
                value={formData.assignedStaffId}
                onChange={(e) => setFormData({ ...formData, assignedStaffId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-sky-400"
              >
                {staffList.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Location & Estimated Delivery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Live Telemetry Location</label>
              <input
                type="text"
                value={formData.currentLocation}
                onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                placeholder="e.g. Frankfurt Cargo Hub Gate 3"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Estimated Delivery Target</label>
              <input
                type="text"
                value={formData.estimatedDelivery}
                onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                placeholder="e.g. Tomorrow (by 2:00 PM)"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          {/* Financial Breakdown: Revenue, OPEX, Fuel */}
          <div className="grid grid-cols-3 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-emerald-400">Customer Price (€)</label>
              <input
                type="number"
                step="0.1"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-750 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-rose-400">Operational OPEX (€)</label>
              <input
                type="number"
                step="0.1"
                value={formData.operationalCost}
                onChange={(e) => setFormData({ ...formData, operationalCost: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-750 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-rose-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-amber-400">Fuel Allocation (€)</label>
              <input
                type="number"
                step="0.1"
                value={formData.fuelExpense}
                onChange={(e) => setFormData({ ...formData, fuelExpense: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-750 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Recipient & Destination Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Destination Info</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Recipient Name</label>
                <input
                  type="text"
                  value={formData.receiverName}
                  onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">City</label>
                <input
                  type="text"
                  value={formData.receiverCity}
                  onChange={(e) => setFormData({ ...formData, receiverCity: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>
          </div>

          {/* Customer Needs & Special Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Customer Requirements &amp; Special Handling Notes</span>
              <span className="text-[10px] text-amber-400 font-normal">Viewed by assigned staff</span>
            </label>
            <textarea
              rows={2}
              value={formData.customerNeeds}
              onChange={(e) => setFormData({ ...formData, customerNeeds: e.target.value })}
              placeholder="e.g. Temperature-controlled container, ring bell upon arrival, fragile glassware."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="fragile-check"
              checked={formData.fragile}
              onChange={(e) => setFormData({ ...formData, fragile: e.target.checked })}
              className="h-4 w-4 accent-amber-400 rounded cursor-pointer"
            />
            <label htmlFor="fragile-check" className="text-xs font-bold text-slate-300 cursor-pointer">
              Mark as High-Priority Fragile Consignment
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl transition shadow-lg shadow-sky-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Apply Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
