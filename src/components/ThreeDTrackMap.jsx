import React, { useRef, useEffect, useState, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Compass,
  Globe,
  Maximize2,
  Navigation,
  Activity,
  Layers,
  MapPin,
  Truck,
  Plane,
  Ship,
  Car,
  Play,
  Pause,
  Locate,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Clock,
  Anchor,
  Wind,
} from "lucide-react";

// Geographic Coordinates DB (Lat, Lon)
const ACCURATE_COORDINATES = {
  Kovilpatti: { lat: 9.1726, lon: 77.8698, label: "Kovilpatti HQ Hub", country: "India" },
  Chennai: { lat: 13.0827, lon: 80.2707, label: "Chennai Airbase Gateway", country: "India" },
  Mumbai: { lat: 19.076, lon: 72.8777, label: "Mumbai Sea Port / Air Cargo", country: "India" },
  Bangalore: { lat: 12.9716, lon: 77.5946, label: "Bangalore Tech Logistics Hub", country: "India" },
  Delhi: { lat: 28.6139, lon: 77.209, label: "Delhi Central Hub", country: "India" },
  Hamburg: { lat: 53.5511, lon: 9.9937, label: "Hamburg Port & Distribution Yard", country: "Germany" },
  Frankfurt: { lat: 50.1109, lon: 8.6821, label: "Frankfurt Central Airbase Hub", country: "Germany" },
  Berlin: { lat: 52.52, lon: 13.405, label: "Berlin Central Distribution", country: "Germany" },
  Munich: { lat: 48.1351, lon: 11.582, label: "Munich Southern Hub", country: "Germany" },
  London: { lat: 51.5074, lon: -0.1278, label: "London Canary Wharf Logistics Port", country: "United Kingdom" },
  Paris: { lat: 48.8566, lon: 2.3522, label: "Paris Sorbonne Facility", country: "France" },
  Amsterdam: { lat: 52.3676, lon: 4.9041, label: "Amsterdam Schiphol Cargo Base", country: "Netherlands" },
  Rotterdam: { lat: 51.9244, lon: 4.4777, label: "Rotterdam Deepsea Container Port", country: "Netherlands" },
  Brussels: { lat: 50.8503, lon: 4.3517, label: "Brussels EU Transit Gateway", country: "Belgium" },
  "New York": { lat: 40.7128, lon: -74.006, label: "New York JFK / Red Hook Terminal", country: "United States" },
  "Los Angeles": { lat: 34.0522, lon: -118.2437, label: "LAX Port & Logistics Yard", country: "United States" },
  Chicago: { lat: 41.8781, lon: -87.6298, label: "Chicago O'Hare Freight Port", country: "United States" },
  Tokyo: { lat: 35.6762, lon: 139.6503, label: "Tokyo Narita & Port Hub", country: "Japan" },
  Singapore: { lat: 1.3521, lon: 103.8198, label: "Singapore Changi / PSA Terminal", country: "Singapore" },
  Dubai: { lat: 25.2048, lon: 55.2708, label: "Dubai Jebel Ali Port & Air Cargo City", country: "UAE" },
  Sydney: { lat: -33.8688, lon: 151.2093, label: "Sydney Kingsford Smith / Botany Port", country: "Australia" },
};

// Premium High-Definition Tile Layers (100% Free, Zero Watermark, Dark Cyber Aesthetic)
const TILE_LAYERS = {
  dark: {
    name: "Cyber Dark",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 16,
    className: "cyber-dark-tiles",
  },
  satellite: {
    name: "Satellite HD",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 19,
  },
  street: {
    name: "Street Map",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    maxZoom: 19,
  },
  voyager: {
    name: "Midnight Ocean",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 13,
    className: "cyber-ocean-tiles",
  },
};

// Vehicle Icons
const VEHICLE_SVGS = {
  flight: `
    <svg viewBox="0 0 36 36" fill="none" style="width: 26px; height: 26px;" class="drop-shadow-md">
      <path d="M18 2 L14 12 L4 16 L4 19 L14 17 L14 26 L10 29 L10 32 L18 30 L26 32 L26 29 L22 26 L22 17 L32 19 L32 16 L22 12 Z" 
            fill="#38bdf8" stroke="#0284c7" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="18" cy="7" r="1.5" fill="#ffffff"/>
    </svg>
  `,
  ship: `
    <svg viewBox="0 0 36 36" fill="none" style="width: 26px; height: 26px;" class="drop-shadow-md">
      <path d="M18 3 L10 12 L10 27 C10 31 26 31 26 27 L26 12 Z" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
      <rect x="13" y="14" width="10" height="9" rx="1.5" fill="#0369a1" stroke="#bae6fd" stroke-width="1"/>
      <circle cx="18" cy="8" r="2" fill="#38bdf8"/>
      <path d="M7 26 C12 30 24 30 29 26" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,
  truck: `
    <svg viewBox="0 0 36 36" fill="none" style="width: 26px; height: 26px;" class="drop-shadow-md">
      <rect x="11" y="4" width="14" height="20" rx="3" fill="#f59e0b" stroke="#b45309" stroke-width="1.5"/>
      <rect x="13" y="24" width="10" height="8" rx="2" fill="#d97706"/>
      <circle cx="9" cy="10" r="2" fill="#1e293b"/>
      <circle cx="27" cy="10" r="2" fill="#1e293b"/>
      <circle cx="9" cy="28" r="2" fill="#1e293b"/>
      <circle cx="27" cy="28" r="2" fill="#1e293b"/>
      <rect x="13" y="6" width="10" height="5" rx="1" fill="#fef3c7"/>
    </svg>
  `,
  van: `
    <svg viewBox="0 0 36 36" fill="none" style="width: 26px; height: 26px;" class="drop-shadow-md">
      <rect x="11" y="6" width="14" height="24" rx="4" fill="#10b981" stroke="#047857" stroke-width="1.5"/>
      <rect x="13" y="8" width="10" height="6" rx="1.5" fill="#a7f3d0"/>
      <circle cx="9" cy="12" r="2" fill="#1e293b"/>
      <circle cx="27" cy="12" r="2" fill="#1e293b"/>
      <circle cx="9" cy="26" r="2" fill="#1e293b"/>
      <circle cx="27" cy="26" r="2" fill="#1e293b"/>
    </svg>
  `,
  "two-wheeler": `
    <svg viewBox="0 0 36 36" fill="none" style="width: 26px; height: 26px;" class="drop-shadow-md">
      <circle cx="9" cy="25" r="5.5" stroke="#f59e0b" stroke-width="2.5" fill="#1e293b"/>
      <circle cx="27" cy="25" r="5.5" stroke="#f59e0b" stroke-width="2.5" fill="#1e293b"/>
      <path d="M9 25 L16 16 L22 16 L27 25 M16 16 L13 8 L8 8 M22 16 L21 8" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="18" cy="13" r="2.5" fill="#f59e0b"/>
    </svg>
  `,
  bike: `
    <svg viewBox="0 0 36 36" fill="none" style="width: 26px; height: 26px;" class="drop-shadow-md">
      <circle cx="9" cy="25" r="5.5" stroke="#10b981" stroke-width="2.5" fill="#1e293b"/>
      <circle cx="27" cy="25" r="5.5" stroke="#10b981" stroke-width="2.5" fill="#1e293b"/>
      <path d="M9 25 L16 16 L22 16 L27 25 M16 16 L13 8 L8 8 M22 16 L21 8" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="18" cy="13" r="2.5" fill="#10b981"/>
    </svg>
  `,
};

// Haversine Distance (km)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Bearing Angle calculation (0° = North, 90° = East)
function calculateBearing(lat1, lon1, lat2, lon2) {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  let theta = Math.atan2(y, x);
  let bearing = (theta * 180) / Math.PI;
  return (bearing + 360) % 360;
}

function getBearingDirection(deg) {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

// Catmull-Rom Spline point interpolation for smooth curved paths
function interpolateCatmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;

  const lat =
    0.5 *
    (2 * p1[0] +
      (-p0[0] + p2[0]) * t +
      (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
      (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);

  const lon =
    0.5 *
    (2 * p1[1] +
      (-p0[1] + p2[1]) * t +
      (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
      (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);

  return [lat, lon];
}

// Generate smooth multi-waypoint path with curve smoothing
function generateSmoothRoutePoints(start, end, intermediate = [], totalSteps = 140) {
  const allWaypoints = [start, ...intermediate, end];
  if (allWaypoints.length === 2) {
    // Gentle arc for direct routes
    const p1 = allWaypoints[0];
    const p2 = allWaypoints[1];
    const midLat = (p1[0] + p2[0]) / 2 + (p2[1] - p1[1]) * 0.08;
    const midLon = (p1[1] + p2[1]) / 2 - (p2[0] - p1[0]) * 0.08;
    allWaypoints.splice(1, 0, [midLat, midLon]);
  }

  const extended = [allWaypoints[0], ...allWaypoints, allWaypoints[allWaypoints.length - 1]];
  const path = [];
  const segments = extended.length - 3;
  const stepsPerSegment = Math.max(15, Math.floor(totalSteps / segments));

  for (let i = 0; i < segments; i++) {
    const p0 = extended[i];
    const p1 = extended[i + 1];
    const p2 = extended[i + 2];
    const p3 = extended[i + 3];

    for (let s = 0; s <= stepsPerSegment; s++) {
      const t = s / stepsPerSegment;
      path.push(interpolateCatmullRom(p0, p1, p2, p3, t));
    }
  }

  return path;
}

export default function ThreeDTrackMap({
  activeShipment,
  shipment,
}) {
  const currentShipment = activeShipment || shipment || {
    senderCity: "Hamburg",
    receiverCity: "London",
    currentLocation: "Frankfurt Hub",
    id: "TRK-8924-M",
    speed: "Express",
    status: "In Transit",
    category: "Electronics",
    timeline: [],
  };

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const courierMarkerRef = useRef(null);
  const traveledPolylineRef = useRef(null);
  const remainingPolylineRef = useRef(null);
  const tileLayerRef = useRef(null);
  const smoothedBearingRef = useRef(0);
  const lastPanTimeRef = useRef(0);

  // Map Controls State
  const [currentLayer, setCurrentLayer] = useState("dark");
  const [isPlaying, setIsPlaying] = useState(true);
  const [followCourier, setFollowCourier] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);
  const [progress, setProgress] = useState(0.45);

  // Transport Mode Selection: "auto", "flight", "ship", "truck", "van"
  const [selectedTransportMode, setSelectedTransportMode] = useState("auto");

  // Determine active transport mode
  const currentMode = useMemo(() => {
    if (selectedTransportMode !== "auto") return selectedTransportMode;

    const speed = currentShipment.speed?.toLowerCase() || "";
    const cat = currentShipment.category?.toLowerCase() || "";

    if (speed.includes("ocean") || speed.includes("sea") || cat.includes("sea") || cat.includes("heavy")) {
      return "ship";
    }
    if (speed.includes("express") || speed.includes("flight") || speed.includes("air")) {
      return "flight";
    }
    if (speed.includes("same-day") || speed.includes("local")) {
      return "van";
    }
    return "truck";
  }, [selectedTransportMode, currentShipment]);

  // Live Telemetry Readout
  const [telemetry, setTelemetry] = useState({
    lat: "0.0000° N",
    lon: "0.0000° E",
    alt: "0 m",
    speed: "0 km/h",
    bearing: "0° N",
    bearingDeg: 0,
    distanceRemaining: "0 km",
    totalDistance: "0 km",
    etaMinutes: 0,
    currentLocationName: "In Transit",
  });

  // Resolve City Coordinate
  const getCityCoordinate = (cityName) => {
    if (!cityName) return [51.5074, -0.1278];
    const clean = cityName.trim();

    if (ACCURATE_COORDINATES[clean]) {
      return [ACCURATE_COORDINATES[clean].lat, ACCURATE_COORDINATES[clean].lon];
    }

    const matchedKey = Object.keys(ACCURATE_COORDINATES).find((k) =>
      k.toLowerCase().includes(clean.toLowerCase()) || clean.toLowerCase().includes(k.toLowerCase())
    );
    if (matchedKey) {
      return [ACCURATE_COORDINATES[matchedKey].lat, ACCURATE_COORDINATES[matchedKey].lon];
    }

    let hash = 0;
    for (let i = 0; i < clean.length; i++) {
      hash = clean.charCodeAt(i) + ((hash << 5) - hash);
    }
    const lat = 10 + (Math.abs(hash) % 45);
    const lon = -10 + (Math.abs(hash * 3) % 90);
    return [lat, lon];
  };

  const originCoord = useMemo(
    () => getCityCoordinate(currentShipment.senderCity || "Hamburg"),
    [currentShipment.senderCity]
  );
  const destCoord = useMemo(
    () => getCityCoordinate(currentShipment.receiverCity || "London"),
    [currentShipment.receiverCity]
  );

  const intermediateCoords = useMemo(() => {
    const list = [];
    if (currentShipment.timeline && currentShipment.timeline.length > 0) {
      currentShipment.timeline.forEach((item) => {
        if (
          item.location &&
          !item.location.toLowerCase().includes(currentShipment.senderCity?.toLowerCase() || "") &&
          !item.location.toLowerCase().includes(currentShipment.receiverCity?.toLowerCase() || "")
        ) {
          list.push(getCityCoordinate(item.location));
        }
      });
    } else if (
      currentShipment.currentLocation &&
      !currentShipment.currentLocation.toLowerCase().includes(currentShipment.senderCity?.toLowerCase() || "") &&
      !currentShipment.currentLocation.toLowerCase().includes(currentShipment.receiverCity?.toLowerCase() || "")
    ) {
      list.push(getCityCoordinate(currentShipment.currentLocation));
    }
    return list;
  }, [currentShipment]);

  const routePoints = useMemo(
    () => generateSmoothRoutePoints(originCoord, destCoord, intermediateCoords, 140),
    [originCoord, destCoord, intermediateCoords]
  );

  const totalRouteDistKm = useMemo(() => {
    let total = 0;
    for (let i = 0; i < routePoints.length - 1; i++) {
      total += calculateDistance(
        routePoints[i][0],
        routePoints[i][1],
        routePoints[i + 1][0],
        routePoints[i + 1][1]
      );
    }
    return Math.round(total);
  }, [routePoints]);

  // Create Non-Jittering Vehicle Marker HTML
  const createVehicleMarkerHtml = (mode) => {
    const svgCode = VEHICLE_SVGS[mode] || VEHICLE_SVGS.flight;
    const isFlight = mode === "flight";
    const isShip = mode === "ship";
    const isTruck = mode === "truck";

    const badgeColor = isFlight
      ? "background: rgba(8, 47, 73, 0.95); border: 2px solid #38bdf8; box-shadow: 0 0 15px rgba(56, 189, 248, 0.5);"
      : isShip
      ? "background: rgba(22, 78, 99, 0.95); border: 2px solid #22d3ee; box-shadow: 0 0 15px rgba(34, 211, 238, 0.5);"
      : "background: rgba(69, 26, 3, 0.95); border: 2px solid #fbbf24; box-shadow: 0 0 15px rgba(251, 191, 36, 0.5);";

    return `
      <div class="carrier-vehicle-wrapper" style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; pointer-events: auto;">
        <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: ${isFlight ? "rgba(56, 189, 248, 0.2)" : isShip ? "rgba(34, 211, 238, 0.2)" : "rgba(251, 191, 36, 0.2)"}; filter: blur(2px);"></div>
        <div style="position: relative; width: 40px; height: 40px; border-radius: 50%; ${badgeColor} backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <div id="carrier-icon-rotor" style="transform: rotate(0deg); transition: transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1); display: flex; align-items: center; justify-content: center;">
            ${svgCode}
          </div>
        </div>
      </div>
    `;
  };

  // Initialize Map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(container, {
      center: originCoord,
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
    });

    mapInstanceRef.current = map;

    // Add Tile Layer
    const layerConfig = TILE_LAYERS[currentLayer] || TILE_LAYERS.dark;
    tileLayerRef.current = L.tileLayer(layerConfig.url, {
      maxZoom: layerConfig.maxZoom,
      className: layerConfig.className || "",
    }).addTo(map);

    // Origin Marker
    const originIcon = L.divIcon({
      className: "custom-map-marker",
      html: `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <div style="width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #d97706, #f59e0b); border: 2px solid #0f172a; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4); display: flex; align-items: center; justify-content: center; color: #020617; font-weight: 900; font-size: 11px;">
            A
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const originMarker = L.marker(originCoord, { icon: originIcon }).addTo(map);
    originMarker.bindPopup(`
      <div class="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 font-sans min-w-[200px]">
        <span class="text-[10px] font-mono text-amber-400 font-black uppercase tracking-wider block">ORIGIN DISPATCH TERMINAL</span>
        <h4 class="text-sm font-black text-white mt-1">${currentShipment.senderCity}</h4>
        <p class="text-xs text-slate-300 mt-1">${currentShipment.senderAddress || "Logistics Freight Hub"}</p>
        <div class="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-400">
          <span>Status: Verified</span>
          <span class="text-amber-400">Departed</span>
        </div>
      </div>
    `);

    // Destination Marker
    const destIcon = L.divIcon({
      className: "custom-map-marker",
      html: `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <div style="width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #059669, #10b981); border: 2px solid #0f172a; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); display: flex; align-items: center; justify-content: center; color: #020617; font-weight: 900; font-size: 11px;">
            B
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const destMarker = L.marker(destCoord, { icon: destIcon }).addTo(map);
    destMarker.bindPopup(`
      <div class="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 font-sans min-w-[200px]">
        <span class="text-[10px] font-mono text-emerald-400 font-black uppercase tracking-wider block">DESTINATION CONSIGNEE</span>
        <h4 class="text-sm font-black text-white mt-1">${currentShipment.receiverCity}</h4>
        <p class="text-xs text-slate-300 mt-1">${currentShipment.receiverAddress || "Receiving Cargo Berth"}</p>
        <div class="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-400">
          <span>ETA Schedule:</span>
          <span class="text-emerald-400">${currentShipment.estimatedDelivery || "On Time"}</span>
        </div>
      </div>
    `);

    // Checkpoint Markers
    intermediateCoords.forEach((coord, idx) => {
      const waypointIcon = L.divIcon({
        className: "custom-map-marker",
        html: `
          <div style="width: 14px; height: 14px; border-radius: 50%; background: #a855f7; border: 2px solid #020617; box-shadow: 0 0 8px rgba(168, 85, 247, 0.5);"></div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      const wpMarker = L.marker(coord, { icon: waypointIcon }).addTo(map);
      wpMarker.bindPopup(`
        <div class="p-3 bg-slate-900 text-white rounded-xl border border-slate-800 font-sans min-w-[180px]">
          <span class="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider block">TRANSIT CHECKPOINT #${idx + 1}</span>
          <h4 class="text-sm font-bold text-white mt-0.5">${currentShipment.currentLocation || "Customs Sorting Yard"}</h4>
          <p class="text-xs text-slate-400 mt-0.5">Manifest Cleared &amp; Scanned</p>
        </div>
      `);
    });

    // Draw Smooth Polylines
    const initialIndex = Math.floor(progress * (routePoints.length - 1));
    const traveledPoints = routePoints.slice(0, initialIndex + 1);
    const remainingPoints = routePoints.slice(initialIndex);

    traveledPolylineRef.current = L.polyline(traveledPoints, {
      color: "#38bdf8",
      weight: 4,
      opacity: 0.95,
      smoothFactor: 1.5,
    }).addTo(map);

    remainingPolylineRef.current = L.polyline(remainingPoints, {
      color: "#0284c7",
      weight: 3,
      opacity: 0.45,
      dashArray: "6, 8",
      smoothFactor: 1.5,
    }).addTo(map);

    // Initial Courier Position
    const initialPos = routePoints[initialIndex] || originCoord;

    const courierIcon = L.divIcon({
      className: "custom-courier-marker",
      html: createVehicleMarkerHtml(currentMode),
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    const courierMarker = L.marker(initialPos, { icon: courierIcon, zIndexOffset: 1000 }).addTo(map);
    courierMarkerRef.current = courierMarker;

    courierMarker.bindPopup(`
      <div class="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 font-sans min-w-[210px]">
        <div class="flex items-center justify-between gap-2">
          <span class="text-[10px] font-mono text-sky-400 font-black uppercase tracking-wider">LIVE CARRIER TELEMETRY</span>
          <span class="px-2 py-0.5 text-[9px] font-bold bg-sky-500/20 text-sky-300 rounded">${currentShipment.status}</span>
        </div>
        <h4 class="text-sm font-black text-white mt-1">${currentShipment.id}</h4>
        <p class="text-xs text-slate-300 mt-0.5 font-medium">Mode: <strong class="uppercase text-sky-400">${currentMode}</strong></p>
      </div>
    `);

    // Fit Bounds
    const bounds = L.latLngBounds([originCoord, destCoord, ...intermediateCoords]);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [currentShipment.id, originCoord, destCoord, intermediateCoords]);

  // Update Tile Layer on Change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    const layerConfig = TILE_LAYERS[currentLayer] || TILE_LAYERS.dark;
    tileLayerRef.current = L.tileLayer(layerConfig.url, {
      maxZoom: layerConfig.maxZoom,
      className: layerConfig.className || "",
    }).addTo(map);
  }, [currentLayer]);

  // Smooth Animation Loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const nextProgress = prev + 0.0018 * simSpeed;
        if (nextProgress >= 1) return 0;
        return nextProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, simSpeed]);

  // Update Vehicle Marker Position & Smooth Rotation (Without vibrating DOM re-creation)
  useEffect(() => {
    if (!routePoints || routePoints.length === 0 || !courierMarkerRef.current) return;

    const totalSteps = routePoints.length - 1;
    const exactIndex = progress * totalSteps;
    const currentIndex = Math.min(totalSteps, Math.floor(exactIndex));
    const nextIndex = Math.min(totalSteps, currentIndex + 1);

    const currentPos = routePoints[currentIndex];
    const nextPos = routePoints[nextIndex] || currentPos;

    const subProgress = exactIndex - currentIndex;
    const interpolatedLat = currentPos[0] + (nextPos[0] - currentPos[0]) * subProgress;
    const interpolatedLon = currentPos[1] + (nextPos[1] - currentPos[1]) * subProgress;
    const liveLatLng = [interpolatedLat, interpolatedLon];

    courierMarkerRef.current.setLatLng(liveLatLng);

    // Calculate Smooth Bearing
    const lookAheadIndex = Math.min(totalSteps, currentIndex + 3);
    const lookAheadPos = routePoints[lookAheadIndex] || nextPos;
    const rawBearing = calculateBearing(interpolatedLat, interpolatedLon, lookAheadPos[0], lookAheadPos[1]);

    // Shortest angular interpolation
    let diff = (rawBearing - smoothedBearingRef.current) % 360;
    if (diff < -180) diff += 360;
    if (diff > 180) diff -= 360;
    smoothedBearingRef.current = (smoothedBearingRef.current + diff * 0.25 + 360) % 360;
    const bearingDeg = Math.round(smoothedBearingRef.current);
    const bearingDir = getBearingDirection(bearingDeg);

    const iconElement = document.getElementById("carrier-icon-rotor");
    if (iconElement) {
      iconElement.style.transform = `rotate(${bearingDeg}deg)`;
    }

    if (traveledPolylineRef.current && remainingPolylineRef.current) {
      const traveled = [...routePoints.slice(0, currentIndex + 1), liveLatLng];
      const remaining = [liveLatLng, ...routePoints.slice(nextIndex)];
      traveledPolylineRef.current.setLatLngs(traveled);
      remainingPolylineRef.current.setLatLngs(remaining);
    }

    // Smooth Throttle Auto-Follow
    const now = Date.now();
    if (followCourier && mapInstanceRef.current && now - lastPanTimeRef.current > 1500) {
      const map = mapInstanceRef.current;
      const bounds = map.getBounds();
      if (!bounds.pad(-0.25).contains(liveLatLng)) {
        map.panTo(liveLatLng, { animate: true, duration: 0.8, easeLinearity: 0.5 });
        lastPanTimeRef.current = now;
      }
    }

    const distRemainingKm = Math.round(
      calculateDistance(interpolatedLat, interpolatedLon, destCoord[0], destCoord[1])
    );

    let liveSpeed = 0;
    let liveAlt = 0;

    if (currentShipment.status === "In Transit") {
      if (currentMode === "flight") {
        liveAlt = Math.round(Math.sin(progress * Math.PI) * 10450);
        liveSpeed = Math.round(760 + Math.sin(progress * 10) * 25);
      } else if (currentMode === "ship") {
        liveAlt = 0;
        liveSpeed = Math.round(42 + Math.sin(progress * 10) * 4);
      } else if (currentMode === "truck") {
        liveAlt = Math.round(180 + Math.sin(progress * 15) * 40);
        liveSpeed = Math.round(88 + Math.sin(progress * 10) * 8);
      } else {
        liveAlt = 45;
        liveSpeed = Math.round(55 + Math.sin(progress * 10) * 10);
      }
    }

    const remainingEtaMins = liveSpeed > 0 ? Math.round((distRemainingKm / liveSpeed) * 60) : 0;

    setTelemetry({
      lat: `${Math.abs(interpolatedLat).toFixed(4)}° ${interpolatedLat >= 0 ? "N" : "S"}`,
      lon: `${Math.abs(interpolatedLon).toFixed(4)}° ${interpolatedLon >= 0 ? "E" : "W"}`,
      alt: `${liveAlt.toLocaleString()} m`,
      speed: `${liveSpeed} km/h`,
      bearing: `${bearingDeg}° ${bearingDir}`,
      bearingDeg,
      distanceRemaining: `${distRemainingKm.toLocaleString()} km`,
      totalDistance: `${totalRouteDistKm.toLocaleString()} km`,
      etaMinutes: remainingEtaMins,
      currentLocationName:
        progress < 0.2
          ? `Departed ${currentShipment.senderCity}`
          : progress > 0.85
          ? `Approaching ${currentShipment.receiverCity}`
          : currentShipment.currentLocation || "Cruising Navigation Corridor",
    });
  }, [progress, routePoints, destCoord, followCourier, currentShipment, totalRouteDistKm, currentMode]);

  // Recenter & Zoom Handlers
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      const bounds = L.latLngBounds([originCoord, destCoord, ...intermediateCoords]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
      setFollowCourier(false);
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  return (
    <div className="relative w-full h-[620px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col font-sans">
      {/* Top HUD Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        {/* Waybill Status Badge */}
        <div className="flex items-center gap-3 bg-slate-900/95 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-slate-700/80 shadow-2xl">
          <div className={`p-2 rounded-xl shadow-lg ${
            currentMode === "flight"
              ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
              : currentMode === "ship"
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
              : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
          }`}>
            {currentMode === "flight" ? (
              <Plane className="h-5 w-5" />
            ) : currentMode === "ship" ? (
              <Ship className="h-5 w-5" />
            ) : (
              <Truck className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-sky-400">
                WAYBILL: {currentShipment.id}
              </span>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                  currentShipment.status === "In Transit"
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                    : currentShipment.status === "Delivered"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                }`}
              >
                {currentShipment.status}
              </span>
            </div>
            <div className="text-xs text-slate-200 font-bold mt-0.5">
              {currentShipment.senderCity} ➔ {currentShipment.receiverCity}
            </div>
          </div>
        </div>

        {/* Transport Mode & Map Layer Controls */}
        <div className="flex items-center flex-wrap gap-2 bg-slate-900/95 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-700/80 shadow-2xl">
          {/* Transport Mode Switcher */}
          <div className="flex items-center bg-slate-950 rounded-xl p-0.5 border border-slate-800">
            <button
              type="button"
              onClick={() => setSelectedTransportMode("flight")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                currentMode === "flight"
                  ? "bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Air Cargo Flight Mode"
            >
              <Plane className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Flight</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTransportMode("two-wheeler")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                currentMode === "two-wheeler"
                  ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Doorstep Two-Wheeler EV / Bike"
            >
              <span>🛵</span>
              <span className="hidden sm:inline">2-Wheeler</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTransportMode("ship")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                currentMode === "ship"
                  ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Ocean Container Vessel Mode"
            >
              <Ship className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ship</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTransportMode("truck")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                currentMode === "truck"
                  ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Road Freight Truck Mode"
            >
              <Truck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Truck</span>
            </button>
          </div>

          {/* Map Layer Switcher */}
          <div className="flex bg-slate-950 rounded-xl p-0.5 border border-slate-800">
            {Object.keys(TILE_LAYERS).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setCurrentLayer(key)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currentLayer === key
                    ? "bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {TILE_LAYERS[key].name}
              </button>
            ))}
          </div>

          {/* Follow Courier Toggle */}
          <button
            type="button"
            onClick={() => setFollowCourier(!followCourier)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              followCourier
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Auto-Follow Courier Position"
          >
            <Locate className="h-4 w-4" />
          </button>

          {/* Play/Pause */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              isPlaying
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
            }`}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
          </button>

          {/* Recenter */}
          <button
            type="button"
            onClick={handleRecenter}
            className="p-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Fit Entire Route"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          {/* Zoom Buttons */}
          <div className="flex items-center border-l border-slate-700/60 pl-1 gap-1">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Leaflet Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full z-[1] bg-[#050b14]" />

      {/* Bottom Telemetry HUD */}
      <div className="absolute bottom-4 left-4 right-4 z-[400] bg-slate-900/95 backdrop-blur-xl p-4 rounded-2xl border border-slate-700/80 shadow-2xl font-sans">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">COORDINATES</span>
            <span className="font-mono font-bold text-white block">{telemetry.lat}</span>
            <span className="font-mono text-[11px] text-slate-400">{telemetry.lon}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">VELOCITY &amp; ALTITUDE</span>
            <span className="font-mono font-bold text-emerald-400 block">{telemetry.speed}</span>
            <span className="font-mono text-[11px] text-slate-400">Alt: {telemetry.alt}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">HEADING / BEARING</span>
            <span className="font-mono font-bold text-sky-400 block">{telemetry.bearing}</span>
            <span className="font-mono text-[11px] text-slate-400">Mode: {currentMode.toUpperCase()}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">DISTANCE REMAINING</span>
            <span className="font-mono font-bold text-amber-400 block">{telemetry.distanceRemaining}</span>
            <span className="font-mono text-[11px] text-slate-400">Total: {telemetry.totalDistance}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">ESTIMATED ARRIVAL</span>
            <span className="font-mono font-bold text-purple-400 block">
              {telemetry.etaMinutes > 0 ? `~${telemetry.etaMinutes} mins` : "Approaching Terminal"}
            </span>
            <span className="font-mono text-[11px] text-slate-400">Target: {currentShipment.estimatedDelivery}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">CURRENT CHECKPOINT</span>
            <span className="font-bold text-white block truncate">{telemetry.currentLocationName}</span>
            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> GPS Synchronized
            </span>
          </div>
        </div>

        {/* Progress Slider */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase shrink-0">TRANSIT PROGRESS</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={progress}
            onChange={(e) => {
              setProgress(parseFloat(e.target.value));
              setIsPlaying(false);
            }}
            className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
          />
          <span className="text-xs font-mono font-bold text-sky-400 shrink-0">
            {Math.round(progress * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
