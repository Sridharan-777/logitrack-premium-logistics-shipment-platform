import React, { useState, useEffect } from "react";
import {
  Search, AlertCircle, Phone, ChevronDown, ChevronUp, ArrowRight,
  Package, MapPin, Clock, Truck, Plane, Ship, Anchor,
  CheckCircle2, Circle, Warehouse, Building2, Home, Box,
} from "lucide-react";
import ThreeDTrackMap from "./ThreeDTrackMap";

// ─── Timeline checkpoint icon logic ──────────────────────────
function getCheckpointIcon(status, location, idx, total) {
  const loc = (location || "").toLowerCase();
  const st = (status || "").toLowerCase();
  if (st.includes("deliver") || idx === 0) return <Home className="h-3.5 w-3.5" />;
  if (loc.includes("airport") || loc.includes("flight") || st.includes("flight")) return <Plane className="h-3.5 w-3.5" />;
  if (loc.includes("port") || loc.includes("dock") || st.includes("ship")) return <Anchor className="h-3.5 w-3.5" />;
  if (loc.includes("hub") || loc.includes("sort") || loc.includes("warehouse") || loc.includes("facility")) return <Warehouse className="h-3.5 w-3.5" />;
  if (loc.includes("customs") || loc.includes("border")) return <Building2 className="h-3.5 w-3.5" />;
  if (st.includes("out for") || st.includes("dispatch")) return <Truck className="h-3.5 w-3.5" />;
  if (idx === total - 1) return <Box className="h-3.5 w-3.5" />;
  return <MapPin className="h-3.5 w-3.5" />;
}

export default function TrackingView({ shipments, selectedShipmentId, onSelectShipment, onNavigate }) {
  const [searchVal, setSearchVal] = useState("");
  const [activeShipment, setActiveShipment] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [contactSuccess, setContactSuccess] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  useEffect(() => {
    if (selectedShipmentId) {
      const match = shipments.find((s) => s.id === selectedShipmentId);
      if (match) { setActiveShipment(match); setSearchVal(selectedShipmentId); setErrorMsg(""); }
      else setErrorMsg(`Waybill '${selectedShipmentId}' not found.`);
    } else if (shipments.length > 0) {
      const pick = shipments.find((s) => s.status === "In Transit") || shipments[0];
      setActiveShipment(pick); setSearchVal(pick.id);
    }
  }, [selectedShipmentId, shipments]);

  const handleSearch = (e) => {
    e.preventDefault(); setErrorMsg(""); setContactSuccess(false);
    if (!searchVal.trim()) return;
    const q = searchVal.trim().toUpperCase();
    const match = shipments.find((s) => s.id === q);
    if (match) { setActiveShipment(match); setErrorMsg(""); }
    else setErrorMsg(`Waybill '${q}' not found in system.`);
  };

  const handleSelect = (e) => {
    const match = shipments.find((s) => s.id === e.target.value);
    if (match) { setActiveShipment(match); setSearchVal(match.id); setErrorMsg(""); }
  };

  const handleContact = () => { setContactSuccess(true); setTimeout(() => setContactSuccess(false), 4000); };

  const isDelivered = activeShipment?.status === "Delivered";
  const timeline = activeShipment?.timeline || [];

  return (
    <div className="w-full max-w-[1600px] mx-auto font-sans space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
        <span><strong>Route simulation:</strong> animated positions are estimated, not live GPS. Icons switch between road, air, and sea legs.</span>
        <button type="button" onClick={() => onNavigate("fleet-live")} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-black text-slate-950 hover:bg-emerald-400">Open actual phone GPS</button>
      </div>
      {/* ── Compact Search Bar ── */}
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-3 shadow-xl">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400" />
            <input
              type="text" value={searchVal} onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search tracking ID (e.g. TRK-8924-M)"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono font-bold text-slate-100 focus:outline-none focus:border-sky-500 placeholder-slate-500"
            />
          </div>
          <div className="relative shrink-0">
            <select value={activeShipment?.id || ""} onChange={handleSelect}
              className="appearance-none bg-slate-950 border border-slate-800 text-sky-300 font-mono font-bold text-xs px-3 py-2.5 pr-9 rounded-xl focus:outline-none focus:border-sky-500 cursor-pointer w-full sm:w-auto">
              {shipments.map((s) => <option key={s.id} value={s.id}>{s.id} ({s.status})</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sky-400 pointer-events-none" />
          </div>
          <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition cursor-pointer shrink-0">
            Locate
          </button>
        </form>
        {errorMsg && (
          <div className="mt-2 p-2.5 bg-rose-500/10 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" /> {errorMsg}
          </div>
        )}
      </div>

      {/* ── Main Content: Map (primary) + Side Panel ── */}
      {activeShipment && (
        <div className="flex gap-3" style={{ minHeight: "calc(100vh - 200px)" }}>
          {/* MAP — takes majority of the space */}
          <div className="flex-1 min-w-0 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl" style={{ minHeight: "72vh" }}>
            <ThreeDTrackMap activeShipment={activeShipment} />
          </div>

          {/* Side Panel — collapsible */}
          <div className={`transition-all duration-300 ${panelOpen ? "w-[320px] lg:w-[360px]" : "w-10"} shrink-0 hidden md:flex flex-col`}>
            {/* Toggle button */}
            <button
              onClick={() => setPanelOpen((p) => !p)}
              className="mb-2 self-start bg-slate-900/95 border border-slate-700/80 rounded-xl p-2 text-slate-400 hover:text-sky-300 transition cursor-pointer"
              title={panelOpen ? "Collapse panel" : "Expand panel"}
            >
              {panelOpen ? <ChevronUp className="h-4 w-4 rotate-90" /> : <ChevronDown className="h-4 w-4 -rotate-90" />}
            </button>

            {panelOpen && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}>
                {/* Waybill Summary */}
                <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider">Waybill Manifest</span>
                    <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                      isDelivered ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : activeShipment.status === "In Transit" || activeShipment.status === "Out for Delivery"
                      ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    }`}>{activeShipment.status}</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black font-mono text-white">{activeShipment.id}</h3>
                    <div className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-amber-400 shrink-0" /> {activeShipment.senderCity}
                      <ArrowRight className="h-3 w-3 text-slate-600" />
                      <MapPin className="h-3 w-3 text-emerald-400 shrink-0" /> {activeShipment.receiverCity}
                    </div>
                  </div>

                  {/* Key stats grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { label: "ETA", value: activeShipment.estimatedDelivery || "—", color: "text-sky-300" },
                      { label: "Speed SLA", value: activeShipment.speed || "—", color: "text-amber-300" },
                      { label: "Transport", value: (activeShipment.transportModeUsed || "truck").toUpperCase(), color: "text-purple-300" },
                      { label: "Weight", value: activeShipment.weight ? `${activeShipment.weight} kg` : "—", color: "text-slate-300" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-500 text-[9px] block font-bold uppercase">{label}</span>
                        <span className={`${color} font-bold font-mono text-[11px] truncate block`}>{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Sender / Receiver */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex gap-2 items-start">
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[8px] font-black text-amber-400">A</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Sender</span>
                        <span className="text-xs text-white font-bold block truncate">{activeShipment.senderName || "—"}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{activeShipment.senderAddress || ""}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[8px] font-black text-emerald-400">B</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Receiver</span>
                        <span className="text-xs text-white font-bold block truncate">{activeShipment.receiverName || "—"}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{activeShipment.receiverAddress || ""}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivered proof */}
                  {isDelivered && activeShipment.proofOfDelivery && (
                    <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Delivery Confirmed
                      </div>
                      <div className="text-[10px] text-slate-400 space-y-0.5">
                        <div>Signed by: <span className="text-slate-200 font-bold">{activeShipment.proofOfDelivery.signedBy}</span></div>
                        <div>Time: <span className="text-slate-300 font-mono">{activeShipment.proofOfDelivery.timestamp}</span></div>
                      </div>
                    </div>
                  )}

                  {/* Contact dispatch */}
                  {contactSuccess && (
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl text-center">
                      Connecting to dispatch for {activeShipment.id}...
                    </div>
                  )}
                  <button onClick={handleContact}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer">
                    <Phone className="h-3.5 w-3.5 text-sky-400" /> Contact Carrier
                  </button>
                </div>

                {/* ── Checkpoint Timeline ── */}
                <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-xl">
                  <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-4">
                    Shipment Timeline
                  </h4>

                  {timeline.length === 0 ? (
                    <p className="text-xs text-slate-600 italic">No timeline data available.</p>
                  ) : (
                    <div className="relative pl-8 space-y-0">
                      {/* Vertical line */}
                      <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-sky-500 via-slate-700 to-slate-800 rounded-full" />

                      {timeline.map((evt, idx) => {
                        const isCurrent = idx === 0;
                        const isLast = idx === timeline.length - 1;
                        const icon = getCheckpointIcon(evt.status, evt.location, idx, timeline.length);

                        return (
                          <div key={evt.id || idx} className="relative pb-5 last:pb-0">
                            {/* Node */}
                            <div className={`absolute -left-8 top-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 ${
                              isCurrent
                                ? "bg-sky-500/20 border-sky-500 text-sky-400 shadow-lg shadow-sky-500/20"
                                : "bg-slate-800 border-slate-700 text-slate-500"
                            }`}>
                              {icon}
                            </div>

                            {/* Content */}
                            <div className="space-y-0.5">
                              <div className="flex items-center justify-between text-[10px] font-mono">
                                <span className={`font-bold ${isCurrent ? "text-sky-400" : "text-slate-500"}`}>{evt.time}</span>
                                <span className="text-slate-600">{evt.location}</span>
                              </div>
                              <h5 className={`text-xs font-bold ${isCurrent ? "text-white" : "text-slate-400"}`}>{evt.status}</h5>
                              <p className="text-[10px] text-slate-500 leading-relaxed">{evt.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Item description */}
                {activeShipment.itemDescription && (
                  <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Package</span>
                    </div>
                    <p className="text-xs text-slate-300">{activeShipment.itemDescription}</p>
                    {activeShipment.customerNeeds && (
                      <p className="text-[10px] text-amber-400/80 mt-2 font-bold italic">{activeShipment.customerNeeds}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
