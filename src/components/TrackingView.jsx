import React, { useState, useEffect } from "react";
import { Search, AlertCircle, Truck, Phone, Globe, ChevronDown, MapPin, Activity } from "lucide-react";
import ThreeDTrackMap from "./ThreeDTrackMap";
import ThreeDCard from "./ThreeDCard";

export default function TrackingView({ shipments, initialSearchId }) {
  const [searchVal, setSearchVal] = useState("");
  const [activeShipment, setActiveShipment] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [contactSuccess, setContactSuccess] = useState(false);

  useEffect(() => {
    if (initialSearchId) {
      const match = shipments.find((s) => s.id === initialSearchId);
      if (match) {
        setActiveShipment(match);
        setSearchVal(initialSearchId);
        setErrorMsg("");
      } else {
        setErrorMsg(`Waybill registry '${initialSearchId}' could not be resolved.`);
      }
    } else if (shipments.length > 0) {
      const transitOne = shipments.find((s) => s.status === "In Transit") || shipments[0];
      setActiveShipment(transitOne);
      setSearchVal(transitOne.id);
    }
  }, [initialSearchId, shipments]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setContactSuccess(false);

    if (!searchVal.trim()) return;

    const query = searchVal.trim().toUpperCase();
    const match = shipments.find((s) => s.id === query);

    if (match) {
      setActiveShipment(match);
    } else {
      setErrorMsg(`Waybill registry '${query}' could not be located in active 3D database.`);
    }
  };

  const handleSelectDropdown = (e) => {
    const selectedId = e.target.value;
    const match = shipments.find((s) => s.id === selectedId);
    if (match) {
      setActiveShipment(match);
      setSearchVal(match.id);
      setErrorMsg("");
    }
  };

  const handleContactCourier = () => {
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
    }, 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* 3D Search & Switcher Bar */}
      <ThreeDCard className="p-4 bg-slate-900/90 border border-slate-800 shadow-xl rounded-2xl">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-sky-400">
              <Search className="h-5 w-5" />
            </span>
            <input
              id="live-track-search-input"
              type="text"
              placeholder="Search Waybill Code (e.g. TRK-8924-M, TRK-900112-E)"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono font-bold text-slate-100 focus:outline-none focus:border-sky-500 placeholder-slate-500"
            />
          </div>

          {/* Quick Dropdown Select */}
          <div className="relative">
            <select
              value={activeShipment ? activeShipment.id : ""}
              onChange={handleSelectDropdown}
              className="appearance-none bg-slate-950 border border-slate-800 text-sky-300 font-mono font-bold text-xs px-4 py-3.5 pr-10 rounded-xl focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              {shipments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} ({s.status})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-sky-400 pointer-events-none" />
          </div>

          <button
            type="submit"
            id="btn-live-track-submit"
            className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition"
          >
            Locate on Live GPS Map
          </button>
        </form>

        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
      </ThreeDCard>

      {activeShipment && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 3D Satellite Globe Canvas */}
          <div className="lg:col-span-2 space-y-6">
            <ThreeDTrackMap activeShipment={activeShipment} />
          </div>

          {/* Right Checklist & Details */}
          <div className="space-y-6">
            {/* Active Waybill Summary Card */}
            <ThreeDCard className="p-6 bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-sky-400">WAYBILL MANIFEST</span>
                <span
                  className={`px-3 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                    activeShipment.status === "In Transit"
                      ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                      : activeShipment.status === "Delivered"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  }`}
                >
                  {activeShipment.status}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black font-mono text-white">{activeShipment.id}</h3>
                <p className="text-xs font-medium text-slate-400 mt-1">
                  {activeShipment.senderCity} → {activeShipment.receiverCity}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-xs font-mono">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] block font-semibold">ESTIMATED ETA</span>
                  <span className="text-sky-300 font-bold">{activeShipment.estimatedDelivery}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] block font-semibold">SPEED SLA</span>
                  <span className="text-amber-300 font-bold">{activeShipment.speed}</span>
                </div>
              </div>

              {contactSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl text-center">
                  Connecting to dispatch officer for {activeShipment.id}...
                </div>
              )}

              <button
                onClick={handleContactCourier}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Phone className="h-4 w-4 text-sky-400" /> Contact Carrier Dispatch
              </button>
            </ThreeDCard>

            {/* Waybill Checkpoints Timeline */}
            <ThreeDCard className="p-6 bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                3D Checkpoint Timeline
              </h4>

              <div className="relative pl-5 border-l border-slate-800 space-y-4 py-1">
                {activeShipment.timeline &&
                  activeShipment.timeline.map((evt, idx) => (
                    <div key={evt.id || idx} className="relative space-y-1">
                      <span
                        className={`absolute -left-[25px] top-1.5 h-3 w-3 rounded-full border-2 ${
                          idx === 0 ? "bg-sky-400 border-slate-950 ring-4 ring-sky-500/20" : "bg-slate-700 border-slate-950"
                        }`}
                      />
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 font-bold">
                        <span>{evt.time}</span>
                        <span>{evt.location}</span>
                      </div>
                      <h5 className="text-xs font-bold text-white">{evt.status}</h5>
                      <p className="text-[11px] text-slate-400 leading-normal">{evt.description}</p>
                    </div>
                  ))}
              </div>
            </ThreeDCard>
          </div>
        </div>
      )}
    </div>
  );
}
