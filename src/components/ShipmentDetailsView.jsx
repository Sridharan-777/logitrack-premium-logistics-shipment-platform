import React from "react";
import {
  ArrowLeft,
  MapPin,
  Package,
  Scale,
  Layers,
  CreditCard,
  User,
  Phone,
  Mail,
  AlertTriangle,
  Printer,
  Globe,
} from "lucide-react";
import ThreeDCard from "./ThreeDCard";
import ThreeDPackageViewer from "./ThreeDPackageViewer";

export default function ShipmentDetailsView({ shipment, onBack, onTrack }) {
  if (!shipment) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl max-w-lg mx-auto space-y-4">
        <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-black text-white">Waybill Registry Not Found</h3>
        <button
          onClick={onBack}
          className="px-5 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-black"
        >
          Return to Ledger
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="px-4 py-2.5 border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Ledger
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => onTrack(shipment.id)}
            className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-black rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-1.5"
          >
            <Globe className="h-4 w-4" /> Locate on Live GPS Map
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <Printer className="h-4 w-4" /> Print Waybill
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Main Registry Overview */}
          <ThreeDCard className="p-6 bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                  WAYBILL REGISTRY ID
                </span>
                <h3 className="text-2xl font-black font-mono text-sky-400">{shipment.id}</h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  shipment.status === "In Transit"
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                    : shipment.status === "Delivered"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                }`}
              >
                {shipment.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono pt-4 border-t border-slate-800">
              <div>
                <span className="text-slate-500 block text-[10px]">BOOKED DATE</span>
                <span className="font-bold text-white">{shipment.bookingDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">SPEED SLA</span>
                <span className="font-bold text-amber-300">{shipment.speed}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">ESTIMATED ETA</span>
                <span className="font-bold text-sky-300">{shipment.estimatedDelivery}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">INSURANCE</span>
                <span className="font-bold text-emerald-300">{shipment.insurance ? "$50k Cover" : "Basic"}</span>
              </div>
            </div>
          </ThreeDCard>

          {/* Directory Details */}
          <ThreeDCard className="p-6 bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Contact Directories
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 text-xs font-medium text-slate-300">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-sky-400 font-bold uppercase">Origin Dispatcher</span>
                <p className="font-bold text-white text-sm">{shipment.senderName}</p>
                <p className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-500" /> {shipment.senderAddress}, {shipment.senderCity}</p>
                <p className="font-mono">{shipment.senderPhone}</p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Recipient Consignee</span>
                <p className="font-bold text-white text-sm">{shipment.receiverName}</p>
                <p className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-500" /> {shipment.receiverAddress}, {shipment.receiverCity}</p>
                <p className="font-mono">{shipment.receiverPhone}</p>
              </div>
            </div>
          </ThreeDCard>
        </div>

        {/* Right Side 3D Parcel Inspector */}
        <div className="space-y-6">
          <ThreeDPackageViewer
            weight={shipment.weight}
            category={shipment.category}
            dimensions={shipment.dimensions}
            fragile={shipment.fragile}
            insurance={shipment.insurance}
            trackingId={shipment.id}
          />

          <ThreeDCard className="p-5 bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Invoice Audit</h4>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Total Charged:</span>
              <span className="font-mono font-bold text-sky-300 text-base">${shipment.cost.toFixed(2)}</span>
            </div>
          </ThreeDCard>
        </div>
      </div>
    </div>
  );
}
