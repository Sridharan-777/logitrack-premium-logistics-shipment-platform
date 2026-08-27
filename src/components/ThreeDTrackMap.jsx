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

// Accurate Geographic Coordinates DB (Lat, Lon)
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

// Real-World Map Layer Tile Providers
const TILE_LAYERS = {
  dark: {
    name: "Cyber Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    maxZoom: 19,
  },
  satellite: {
    name: "Satellite HD",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 19,
  },
  street: {
    name: "Street Map",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    maxZoom: 19,
  },
  voyager: {
    name: "Navigation",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    maxZoom: 19,
  },
};

// SVG Icons for different vehicle types
const VEHICLE_SVGS = {
  flight: `
    <svg viewBox="0 0 36 36" fill="none" class="w-7 h-7 drop-shadow-md text-sky-400">
      <path d="M18 2 L14 12 L4 16 L4 19 L14 17 L14 26 L10 29 L10 32 L18 30 L26 32 L26 29 L22 26 L22 17 L32 19 L32 16 L22 12 Z" 
            fill="#38bdf8" stroke="#0284c7" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="18" cy="7" r="1.5" fill="#ffffff"/>
    </svg>
  `,
  ship: `
    <svg viewBox="0 0 36 36" fill="none" class="w-7 h-7 drop-shadow-md text-cyan-400">
      <path d="M18 3 L10 12 L10 27 C10 31 26 31 26 27 L26 12 Z" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
      <rect x="13" y="14" width="10" height="9" rx="1.5" fill="#0369a1" stroke="#bae6fd" stroke-width="1"/>
      <circle cx="18" cy="8" r="2" fill="#38bdf8"/>
      <path d="M7 26 C12 30 24 30 29 26" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,
  truck: `
    <svg viewBox="0 0 36 36" fill="none" class="w-7 h-7 drop-shadow-md text-amber-400">
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
    <svg viewBox="0 0 36 36" fill="none" class="w-7 h-7 drop-shadow-md text-emerald-400">
      <rect x="11" y="6" width="14" height="24" rx="4" fill="#10b981" stroke="#047857" stroke-width="1.5"/>
      <rect x="13" y="8" width="10" height="6" rx="1.5" fill="#a7f3d0"/>
      <circle cx="9" cy="12" r="2" fill="#1e293b"/>
      <circle cx="27" cy="12" r="2" fill="#1e293b"/>
      <circle cx="9" cy="26" r="2" fill="#1e293b"/>
      <circle cx="27" cy="26" r="2" fill="#1e293b"/>
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

// Generate smooth multi-waypoint path
function generateRoutePoints(start, end, intermediate = [], steps = 80) {
  const allWaypoints = [start, ...intermediate, end];
  const fullPath = [];

  for (let s = 0; s < allWaypoints.length - 1; s++) {
    const p1 = allWaypoints[s];
    const p2 = allWaypoints[s + 1];
    const segmentSteps = Math.max(20, Math.floor(steps / (allWaypoints.length - 1)));

    for (let i = 0; i <= segmentSteps; i++) {
      const f = i / segmentSteps;
      const lat = p1[0] + (p2[0] - p1[0]) * f;
      const lon = p1[1] + (p2[1] - p1[1]) * f;
      fullPath.push([lat, lon]);
    }
  }
  return fullPath;
}

export default function ThreeDTrackMap({
  activeShipment = {
    senderCity: "Hamburg",
    receiverCity: "London",
    currentLocation: "Frankfurt Hub",
    id: "TRK-8924-M",
    speed: "Express",
    status: "In Transit",
    category: "Electronics",
    timeline: [],
  },
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const courierMarkerRef = useRef(null);
  const traveledPolylineRef = useRef(null);
  const remainingPolylineRef = useRef(null);
  const tileLayerRef = useRef(null);

  // Map Controls State
  const [currentLayer, setCurrentLayer] = useState("dark");
  const [isPlaying, setIsPlaying] = useState(true);
  const [followCourier, setFollowCourier] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);
  const [progress, setProgress] = useState(0.45);

  // Transport Mode Selection: "auto", "flight", "ship", "truck", "van"
  const [selectedTransportMode, setSelectedTransportMode] = useState("auto");

  // Determine active transport mode based on speed/category or user override
  const currentMode = useMemo(() => {
    if (selectedTransportMode !== "auto") return selectedTransportMode;

    const speed = activeShipment.speed?.toLowerCase() || "";
    const cat = activeShipment.category?.toLowerCase() || "";

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
  }, [selectedTransportMode, activeShipment]);

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

    // Deterministic fallback coordinates for any arbitrary city name
    let hash = 0;
    for (let i = 0; i < clean.length; i++) {
      hash = clean.charCodeAt(i) + ((hash << 5) - hash);
    }
    const lat = 10 + (Math.abs(hash) % 45);
    const lon = -10 + (Math.abs(hash * 3) % 90);
    return [lat, lon];
  };

  const originCoord = useMemo(
    () => getCityCoordinate(activeShipment.senderCity || "Hamburg"),
    [activeShipment.senderCity]
  );
  const destCoord = useMemo(
    () => getCityCoordinate(activeShipment.receiverCity || "London"),
    [activeShipment.receiverCity]
  );

  const intermediateCoords = useMemo(() => {
    const list = [];
    if (activeShipment.timeline && activeShipment.timeline.length > 0) {
      activeShipment.timeline.forEach((item) => {
        if (
          item.location &&
          !item.location.toLowerCase().includes(activeShipment.senderCity?.toLowerCase() || "") &&
          !item.location.toLowerCase().includes(activeShipment.receiverCity?.toLowerCase() || "")
        ) {
          list.push(getCityCoordinate(item.location));
        }
      });
    } else if (
      activeShipment.currentLocation &&
      !activeShipment.currentLocation.toLowerCase().includes(activeShipment.senderCity?.toLowerCase() || "") &&
      !activeShipment.currentLocation.toLowerCase().includes(activeShipment.receiverCity?.toLowerCase() || "")
    ) {
      list.push(getCityCoordinate(activeShipment.currentLocation));
    }
    return list;
  }, [activeShipment]);

  const routePoints = useMemo(
    () => generateRoutePoints(originCoord, destCoord, intermediateCoords, 90),
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

  // Create High-Definition Vehicle Marker HTML
  const createVehicleMarkerHtml = (mode, bearing = 0) => {
    const svgCode = VEHICLE_SVGS[mode] || VEHICLE_SVGS.flight;
    const isFlight = mode === "flight";
    const isShip = mode === "ship";
    const isTruck = mode === "truck";

    const badgeColor = isFlight
      ? "bg-sky-950/90 border-sky-400 shadow-sky-500/40"
      : isShip
      ? "bg-cyan-950/90 border-cyan-400 shadow-cyan-500/40"
      : isTruck
      ? "bg-amber-950/90 border-amber-400 shadow-amber-500/40"
      : "bg-emerald-950/90 border-emerald-400 shadow-emerald-500/40";

    return `
      <div class="relative flex items-center justify-center w-12 h-12">
        <!-- Outer Radar Pulse Wave -->
        <span class="absolute w-12 h-12 rounded-full ${isFlight ? "bg-sky-400/20" : isShip ? "bg-cyan-400/20" : "bg-amber-400/20"} animate-ping"></span>
        
        <!-- Center Circular Carrier Pod -->
        <div class="relative w-10 h-10 rounded-full ${badgeColor} border-2 backdrop-blur-md shadow-2xl flex items-center justify-center cursor-pointer transition-transform duration-100 hover:scale-125">
          <!-- Directionally Rotated Vehicle Icon -->
          <div id="carrier-icon-rotor" style="transform: rotate(${bearing}deg); transition: transform 0.15s ease-out;" class="flex items-center justify-center">
            ${svgCode}
          </div>
        </div>

        <!-- Forward Heading Arrow Pointer -->
        <div style="transform: rotate(${bearing}deg); pointer-events: none;" class="absolute w-14 h-14 flex items-start justify-center">
          <div class="w-2 h-2 ${isFlight ? "bg-sky-400" : isShip ? "bg-cyan-400" : "bg-amber-400"} rotate-45 -mt-1 shadow-sm"></div>
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
    });

    mapInstanceRef.current = map;

    // Add Tile Layer
    const layerConfig = TILE_LAYERS[currentLayer] || TILE_LAYERS.dark;
    tileLayerRef.current = L.tileLayer(layerConfig.url, {
      maxZoom: layerConfig.maxZoom,
      subdomains: "abcd",
    }).addTo(map);

    // Origin Marker (Amber Radar Ring)
    const originIcon = L.divIcon({
      className: "custom-map-marker",
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <span class="absolute w-8 h-8 rounded-full bg-amber-400/30 animate-ping"></span>
          <span class="relative w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 border-2 border-slate-950 shadow-lg flex items-center justify-center text-slate-950 font-black text-[10px]">
            A
          </span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const originMarker = L.marker(originCoord, { icon: originIcon }).addTo(map);
    originMarker.bindPopup(`
      <div class="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 font-sans min-w-[200px]">
        <span class="text-[10px] font-mono text-amber-400 font-black uppercase tracking-wider block">ORIGIN DISPATCH TERMINAL</span>
        <h4 class="text-sm font-black text-white mt-1">${activeShipment.senderCity}</h4>
        <p class="text-xs text-slate-300 mt-1">${activeShipment.senderAddress || "Logistics Freight Hub"}</p>
        <div class="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-400">
          <span>Status: Verified</span>
          <span class="text-amber-400">Departed</span>
        </div>
      </div>
    `);

    // Destination Marker (Emerald Radar Ring)
    const destIcon = L.divIcon({
      className: "custom-map-marker",
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <span class="absolute w-8 h-8 rounded-full bg-emerald-400/30 animate-ping"></span>
          <span class="relative w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 border-2 border-slate-950 shadow-lg flex items-center justify-center text-slate-950 font-black text-[10px]">
            B
          </span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const destMarker = L.marker(destCoord, { icon: destIcon }).addTo(map);
    destMarker.bindPopup(`
      <div class="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 font-sans min-w-[200px]">
        <span class="text-[10px] font-mono text-emerald-400 font-black uppercase tracking-wider block">DESTINATION CONSIGNEE</span>
        <h4 class="text-sm font-black text-white mt-1">${activeShipment.receiverCity}</h4>
        <p class="text-xs text-slate-300 mt-1">${activeShipment.receiverAddress || "Receiving Cargo Berth"}</p>
        <div class="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-400">
          <span>ETA Schedule:</span>
          <span class="text-emerald-400">${activeShipment.estimatedDelivery || "On Time"}</span>
        </div>
      </div>
    `);

    // Checkpoint Markers
    intermediateCoords.forEach((coord, idx) => {
      const waypointIcon = L.divIcon({
        className: "custom-map-marker",
        html: `
          <div class="relative flex items-center justify-center w-6 h-6">
            <span class="w-3.5 h-3.5 rounded-full bg-purple-500 border-2 border-slate-950 shadow-md"></span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      const wpMarker = L.marker(coord, { icon: waypointIcon }).addTo(map);
      wpMarker.bindPopup(`
        <div class="p-3 bg-slate-900 text-white rounded-xl border border-slate-800 font-sans min-w-[180px]">
          <span class="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider block">TRANSIT CHECKPOINT #${idx + 1}</span>
          <h4 class="text-sm font-bold text-white mt-0.5">${activeShipment.currentLocation || "Customs Sorting Yard"}</h4>
          <p class="text-xs text-slate-400 mt-0.5">Manifest Cleared & Scanned</p>
        </div>
      `);
    });

    // Draw Route Polylines
    const initialIndex = Math.floor(progress * (routePoints.length - 1));
    const traveledPoints = routePoints.slice(0, initialIndex + 1);
    const remainingPoints = routePoints.slice(initialIndex);

    traveledPolylineRef.current = L.polyline(traveledPoints, {
      color: "#38bdf8",
      weight: 4,
      opacity: 0.95,
      smoothFactor: 1,
    }).addTo(map);

    remainingPolylineRef.current = L.polyline(remainingPoints, {
      color: "#0284c7",
      weight: 3,
      opacity: 0.45,
      dashArray: "6, 8",
      smoothFactor: 1,
    }).addTo(map);

    // Initial Courier Position
    const initialPos = routePoints[initialIndex] || originCoord;
    const initialBearing = calculateBearing(originCoord[0], originCoord[1], destCoord[0], destCoord[1]);

    const courierIcon = L.divIcon({
      className: "custom-courier-marker",
      html: createVehicleMarkerHtml(currentMode, initialBearing),
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    const courierMarker = L.marker(initialPos, { icon: courierIcon, zIndexOffset: 1000 }).addTo(map);
    courierMarkerRef.current = courierMarker;

    courierMarker.bindPopup(`
      <div class="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 font-sans min-w-[210px]">
        <div class="flex items-center justify-between gap-2">
          <span class="text-[10px] font-mono text-sky-400 font-black uppercase tracking-wider">LIVE CARRIER TELEMETRY</span>
          <span class="px-2 py-0.5 text-[9px] font-bold bg-sky-500/20 text-sky-300 rounded">${activeShipment.status}</span>
        </div>
        <h4 class="text-sm font-black text-white mt-1">${activeShipment.id}</h4>
        <p class="text-xs text-slate-300 mt-0.5 font-medium">Mode: <strong class="uppercase text-sky-400">${currentMode}</strong></p>
        <div class="mt-2.5 pt-2 border-t border-slate-800 text-[11px] font-mono grid grid-cols-2 gap-1 text-slate-300">
          <div>Cargo: <strong class="text-amber-300">${activeShipment.category || "General"}</strong></div>
          <div>Speed: <strong class="text-emerald-300">${telemetry.speed}</strong></div>
        </div>
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
  }, [activeShipment.id, originCoord, destCoord, intermediateCoords]);

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
      subdomains: "abcd",
    }).addTo(map);
  }, [currentLayer]);

  // Live Animation Loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const nextProgress = prev + 0.003 * simSpeed;
        if (nextProgress >= 1) return 0;
        return nextProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, simSpeed]);

  // Update Vehicle Marker Position, Bearing & Modality
  useEffect(() => {
    if (!routePoints || routePoints.length === 0 || !courierMarkerRef.current) return;

    const totalSteps = routePoints.length - 1;
    const currentIndex = Math.min(totalSteps, Math.floor(progress * totalSteps));
    const nextIndex = Math.min(totalSteps, currentIndex + 1);

    const currentPos = routePoints[currentIndex];
    const nextPos = routePoints[nextIndex] || currentPos;

    const subProgress = (progress * totalSteps) - currentIndex;
    const interpolatedLat = currentPos[0] + (nextPos[0] - currentPos[0]) * subProgress;
    const interpolatedLon = currentPos[1] + (nextPos[1] - currentPos[1]) * subProgress;
    const liveLatLng = [interpolatedLat, interpolatedLon];

    courierMarkerRef.current.setLatLng(liveLatLng);

    // Calculate Bearing
    const bearingDeg = Math.round(calculateBearing(currentPos[0], currentPos[1], nextPos[0], nextPos[1]));
    const bearingDir = getBearingDirection(bearingDeg);

    // Update Marker HTML with current vehicle icon and bearing rotation
    const updatedIcon = L.divIcon({
      className: "custom-courier-marker",
      html: createVehicleMarkerHtml(currentMode, bearingDeg),
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });
    courierMarkerRef.current.setIcon(updatedIcon);

    // Update Polylines
    if (traveledPolylineRef.current && remainingPolylineRef.current) {
      const traveled = [...routePoints.slice(0, currentIndex + 1), liveLatLng];
      const remaining = [liveLatLng, ...routePoints.slice(nextIndex)];
      traveledPolylineRef.current.setLatLngs(traveled);
      remainingPolylineRef.current.setLatLngs(remaining);
    }

    // Auto Follow Courier
    if (followCourier && mapInstanceRef.current) {
      mapInstanceRef.current.panTo(liveLatLng, { animate: true, duration: 0.15 });
    }

    // Calculate Distance Remaining
    const distRemainingKm = Math.round(
      calculateDistance(interpolatedLat, interpolatedLon, destCoord[0], destCoord[1])
    );

    // Calculate Speed and Altitude according to Mode
    let liveSpeed = 0;
    let liveAlt = 0;

    if (activeShipment.status === "In Transit") {
      if (currentMode === "flight") {
        liveAlt = Math.round(Math.sin(progress * Math.PI) * 10450);
        liveSpeed = Math.round(760 + Math.sin(progress * 10) * 45);
      } else if (currentMode === "ship") {
        liveAlt = 0; // Sea Level
        liveSpeed = Math.round(42 + Math.sin(progress * 10) * 6); // ~23 knots
      } else if (currentMode === "truck") {
        liveAlt = Math.round(180 + Math.sin(progress * 15) * 60);
        liveSpeed = Math.round(88 + Math.sin(progress * 10) * 12);
      } else {
        // Van
        liveAlt = 45;
        liveSpeed = Math.round(55 + Math.sin(progress * 10) * 15);
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
          ? `Departed ${activeShipment.senderCity}`
          : progress > 0.85
          ? `Approaching ${activeShipment.receiverCity}`
          : activeShipment.currentLocation || "Cruising Navigation Corridor",
    });
  }, [progress, routePoints, destCoord, followCourier, activeShipment, totalRouteDistKm, currentMode]);

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
              <Plane className="h-5 w-5 animate-pulse" />
            ) : currentMode === "ship" ? (
              <Ship className="h-5 w-5 animate-pulse" />
            ) : (
              <Truck className="h-5 w-5 animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-sky-400">
                WAYBILL: {activeShipment.id}
              </span>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${
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
            <div className="text-xs text-slate-200 font-bold mt-0.5">
              {activeShipment.senderCity} ➔ {activeShipment.receiverCity}
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
                className={`px-2 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currentLayer === key
                    ? "bg-slate-800 text-white font-extrabold"
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
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Route Progress Slider Bar */}
      <div className="absolute bottom-20 left-4 right-4 z-[400] bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700/70 flex items-center gap-3 pointer-events-auto">
        <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
          {currentMode === "flight" ? <Plane className="h-3.5 w-3.5" /> : currentMode === "ship" ? <Ship className="h-3.5 w-3.5" /> : <Truck className="h-3.5 w-3.5" />}
          Progress: {Math.round(progress * 100)}%
        </span>
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
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
        />
        <div className="flex items-center gap-1 shrink-0 text-[10px] font-mono text-slate-400 font-bold">
          <Clock className="h-3.5 w-3.5 text-amber-400" />
          <span>Rem: {telemetry.distanceRemaining}</span>
        </div>
      </div>

      {/* Bottom Telemetry HUD Matrix */}
      <div className="absolute bottom-3 left-4 right-4 z-[400] grid grid-cols-2 md:grid-cols-5 gap-2.5 bg-slate-900/95 backdrop-blur-xl p-3 rounded-2xl border border-slate-700/80 shadow-2xl pointer-events-auto">
        <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <MapPin className="h-3 w-3 text-sky-400" /> GPS Latitude
          </div>
          <div className="text-sm font-mono font-black text-sky-300 mt-0.5 truncate">{telemetry.lat}</div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <MapPin className="h-3 w-3 text-amber-400" /> GPS Longitude
          </div>
          <div className="text-sm font-mono font-black text-amber-300 mt-0.5 truncate">{telemetry.lon}</div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            {currentMode === "flight" ? <Wind className="h-3 w-3 text-emerald-400" /> : currentMode === "ship" ? <Anchor className="h-3 w-3 text-cyan-400" /> : <Navigation className="h-3 w-3 text-emerald-400" />} 
            {currentMode === "ship" ? "Depth / Draft" : "Altitude"}
          </div>
          <div className="text-sm font-mono font-black text-emerald-300 mt-0.5 truncate">{telemetry.alt}</div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Activity className="h-3 w-3 text-purple-400" /> Live Velocity
          </div>
          <div className="text-sm font-mono font-black text-purple-300 mt-0.5 truncate">{telemetry.speed}</div>
        </div>

        <div className="col-span-2 md:col-span-1 bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Compass className="h-3 w-3 text-cyan-400" /> Trajectory Heading
          </div>
          <div className="text-sm font-mono font-black text-cyan-300 mt-0.5 truncate">{telemetry.bearing}</div>
        </div>
      </div>
    </div>
  );
}
