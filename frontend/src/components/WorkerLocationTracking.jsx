import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Capacitor, registerPlugin } from "@capacitor/core";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Crosshair,
  LocateFixed,
  MapPin,
  Navigation,
  PackageCheck,
  Play,
  Radio,
  RefreshCw,
  ShieldCheck,
  Square,
  UserRound,
  Users,
} from "lucide-react";
import apiClient from "../api/client.js";
import { ROLES } from "../data/mockData.js";

const WorkerTracking = registerPlugin("WorkerTracking");
const POLL_INTERVAL_MS = 8_000;
const LIVE_AFTER_MS = 30_000;

export async function stopWorkerTrackingDevice() {
  if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("WorkerTracking")) {
    await WorkerTracking.stopTracking();
  }
}

function dateValue(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateTime(value) {
  const date = dateValue(value);
  if (!date) return "Not available";
  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatRemaining(expiresAt, clock) {
  const expiry = dateValue(expiresAt);
  if (!expiry) return "8-hour limit";
  const remaining = Math.max(0, expiry.getTime() - clock);
  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1_000);
  return `${hours}h ${minutes}m ${seconds}s`;
}

function getLocationTimestamp(location) {
  return location?.receivedAt || location?.deviceTimestamp || location?.timestamp || null;
}

function normalizeLocation(location) {
  if (!location) return null;
  const coordinates = location.coordinates || location.location?.coordinates;
  const latitude = Number(location.latitude ?? location.lat ?? coordinates?.[1]);
  const longitude = Number(location.longitude ?? location.lng ?? location.lon ?? coordinates?.[0]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return {
    latitude,
    longitude,
    accuracy: Number(location.accuracy) || 0,
    deviceTimestamp: location.deviceTimestamp || location.timestamp || null,
    receivedAt: location.receivedAt || location.updatedAt || location.timestamp || null,
  };
}

function normalizeSession(value) {
  if (!value) return null;
  const session = value.session || value.tracking || value;
  return {
    ...session,
    active: Boolean(session.active),
    expiresAt: session.expiresAt || session.sessionExpiresAt || session.shiftExpiresAt || null,
    lastLocation: normalizeLocation(session.lastLocation || session.location),
  };
}

function trackingState(session, clock) {
  if (!session?.active) return "OFF_DUTY";
  const expiry = dateValue(session.expiresAt);
  if (expiry && expiry.getTime() <= clock) return "EXPIRED";
  if (!session.lastLocation) return "WAITING";
  const lastUpdate = dateValue(getLocationTimestamp(session.lastLocation));
  const stale = session.stale || !lastUpdate || clock - lastUpdate.getTime() > LIVE_AFTER_MS;
  return stale ? "STALE" : "LIVE";
}

function normalizeWorkerRows(payload) {
  const rows = Array.isArray(payload)
    ? payload
    : payload?.workers || payload?.sessions || payload?.items || [];

  return rows.map((row, index) => {
    const worker = row.worker || row.user || row.courier || {};
    const tracking = normalizeSession(row.tracking || row.session || (row.lastLocation ? row : null));
    return {
      id: String(worker.id || worker._id || row.workerId || row.id || `worker-${index}`),
      name: worker.name || row.workerName || "Assigned courier",
      avatar: worker.avatar || "",
      vehicleType: worker.vehicleType || worker.transportMode || row.vehicleType || "Delivery vehicle",
      vehiclePlate: worker.vehiclePlate || row.vehiclePlate || "Not assigned",
      zone: worker.zone || row.zone || "Current delivery zone",
      tracking,
      shipments: row.shipments || row.parcels || [],
    };
  });
}

function positionPayload(position) {
  const { coords } = position;
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy,
    timestamp: new Date(position.timestamp || Date.now()).toISOString(),
  };
}

function locationErrorMessage(error) {
  if (error?.code === 1) {
    return "Location permission was denied. Enable precise location for LogiTrack in your phone settings, then try again.";
  }
  if (error?.code === 2) return "Your phone cannot get a GPS fix. Turn on Location and move near a window or outdoors.";
  if (error?.code === 3) return "The GPS request timed out. Check Location and mobile data, then retry.";
  return error?.message || "Phone location is unavailable.";
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 25_000,
    });
  });
}

function statusStyle(state) {
  if (state === "LIVE") return { label: "Live", dot: "bg-emerald-400", badge: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300" };
  if (state === "STALE") return { label: "Signal stale", dot: "bg-amber-400", badge: "border-amber-400/30 bg-amber-500/10 text-amber-300" };
  if (state === "WAITING") return { label: "Waiting for GPS", dot: "bg-sky-400", badge: "border-sky-400/30 bg-sky-500/10 text-sky-300" };
  if (state === "EXPIRED") return { label: "Shift expired", dot: "bg-slate-400", badge: "border-slate-600 bg-slate-800 text-slate-300" };
  return { label: "Off duty", dot: "bg-slate-500", badge: "border-slate-700 bg-slate-900 text-slate-400" };
}

function StatusBadge({ state }) {
  const style = statusStyle(state);
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${style.badge}`}>
      <span className={`h-2 w-2 rounded-full ${style.dot}`} aria-hidden="true" />
      {style.label}
    </span>
  );
}

function WorkerLocationMap({ records, selectedId, onSelect }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layersRef = useRef(new Map());
  const signatureRef = useRef("");

  const visibleRecords = useMemo(
    () => records.filter((record) => {
      const state = trackingState(record.tracking, Date.now());
      return ["LIVE", "STALE", "WAITING"].includes(state) && record.tracking?.lastLocation;
    }),
    [records],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;
    const map = L.map(containerRef.current, { zoomControl: true }).setView([20.5937, 78.9629], 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      layersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const activeIds = new Set(visibleRecords.map((record) => record.id));

    for (const [id, layers] of layersRef.current.entries()) {
      if (!activeIds.has(id)) {
        layers.marker.remove();
        layers.accuracy.remove();
        layersRef.current.delete(id);
      }
    }

    visibleRecords.forEach((record) => {
      const point = record.tracking.lastLocation;
      const state = trackingState(record.tracking, Date.now());
      const color = state === "LIVE" ? "#10b981" : "#f59e0b";
      const latLng = [point.latitude, point.longitude];
      let layers = layersRef.current.get(record.id);

      if (!layers) {
        const marker = L.circleMarker(latLng, {
          radius: 9,
          weight: 3,
          color: "#ffffff",
          fillColor: color,
          fillOpacity: 1,
        }).addTo(map);
        const accuracy = L.circle(latLng, {
          radius: Math.max(point.accuracy || 0, 1),
          color,
          fillColor: color,
          fillOpacity: 0.08,
          weight: 1,
        }).addTo(map);
        const tooltip = document.createElement("div");
        const name = document.createElement("strong");
        name.textContent = record.name;
        const detail = document.createElement("div");
        detail.textContent = `${record.vehiclePlate} · ${statusStyle(state).label}`;
        tooltip.append(name, detail);
        marker.bindTooltip(tooltip, { direction: "top", offset: [0, -8] });
        marker.on("click", () => onSelect?.(record.id));
        layers = { marker, accuracy };
        layersRef.current.set(record.id, layers);
      }

      layers.marker.setLatLng(latLng).setStyle({ fillColor: color });
      layers.accuracy.setLatLng(latLng).setRadius(Math.max(point.accuracy || 0, 1)).setStyle({ color, fillColor: color });
    });

    const signature = visibleRecords
      .map((record) => `${record.id}:${record.tracking.lastLocation.latitude.toFixed(5)}:${record.tracking.lastLocation.longitude.toFixed(5)}`)
      .join("|");
    if (signature && signature !== signatureRef.current) {
      const bounds = L.latLngBounds(visibleRecords.map((record) => [record.tracking.lastLocation.latitude, record.tracking.lastLocation.longitude]));
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [45, 45], maxZoom: 16 });
      signatureRef.current = signature;
    }
  }, [visibleRecords, onSelect]);

  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const selected = visibleRecords.find((record) => record.id === selectedId);
    if (!selected) return;
    mapRef.current.flyTo(
      [selected.tracking.lastLocation.latitude, selected.tracking.lastLocation.longitude],
      16,
      { duration: 0.6 },
    );
  }, [selectedId, visibleRecords]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/70 shadow-2xl">
      <div ref={containerRef} className="h-[360px] w-full md:h-[480px]" aria-label="Authorized live worker locations map" />
      {visibleRecords.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 z-[500] grid place-items-center bg-slate-950/65 p-6 text-center backdrop-blur-sm">
          <div>
            <MapPin className="mx-auto mb-3 h-9 w-9 text-slate-400" />
            <p className="font-bold text-slate-200">No worker is sharing an active location</p>
            <p className="mt-1 text-sm text-slate-400">Off-duty coordinates are never displayed.</p>
          </div>
        </div>
      ) : null}
      <div className="absolute bottom-3 left-3 z-[600] flex gap-3 rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-[11px] font-bold text-slate-300 shadow-lg">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />Live</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" />Stale</span>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, tone = "text-sky-300" }) {
  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4 shadow-lg backdrop-blur-xl">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
        <Icon className={`h-4 w-4 ${tone}`} />
        {label}
      </div>
      <p className="mt-2 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function WorkerShiftPanel() {
  const [session, setSession] = useState(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [collector, setCollector] = useState(null);
  const [clock, setClock] = useState(Date.now());
  const watchRef = useRef(null);
  const sendTimerRef = useRef(null);
  const latestPositionRef = useRef(null);
  const sendingRef = useRef(false);

  const nativeTrackingAvailable = Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("WorkerTracking");
  const state = trackingState(session, clock);
  const isActive = ["LIVE", "STALE", "WAITING"].includes(state);

  const stopBrowserCollector = useCallback(() => {
    if (watchRef.current !== null) navigator.geolocation?.clearWatch(watchRef.current);
    if (sendTimerRef.current !== null) window.clearInterval(sendTimerRef.current);
    watchRef.current = null;
    sendTimerRef.current = null;
    latestPositionRef.current = null;
    sendingRef.current = false;
  }, []);

  const refreshSession = useCallback(async (quiet = false) => {
    try {
      const data = await apiClient.getMyWorkerLocationShift();
      setSession(normalizeSession(data.session));
      if (!quiet) setError("");
    } catch (requestError) {
      if (!quiet) setError(requestError.message);
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
    const poll = window.setInterval(() => refreshSession(true), POLL_INTERVAL_MS);
    const timer = window.setInterval(() => setClock(Date.now()), 1_000);
    const stopLocalCollector = () => {
      stopBrowserCollector();
      setCollector(null);
    };
    window.addEventListener("logitrack-stop-worker-location", stopLocalCollector);
    return () => {
      window.clearInterval(poll);
      window.clearInterval(timer);
      window.removeEventListener("logitrack-stop-worker-location", stopLocalCollector);
      stopBrowserCollector();
    };
  }, [refreshSession, stopBrowserCollector]);

  const sendBrowserPosition = useCallback(async () => {
    const position = latestPositionRef.current;
    if (!position || sendingRef.current) return;
    sendingRef.current = true;
    try {
      const data = await apiClient.updateWorkerLocation(positionPayload(position));
      setSession(normalizeSession(data.session));
      setError("");
      setMessage("Your authenticated phone is sharing duty location updates.");
    } catch (requestError) {
      setError(`Location update failed: ${requestError.message}`);
      if (!apiClient.getToken()) {
        stopBrowserCollector();
        setCollector(null);
      }
    } finally {
      sendingRef.current = false;
    }
  }, [stopBrowserCollector]);

  const beginBrowserCollector = useCallback((initialPosition) => {
    latestPositionRef.current = initialPosition;
    watchRef.current = navigator.geolocation.watchPosition(
      (position) => { latestPositionRef.current = position; },
      (positionError) => setError(locationErrorMessage(positionError)),
      { enableHighAccuracy: true, maximumAge: 2_000, timeout: 25_000 },
    );
    sendTimerRef.current = window.setInterval(sendBrowserPosition, POLL_INTERVAL_MS);
    setCollector("browser");
  }, [sendBrowserPosition]);

  useEffect(() => {
    if (!collector || isActive) return;
    stopBrowserCollector();
    setCollector(null);
    if (collector === "native") stopWorkerTrackingDevice().catch(() => {});
    if (state === "EXPIRED") setMessage("The eight-hour duty session expired. Confirm consent again to start a new shift.");
  }, [collector, isActive, state, stopBrowserCollector]);

  const handleStart = async () => {
    if (!consent) {
      setError("Confirm the duty-location consent before starting.");
      return;
    }
    if (!apiClient.getToken()) {
      setError("Your secure login has expired. Sign in again.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    stopBrowserCollector();

    try {
      if (nativeTrackingAvailable) {
        const startData = await apiClient.startWorkerLocationShift();
        try {
          await WorkerTracking.startTracking({
            apiUrl: apiClient.getBaseURL(),
            token: apiClient.getToken(),
          });
        } catch (nativeError) {
          await apiClient.stopWorkerLocationShift().catch(() => {});
          throw new Error(`Phone background tracking could not start: ${nativeError.message || "native service unavailable"}`);
        }
        setSession(normalizeSession(startData.session));
        setCollector("native");
        setMessage("Background GPS is running. Keep the LogiTrack notification enabled while on duty.");
      } else {
        if (!window.isSecureContext || !navigator.geolocation) {
          throw new Error("Open LogiTrack over HTTPS on a GPS-enabled phone to start duty tracking.");
        }
        const initialPosition = await getCurrentPosition();
        await apiClient.startWorkerLocationShift();
        try {
          const locationData = await apiClient.updateWorkerLocation(positionPayload(initialPosition));
          setSession(normalizeSession(locationData.session));
          beginBrowserCollector(initialPosition);
          setMessage("Live duty tracking started. Keep this browser page open for continuous updates.");
        } catch (updateError) {
          await apiClient.stopWorkerLocationShift().catch(() => {});
          throw updateError;
        }
      }
    } catch (startError) {
      setCollector(null);
      setError(locationErrorMessage(startError));
      await refreshSession(true);
    } finally {
      setBusy(false);
    }
  };

  const handleStop = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    stopBrowserCollector();
    setCollector(null);
    setSession((current) => current ? { ...current, active: false, status: "STOPPED", lastLocation: null, endedAt: new Date().toISOString() } : current);

    try {
      if (nativeTrackingAvailable) await stopWorkerTrackingDevice().catch(() => {});
      const data = await apiClient.stopWorkerLocationShift();
      setSession(normalizeSession(data.session));
      setConsent(false);
      setMessage("Duty tracking stopped. Your location is no longer visible on any LogiTrack map.");
    } catch (stopError) {
      setError(`Could not confirm tracking stopped: ${stopError.message}`);
      await refreshSession(true);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="grid min-h-[360px] place-items-center"><RefreshCw className="h-8 w-8 animate-spin text-amber-400" aria-label="Loading duty tracking" /></div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <section className="overflow-hidden rounded-3xl border border-amber-400/20 bg-slate-900/75 shadow-2xl backdrop-blur-2xl">
        <div className="border-b border-slate-700/80 bg-gradient-to-r from-amber-500/15 via-orange-500/5 to-transparent p-6 md:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-300">
                <Navigation className="h-4 w-4" /> Worker phone GPS
              </div>
              <h1 className="text-2xl font-black text-white md:text-3xl">Eight-hour duty location tracking</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Start this only when your delivery shift begins. Your phone sends GPS approximately every eight seconds so authorized operations staff and customers assigned to your parcels can follow the delivery.
              </p>
            </div>
            <StatusBadge state={state} />
          </div>
        </div>

        <div className="space-y-5 p-6 md:p-8">
          {error ? <div role="alert" className="flex gap-3 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-200"><AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />{error}</div> : null}
          {message ? <div role="status" className="flex gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-200"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />{message}</div> : null}

          <div className="grid gap-3 sm:grid-cols-3">
            <Metric icon={Clock3} label="Session remaining" value={isActive ? formatRemaining(session?.expiresAt, clock) : "Not on duty"} tone="text-amber-300" />
            <Metric icon={Radio} label="Last server update" value={session?.lastLocation ? formatDateTime(getLocationTimestamp(session.lastLocation)) : "No active fix"} tone="text-emerald-300" />
            <Metric icon={Crosshair} label="GPS accuracy" value={session?.lastLocation?.accuracy ? `±${Math.round(session.lastLocation.accuracy)} m` : "Waiting"} tone="text-sky-300" />
          </div>

          {!collector ? (
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-1 h-4 w-4 accent-amber-500"
              />
              <span>
                <strong className="block text-white">I consent to share my phone location during this delivery shift.</strong>
                Staff/admin can see this duty location. A customer can see it only when I am assigned to that customer’s active parcel. Tracking automatically expires after eight hours.
              </span>
            </label>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleStart}
              disabled={busy || !consent || Boolean(collector)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
              {isActive && !collector ? "Resume GPS updates" : "Start 8-hour duty tracking"}
            </button>
            <button
              type="button"
              onClick={handleStop}
              disabled={busy || !isActive}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-5 py-3 text-sm font-black text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Square className="h-4 w-4 fill-current" /> Stop and go off duty
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex gap-3 rounded-2xl border border-sky-400/20 bg-sky-500/5 p-4 text-sm text-slate-300">
              <ShieldCheck className="h-5 w-5 shrink-0 text-sky-400" />
              <p><strong className="text-sky-200">Privacy:</strong> stopping duty tracking immediately removes your coordinates from customer and operations maps.</p>
            </div>
            <div className="flex gap-3 rounded-2xl border border-slate-700 bg-slate-950/50 p-4 text-sm text-slate-300">
              <LocateFixed className="h-5 w-5 shrink-0 text-amber-400" />
              <p>{nativeTrackingAvailable ? "The Android app can keep tracking in the background with a permanent notification." : "Browser tracking requires this page to remain open; use the Android app for reliable background tracking."}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CourierCard({ record, clock, selected, onSelect, customerView }) {
  const state = trackingState(record.tracking, clock);
  const location = record.tracking?.lastLocation;
  return (
    <button
      type="button"
      onClick={() => onSelect(record.id)}
      className={`w-full rounded-2xl border p-4 text-left transition ${selected ? "border-sky-400 bg-sky-500/10 shadow-lg shadow-sky-500/10" : "border-slate-700/80 bg-slate-900/70 hover:border-slate-500"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-800 font-black text-sky-300">
            {record.avatar || record.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-black text-white">{record.name}</p>
            <p className="truncate text-xs text-slate-400">{record.vehicleType} · {record.vehiclePlate}</p>
          </div>
        </div>
        <StatusBadge state={state} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-slate-950/60 p-3">
          <span className="text-slate-500">Last update</span>
          <p className="mt-1 font-bold text-slate-200">{location && ["LIVE", "STALE", "WAITING"].includes(state) ? formatDateTime(getLocationTimestamp(location)) : "Not sharing"}</p>
        </div>
        <div className="rounded-xl bg-slate-950/60 p-3">
          <span className="text-slate-500">Accuracy</span>
          <p className="mt-1 font-bold text-slate-200">{location && ["LIVE", "STALE"].includes(state) ? `±${Math.round(location.accuracy || 0)} m` : "—"}</p>
        </div>
      </div>

      {record.shipments.length > 0 ? (
        <div className="mt-3 space-y-2">
          {record.shipments.map((shipment, index) => (
            <div key={shipment.id || shipment.trackingNumber || index} className="rounded-xl border border-slate-700/60 bg-slate-950/45 p-3 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono font-black text-sky-300">{shipment.trackingNumber || shipment.id || "Parcel"}</span>
                <span className="font-bold text-slate-300">{shipment.status || "Assigned"}</span>
              </div>
              {customerView && shipment.estimatedDelivery ? <p className="mt-1 text-slate-400">ETA: {shipment.estimatedDelivery}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
    </button>
  );
}

function OperationsTrackingPanel({ customerView = false }) {
  const [records, setRecords] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [clock, setClock] = useState(Date.now());

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setRefreshing(true);
    try {
      const data = customerView
        ? await apiClient.getCustomerWorkerLocations()
        : await apiClient.getActiveWorkerLocations();
      const next = normalizeWorkerRows(data);
      setRecords(next);
      setSelectedId((current) => current && next.some((row) => row.id === current) ? current : next[0]?.id || null);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [customerView]);

  useEffect(() => {
    load();
    const poll = window.setInterval(() => load(true), POLL_INTERVAL_MS);
    const timer = window.setInterval(() => setClock(Date.now()), 1_000);
    return () => {
      window.clearInterval(poll);
      window.clearInterval(timer);
    };
  }, [load]);

  const counts = useMemo(() => records.reduce((result, record) => {
    const state = trackingState(record.tracking, clock);
    if (state === "LIVE") result.live += 1;
    else if (["STALE", "WAITING"].includes(state)) result.stale += 1;
    else result.offDuty += 1;
    return result;
  }, { live: 0, stale: 0, offDuty: 0 }), [records, clock]);

  return (
    <div className="mx-auto max-w-[1500px] space-y-5">
      <section className="rounded-3xl border border-slate-700/80 bg-slate-900/75 p-6 shadow-2xl backdrop-blur-2xl md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-sky-300">
              {customerView ? <PackageCheck className="h-4 w-4" /> : <Users className="h-4 w-4" />}
              {customerView ? "Parcel courier tracking" : "Authorized operations view"}
            </div>
            <h1 className="text-2xl font-black text-white md:text-3xl">{customerView ? "Your assigned courier" : "Live worker operations map"}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              {customerView
                ? "Only the courier assigned to your parcel appears here, and only while that courier is on an active delivery shift."
                : "Monitor authenticated workers who explicitly started duty tracking. Positions refresh approximately every eight seconds."}
            </p>
          </div>
          <button type="button" onClick={() => load()} disabled={refreshing} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-200 hover:bg-slate-700 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        {error ? <div role="alert" className="mt-5 flex gap-3 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-200"><AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />{error}</div> : null}

        {!customerView ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Metric icon={Radio} label="Live workers" value={counts.live} tone="text-emerald-300" />
            <Metric icon={AlertTriangle} label="Waiting / stale" value={counts.stale} tone="text-amber-300" />
            <Metric icon={UserRound} label="Off duty" value={counts.offDuty} tone="text-slate-400" />
          </div>
        ) : null}
      </section>

      {loading ? (
        <div className="grid min-h-[420px] place-items-center rounded-3xl border border-slate-700 bg-slate-900/70"><RefreshCw className="h-8 w-8 animate-spin text-sky-400" aria-label="Loading worker locations" /></div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
          <WorkerLocationMap records={records} selectedId={selectedId} onSelect={setSelectedId} />
          <section className="max-h-[480px] space-y-3 overflow-y-auto pr-1" aria-label={customerView ? "Assigned couriers" : "Worker tracking status"}>
            {records.length === 0 ? (
              <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 text-center">
                <MapPin className="mx-auto mb-3 h-8 w-8 text-slate-500" />
                <p className="font-bold text-slate-200">{customerView ? "No courier is assigned to an active parcel" : "No worker records available"}</p>
                <p className="mt-1 text-sm text-slate-400">{customerView ? "Tracking will appear after staff assigns a worker and that worker starts duty sharing." : "Workers appear after signing in and starting their duty session."}</p>
              </div>
            ) : records.map((record) => (
              <CourierCard
                key={record.id}
                record={record}
                clock={clock}
                selected={record.id === selectedId}
                onSelect={setSelectedId}
                customerView={customerView}
              />
            ))}
          </section>
        </div>
      )}

      <div className="flex gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4 text-sm text-slate-300 backdrop-blur-xl">
        <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />
        <p><strong className="text-white">Privacy enforced:</strong> off-duty and expired coordinates are hidden. A stale marker is a last known duty position, not a claim that the worker is currently there.</p>
      </div>
    </div>
  );
}

export default function WorkerLocationTracking({ user }) {
  if (user?.systemRole === ROLES.WORKER) return <WorkerShiftPanel />;
  if (user?.systemRole === ROLES.ADMIN || user?.systemRole === ROLES.STAFF) return <OperationsTrackingPanel />;
  return <OperationsTrackingPanel customerView />;
}
