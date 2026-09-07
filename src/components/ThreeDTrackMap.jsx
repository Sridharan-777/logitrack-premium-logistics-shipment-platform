import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ZoomIn, ZoomOut, Maximize2, Minimize2, Truck, Plane, Ship,
  Play, Pause, Locate, AlertTriangle, Anchor, ArrowRight, X,
  Eye, EyeOff, MapPin, Navigation, Route, CheckCircle2,
} from "lucide-react";

// ══════════════════════════════════════════════════════════════
// 1. WORLD CITY DATABASE (40+ cities, with port/airport coords)
// ══════════════════════════════════════════════════════════════
const CITY_DB = {
  Kovilpatti:    { lat:9.1726,  lon:77.8698,  label:"Kovilpatti",     region:"india",          nearestPort:"Chennai",    nearestAirport:"Madurai" },
  Chennai:       { lat:13.0827, lon:80.2707,  label:"Chennai",        region:"india",          portCoord:[13.09,80.29],  airportCoord:[12.99,80.17], isPort:true, isAirport:true },
  Mumbai:        { lat:19.0760, lon:72.8777,  label:"Mumbai",         region:"india",          portCoord:[18.92,72.85],  airportCoord:[19.09,72.87], isPort:true, isAirport:true },
  Delhi:         { lat:28.6139, lon:77.2090,  label:"New Delhi",      region:"india",          airportCoord:[28.56,77.10], isAirport:true, nearestPort:"Mumbai" },
  Bangalore:     { lat:12.9716, lon:77.5946,  label:"Bangalore",      region:"india",          airportCoord:[13.20,77.71], isAirport:true, nearestPort:"Chennai" },
  Kolkata:       { lat:22.5726, lon:88.3639,  label:"Kolkata",        region:"india",          portCoord:[22.56,88.32],  isPort:true, isAirport:true },
  Madurai:       { lat:9.9252,  lon:78.1198,  label:"Madurai",        region:"india",          airportCoord:[9.83,78.09], isAirport:true, nearestPort:"Chennai" },
  Hamburg:       { lat:53.5511, lon:9.9937,   label:"Hamburg",        region:"north_europe",   portCoord:[53.545,9.966], airportCoord:[53.63,9.99],  isPort:true, isAirport:true },
  Rotterdam:     { lat:51.9244, lon:4.4777,   label:"Rotterdam",      region:"north_europe",   portCoord:[51.95,4.10],   isPort:true, nearestAirport:"Amsterdam" },
  Frankfurt:     { lat:50.1109, lon:8.6821,   label:"Frankfurt",      region:"north_europe",   airportCoord:[50.03,8.57], isAirport:true, nearestPort:"Hamburg" },
  Berlin:        { lat:52.5200, lon:13.4050,  label:"Berlin",         region:"north_europe",   airportCoord:[52.35,13.49],isAirport:true, nearestPort:"Hamburg" },
  Munich:        { lat:48.1351, lon:11.5820,  label:"Munich",         region:"north_europe",   airportCoord:[48.36,11.79],isAirport:true, nearestPort:"Hamburg" },
  London:        { lat:51.5074, lon:-0.1278,  label:"London",         region:"north_europe",   portCoord:[51.50,0.62],   airportCoord:[51.48,-0.46], isPort:true, isAirport:true },
  Paris:         { lat:48.8566, lon:2.3522,   label:"Paris",          region:"north_europe",   airportCoord:[49.01,2.55], isAirport:true, nearestPort:"Rotterdam" },
  Amsterdam:     { lat:52.3676, lon:4.9041,   label:"Amsterdam",      region:"north_europe",   airportCoord:[52.31,4.77], isAirport:true, nearestPort:"Rotterdam" },
  Brussels:      { lat:50.8503, lon:4.3517,   label:"Brussels",       region:"north_europe",   nearestPort:"Rotterdam",  nearestAirport:"Brussels" },
  Barcelona:     { lat:41.3851, lon:2.1734,   label:"Barcelona",      region:"south_europe",   portCoord:[41.36,2.16],   isPort:true },
  Madrid:        { lat:40.4168, lon:-3.7038,  label:"Madrid",         region:"south_europe",   airportCoord:[40.47,-3.57],isAirport:true },
  Athens:        { lat:37.9838, lon:23.7275,  label:"Athens/Piraeus", region:"south_europe",   portCoord:[37.94,23.64],  isPort:true, isAirport:true },
  Istanbul:      { lat:41.0082, lon:28.9784,  label:"Istanbul",       region:"south_europe",   portCoord:[41.02,28.98],  isPort:true },
  Dubai:         { lat:25.2048, lon:55.2708,  label:"Dubai",          region:"middle_east",    portCoord:[25.00,55.08],  airportCoord:[25.25,55.37], isPort:true, isAirport:true },
  Doha:          { lat:25.2854, lon:51.5310,  label:"Doha",           region:"middle_east",    airportCoord:[25.27,51.61],isAirport:true },
  Jeddah:        { lat:21.4858, lon:39.1925,  label:"Jeddah",         region:"middle_east",    portCoord:[21.46,39.21],  isPort:true },
  Singapore:     { lat:1.3521,  lon:103.8198, label:"Singapore",      region:"southeast_asia", portCoord:[1.26,103.82],  airportCoord:[1.36,103.99], isPort:true, isAirport:true },
  Bangkok:       { lat:13.7563, lon:100.5018, label:"Bangkok",        region:"southeast_asia", airportCoord:[13.69,100.75],isAirport:true },
  HongKong:      { lat:22.3193, lon:114.1694, label:"Hong Kong",      region:"east_asia",      portCoord:[22.29,114.16], airportCoord:[22.31,113.92],isPort:true, isAirport:true },
  Shanghai:      { lat:31.2304, lon:121.4737, label:"Shanghai",       region:"east_asia",      portCoord:[31.24,121.73], airportCoord:[31.15,121.81],isPort:true, isAirport:true },
  Tokyo:         { lat:35.6762, lon:139.6503, label:"Tokyo",          region:"east_asia",      portCoord:[35.64,139.77], airportCoord:[35.55,139.78],isPort:true, isAirport:true },
  Seoul:         { lat:37.5665, lon:126.9780, label:"Seoul",          region:"east_asia",      airportCoord:[37.46,126.44],isAirport:true },
  Beijing:       { lat:39.9042, lon:116.4074, label:"Beijing",        region:"east_asia",      airportCoord:[40.08,116.58],isAirport:true },
  Sydney:        { lat:-33.8688,lon:151.2093, label:"Sydney",         region:"oceania",        portCoord:[-33.86,151.20],airportCoord:[-33.94,151.18],isPort:true, isAirport:true },
  Melbourne:     { lat:-37.8136,lon:144.9631, label:"Melbourne",      region:"oceania",        portCoord:[-37.83,144.92],isPort:true },
  "New York":    { lat:40.7128, lon:-74.0060, label:"New York",       region:"north_america",  portCoord:[40.67,-74.01], airportCoord:[40.64,-73.78],isPort:true, isAirport:true },
  "Los Angeles": { lat:34.0522, lon:-118.2437,label:"Los Angeles",    region:"north_america",  portCoord:[33.74,-118.27],airportCoord:[33.94,-118.41],isPort:true, isAirport:true },
  Miami:         { lat:25.7617, lon:-80.1918, label:"Miami",          region:"north_america",  portCoord:[25.77,-80.18], airportCoord:[25.80,-80.29],isPort:true, isAirport:true },
  Chicago:       { lat:41.8781, lon:-87.6298, label:"Chicago",        region:"north_america",  airportCoord:[41.98,-87.91],isAirport:true },
  Toronto:       { lat:43.6532, lon:-79.3832, label:"Toronto",        region:"north_america",  airportCoord:[43.68,-79.63],isAirport:true },
  Cairo:         { lat:30.0444, lon:31.2357,  label:"Cairo",          region:"north_africa",   airportCoord:[30.13,31.41], isAirport:true },
  Lagos:         { lat:6.5244,  lon:3.3792,   label:"Lagos",          region:"west_africa",    portCoord:[6.45,3.40],    isPort:true },
  "Cape Town":   { lat:-33.9249,lon:18.4241,  label:"Cape Town",      region:"south_africa",   portCoord:[-33.91,18.43], isPort:true },
  Nairobi:       { lat:-1.2921, lon:36.8219,  label:"Nairobi",        region:"east_africa",    airportCoord:[-1.32,36.93],isAirport:true },
  "São Paulo":   { lat:-23.5505,lon:-46.6333, label:"São Paulo",      region:"south_america",  airportCoord:[-23.43,-46.47],isAirport:true },
};

function findCity(name) {
  if (!name) return null;
  const clean = String(name).trim();
  if (CITY_DB[clean]) return { key: clean, ...CITY_DB[clean] };
  const k = Object.keys(CITY_DB).find(
    k => k.toLowerCase() === clean.toLowerCase() ||
         k.toLowerCase().includes(clean.toLowerCase()) ||
         clean.toLowerCase().includes(k.toLowerCase())
  );
  return k ? { key: k, ...CITY_DB[k] } : null;
}

// ══════════════════════════════════════════════════════════════
// 2. SEA LANE BACKBONE (ships stay on water!)
// ══════════════════════════════════════════════════════════════
const SL = {
  HAMBURG_TO_UK:     [[53.90,8.70],[54.50,7.50],[55.00,5.50],[54.00,3.50],[52.50,3.00],[51.90,3.20],[51.30,2.50],[51.10,1.50],[51.30,0.80]],
  ROTTERDAM_TO_UK:   [[51.80,3.50],[51.40,2.50],[51.10,1.50],[51.30,0.80]],
  NEU_TO_MED:        [[50.00,3.50],[49.00,-2.00],[46.00,-5.00],[44.00,-5.50],[36.50,-5.50]],
  MED_TO_SUEZ:       [[37.00,8.00],[35.00,17.00],[33.50,27.00],[31.80,32.20]],
  SUEZ_TO_ADEN:      [[30.00,32.60],[27.00,34.00],[22.00,37.50],[15.00,42.00],[12.00,43.80],[10.00,51.50]],
  ADEN_TO_INDIA:     [[14.00,66.00],[12.00,71.00]],
  INDIA_TO_MALACCA:  [[7.00,80.50],[5.00,88.00],[4.50,98.00],[1.50,104.00]],
  MALACCA_TO_EA:     [[3.00,109.00],[10.00,113.00],[18.00,118.00]],
  TRANS_PACIFIC:     [[33.00,143.00],[28.00,158.00],[22.00,172.00],[30.00,179.00],[35.00,-155.00],[38.00,-132.00]],
  NORTH_ATLANTIC:    [[36.00,-5.50],[34.00,-15.00],[30.00,-28.00],[25.00,-45.00],[32.00,-63.00],[38.00,-70.00]],
  CAPE_ROUTE:        [[0.00,5.00],[-20.00,10.00],[-34.30,18.50],[-30.00,36.00],[-20.00,44.00],[-10.00,52.00]],
};

// ══════════════════════════════════════════════════════════════
// 3. ROUTE COLORS + TILES
// ══════════════════════════════════════════════════════════════
const RC = {
  completed:"#10b981", remaining:"#475569",
  flight:"#818cf8", ship:"#0ea5e9", road:"#f59e0b", lastMile:"#f97316", van:"#22c55e",
};
const TILES = {
  satellite:{ name:"Satellite", url:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", maxZoom:19 },
  dark:     { name:"Dark",      url:"https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", maxZoom:16 },
  street:   { name:"Street",    url:"https://tile.openstreetmap.org/{z}/{x}/{y}.png", maxZoom:19 },
  ocean:    { name:"Ocean",     url:"https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}", maxZoom:13 },
};

// ══════════════════════════════════════════════════════════════
// 4. VEHICLE SVG ICONS (recognizable real vehicles, NO emoji)
// ══════════════════════════════════════════════════════════════
const VI = {
  flight: {
    color:"#3b82f6", glow:"rgba(59,130,246,0.55)", bg:"rgba(14,30,73,0.96)", border:"#3b82f6",
    svg:`<svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:30px;height:37px">
      <ellipse cx="32" cy="38" rx="7" ry="30" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
      <path d="M25 34L4 48L4 53L25 43L39 43L60 53L60 48L39 34Z" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
      <ellipse cx="12" cy="48" rx="4" ry="6" fill="#1e3a8a" stroke="#2563eb" stroke-width="1"/>
      <ellipse cx="52" cy="48" rx="4" ry="6" fill="#1e3a8a" stroke="#2563eb" stroke-width="1"/>
      <path d="M25 62L16 69L16 71L25 66L39 66L48 71L48 69L39 62Z" fill="#60a5fa" stroke="#1d4ed8" stroke-width="0.8"/>
      <ellipse cx="32" cy="10" rx="5" ry="7" fill="#bfdbfe"/>
      <ellipse cx="29" cy="12" rx="1.5" ry="2" fill="#1e40af"/>
      <ellipse cx="35" cy="12" rx="1.5" ry="2" fill="#1e40af"/>
    </svg>`,
  },
  ship: {
    color:"#0ea5e9", glow:"rgba(14,165,233,0.55)", bg:"rgba(8,47,73,0.96)", border:"#0ea5e9",
    svg:`<svg viewBox="0 0 52 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:26px;height:40px">
      <path d="M26 3L43 13L45 70L7 70L9 13Z" fill="#0c4a6e" stroke="#38bdf8" stroke-width="1.5"/>
      <path d="M26 3L43 13L26 9L9 13Z" fill="#075985"/>
      <rect x="12" y="16" width="8" height="5" rx="0.5" fill="#ef4444"/>
      <rect x="22" y="16" width="8" height="5" rx="0.5" fill="#22c55e"/>
      <rect x="32" y="16" width="7" height="5" rx="0.5" fill="#3b82f6"/>
      <rect x="12" y="23" width="8" height="5" rx="0.5" fill="#f59e0b"/>
      <rect x="22" y="23" width="8" height="5" rx="0.5" fill="#a855f7"/>
      <rect x="32" y="23" width="7" height="5" rx="0.5" fill="#22c55e"/>
      <rect x="12" y="30" width="8" height="5" rx="0.5" fill="#06b6d4"/>
      <rect x="22" y="30" width="8" height="5" rx="0.5" fill="#f59e0b"/>
      <rect x="32" y="30" width="7" height="5" rx="0.5" fill="#ef4444"/>
      <rect x="12" y="37" width="8" height="5" rx="0.5" fill="#3b82f6"/>
      <rect x="22" y="37" width="8" height="5" rx="0.5" fill="#a855f7"/>
      <rect x="16" y="50" width="20" height="16" rx="2" fill="#0369a1" stroke="#38bdf8" stroke-width="1"/>
      <rect x="19" y="53" width="4" height="3" rx="0.5" fill="#e0f2fe" opacity="0.9"/>
      <rect x="25" y="53" width="4" height="3" rx="0.5" fill="#e0f2fe" opacity="0.9"/>
      <rect x="31" y="53" width="3" height="3" rx="0.5" fill="#e0f2fe" opacity="0.9"/>
      <rect x="23" y="46" width="6" height="5" rx="1" fill="#374151"/>
    </svg>`,
  },
  truck: {
    color:"#f59e0b", glow:"rgba(245,158,11,0.55)", bg:"rgba(69,26,3,0.96)", border:"#f59e0b",
    svg:`<svg viewBox="0 0 40 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:22px;height:35px">
      <rect x="6" y="2" width="28" height="14" rx="3" fill="#f59e0b" stroke="#b45309" stroke-width="1.5"/>
      <rect x="9" y="4" width="22" height="7" rx="1.5" fill="#fef3c7" opacity="0.9"/>
      <rect x="4" y="18" width="32" height="42" rx="2" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/>
      <line x1="20" y1="18" x2="20" y2="60" stroke="#b45309" stroke-width="0.8" opacity="0.4"/>
      <line x1="4" y1="34" x2="36" y2="34" stroke="#b45309" stroke-width="0.8" opacity="0.4"/>
      <line x1="4" y1="47" x2="36" y2="47" stroke="#b45309" stroke-width="0.8" opacity="0.4"/>
      <rect x="0" y="5" width="6" height="8" rx="2" fill="#1e293b"/>
      <rect x="34" y="5" width="6" height="8" rx="2" fill="#1e293b"/>
      <rect x="0" y="25" width="6" height="8" rx="2" fill="#1e293b"/>
      <rect x="34" y="25" width="6" height="8" rx="2" fill="#1e293b"/>
      <rect x="0" y="38" width="6" height="8" rx="2" fill="#1e293b"/>
      <rect x="34" y="38" width="6" height="8" rx="2" fill="#1e293b"/>
    </svg>`,
  },
  van: {
    color:"#22c55e", glow:"rgba(34,197,94,0.55)", bg:"rgba(4,47,31,0.96)", border:"#22c55e",
    svg:`<svg viewBox="0 0 48 72" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:24px;height:36px">
      <rect x="4" y="4" width="40" height="64" rx="8" fill="#16a34a" stroke="#14532d" stroke-width="1.5"/>
      <rect x="8" y="6" width="32" height="15" rx="4" fill="#bbf7d0" opacity="0.8"/>
      <rect x="8" y="52" width="32" height="12" rx="3" fill="#bbf7d0" opacity="0.5"/>
      <rect x="5" y="26" width="6" height="13" rx="2" fill="#86efac" opacity="0.7"/>
      <rect x="37" y="26" width="6" height="13" rx="2" fill="#86efac" opacity="0.7"/>
      <line x1="24" y1="44" x2="24" y2="64" stroke="#14532d" stroke-width="1" opacity="0.5"/>
      <rect x="0" y="10" width="8" height="12" rx="3" fill="#1e293b"/>
      <rect x="40" y="10" width="8" height="12" rx="3" fill="#1e293b"/>
      <rect x="0" y="50" width="8" height="12" rx="3" fill="#1e293b"/>
      <rect x="40" y="50" width="8" height="12" rx="3" fill="#1e293b"/>
    </svg>`,
  },
  "two-wheeler": {
    color:"#f97316", glow:"rgba(249,115,22,0.55)", bg:"rgba(69,26,3,0.96)", border:"#f97316",
    svg:`<svg viewBox="0 0 36 60" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:20px;height:33px">
      <ellipse cx="18" cy="8" rx="9" ry="5" fill="#1e293b" stroke="#f97316" stroke-width="2"/>
      <ellipse cx="18" cy="8" rx="4" ry="2.5" fill="#374151"/>
      <ellipse cx="18" cy="52" rx="9" ry="5" fill="#1e293b" stroke="#f97316" stroke-width="2"/>
      <ellipse cx="18" cy="52" rx="4" ry="2.5" fill="#374151"/>
      <rect x="16" y="13" width="4" height="34" fill="#f97316"/>
      <ellipse cx="18" cy="30" rx="8" ry="12" fill="#ea580c" stroke="#c2410c" stroke-width="1.5"/>
      <ellipse cx="18" cy="13" rx="4" ry="2.5" fill="#fef9c3" opacity="0.9"/>
      <path d="M4 18L18 15L32 18" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
      <circle cx="18" cy="22" r="5" fill="#1e293b"/>
      <path d="M13 23Q18 26 23 23" stroke="#60a5fa" stroke-width="1.5" fill="none"/>
    </svg>`,
  },
};

// ══════════════════════════════════════════════════════════════
// 5. MATH HELPERS
// ══════════════════════════════════════════════════════════════
function haversine(la1, lo1, la2, lo2) {
  const R=6371, dL=((la2-la1)*Math.PI)/180, dO=((lo2-lo1)*Math.PI)/180;
  const a=Math.sin(dL/2)**2+Math.cos((la1*Math.PI)/180)*Math.cos((la2*Math.PI)/180)*Math.sin(dO/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function brg(la1,lo1,la2,lo2) {
  const p1=(la1*Math.PI)/180,p2=(la2*Math.PI)/180,dl=((lo2-lo1)*Math.PI)/180;
  return ((Math.atan2(Math.sin(dl)*Math.cos(p2),Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl))*180/Math.PI)+360)%360;
}
function bLabel(d){return ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"][Math.round(d/22.5)%16];}
function gcPt(la1,lo1,la2,lo2,f){
  const r=d=>(d*Math.PI)/180,g=r=>r*180/Math.PI;
  const p1=r(la1),l1=r(lo1),p2=r(la2),l2=r(lo2);
  const d=2*Math.asin(Math.sqrt(Math.sin((p2-p1)/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin((l2-l1)/2)**2));
  if(d<0.0001)return[la1,lo1];
  const A=Math.sin((1-f)*d)/Math.sin(d),B=Math.sin(f*d)/Math.sin(d);
  const x=A*Math.cos(p1)*Math.cos(l1)+B*Math.cos(p2)*Math.cos(l2);
  const y=A*Math.cos(p1)*Math.sin(l1)+B*Math.cos(p2)*Math.sin(l2);
  const z=A*Math.sin(p1)+B*Math.sin(p2);
  return[g(Math.atan2(z,Math.sqrt(x*x+y*y))),g(Math.atan2(y,x))];
}
function gcArc(la1,lo1,la2,lo2,n=70){const a=[];for(let i=0;i<=n;i++)a.push(gcPt(la1,lo1,la2,lo2,i/n));return a;}
function cr4(p0,p1,p2,p3,t){const t2=t*t,t3=t2*t;return[.5*(2*p1[0]+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),.5*(2*p1[1]+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)];}
function smooth(wp,s=25){if(wp.length<2)return wp;const e=[wp[0],...wp,wp[wp.length-1]],o=[];for(let i=0;i<e.length-3;i++)for(let j=0;j<=s;j++)o.push(cr4(e[i],e[i+1],e[i+2],e[i+3],j/s));return o;}

// ══════════════════════════════════════════════════════════════
// 6. SEA ROUTE BUILDER (ships never cross land)
// ══════════════════════════════════════════════════════════════
function isEu(r){return r==="north_europe"||r==="south_europe";}
function isAs(r){return r==="india"||r==="southeast_asia"||r==="east_asia";}

function buildSeaWaypoints(oName, dName) {
  const o=findCity(oName), d=findCity(dName);
  if(!o||!d) return null;
  const oP=o.portCoord||[o.lat,o.lon], dP=d.portCoord||[d.lat,d.lon];
  const oR=o.region||"", dR=d.region||"";
  const wp=[oP];

  if(oR==="north_europe"&&dR==="north_europe") {
    if(o.lon>8&&d.lon<2) wp.push(...SL.HAMBURG_TO_UK);
    else if(o.lon>3&&d.lon<2) wp.push(...SL.ROTTERDAM_TO_UK);
    else if(o.lon<2&&d.lon>8) wp.push(...[...SL.HAMBURG_TO_UK].reverse());
    else if(o.lon<2&&d.lon>3) wp.push(...[...SL.ROTTERDAM_TO_UK].reverse());
  } else if(isEu(oR)&&isAs(dR)) {
    if(oR==="north_europe") wp.push(...SL.NEU_TO_MED);
    wp.push(...SL.MED_TO_SUEZ,...SL.SUEZ_TO_ADEN,...SL.ADEN_TO_INDIA);
    if(dR==="southeast_asia"||dR==="east_asia") wp.push(...SL.INDIA_TO_MALACCA);
    if(dR==="east_asia") wp.push(...SL.MALACCA_TO_EA);
  } else if(isAs(oR)&&isEu(dR)) {
    if(oR==="east_asia") wp.push(...[...SL.MALACCA_TO_EA].reverse());
    if(oR==="east_asia"||oR==="southeast_asia") wp.push(...[...SL.INDIA_TO_MALACCA].reverse());
    wp.push(...[...SL.ADEN_TO_INDIA].reverse(),...[...SL.SUEZ_TO_ADEN].reverse(),...[...SL.MED_TO_SUEZ].reverse());
    if(dR==="north_europe") wp.push(...[...SL.NEU_TO_MED].reverse());
  } else if(oR==="east_asia"&&dR==="north_america"&&d.lon<-100) {
    wp.push(...SL.TRANS_PACIFIC);
  } else if(isEu(oR)&&dR==="north_america") {
    if(oR==="north_europe") wp.push([50.0,3.5],[48.0,-3.0]);
    wp.push(...SL.NORTH_ATLANTIC);
  } else if(oR==="north_america"&&isEu(dR)) {
    wp.push(...[...SL.NORTH_ATLANTIC].reverse());
    if(dR==="north_europe") wp.push([48.0,-3.0],[50.0,3.5]);
  } else if(oR==="southeast_asia"&&dR==="east_asia") {
    wp.push(...SL.MALACCA_TO_EA);
  } else if(oR==="india"&&dR==="middle_east") {
    wp.push(...[...SL.ADEN_TO_INDIA].reverse());
  } else if(oR==="middle_east"&&dR==="india") {
    wp.push(...SL.ADEN_TO_INDIA);
  }

  wp.push(dP);
  return smooth(wp, 22);
}

// ══════════════════════════════════════════════════════════════
// 7. JOURNEY BUILDERS
// ══════════════════════════════════════════════════════════════
function buildFlight(oName, dName) {
  const o=findCity(oName), d=findCity(dName);
  if(!o||!d) return null;
  const oAP=(o.isAirport?o:findCity(o.nearestAirport)||o).airportCoord||[o.lat,o.lon];
  const dAP=(d.isAirport?d:findCity(d.nearestAirport)||d).airportCoord||[d.lat,d.lon];
  const oC=[o.lat,o.lon], dC=[d.lat,d.lon];
  const arc=gcArc(oAP[0],oAP[1],dAP[0],dAP[1],80);
  return { phases:[
    { label:"Truck → Airport",        vehicleType:"truck",  color:RC.road,     points:smooth([oC,oAP],12), altFn:()=>0, speedKmh:70 },
    { label:"Runway Taxi",            vehicleType:"flight", color:RC.flight,   points:smooth([oAP,[oAP[0]+.012,oAP[1]+.008]],6), altFn:()=>0, speedKmh:40 },
    { label:"Takeoff",                vehicleType:"flight", color:RC.flight,   points:arc.slice(0,10), altFn:t=>t*9500, speedKmh:380 },
    { label:"Cruise",                 vehicleType:"flight", color:RC.flight,   points:arc.slice(8,72), altFn:()=>10500, speedKmh:880 },
    { label:"Landing",                vehicleType:"flight", color:RC.flight,   points:arc.slice(70),  altFn:t=>(1-t)*9000, speedKmh:280 },
    { label:"Terminal Taxi",          vehicleType:"flight", color:RC.flight,   points:smooth([dAP,[dAP[0]-.01,dAP[1]-.007]],6), altFn:()=>0, speedKmh:30 },
    { label:"Last-Mile Truck",        vehicleType:"truck",  color:RC.lastMile, points:smooth([dAP,dC],12), altFn:()=>80, speedKmh:65 },
  ]};
}

function buildShip(oName, dName) {
  const o=findCity(oName), d=findCity(dName);
  if(!o||!d) return null;
  const oPCity=findCity(o.nearestPort)||o, dPCity=findCity(d.nearestPort)||d;
  const oC=[o.lat,o.lon], dC=[d.lat,d.lon];
  const oP=o.portCoord||oPCity.portCoord||[oPCity.lat,oPCity.lon];
  const dP=d.portCoord||dPCity.portCoord||[dPCity.lat,dPCity.lon];
  const ocean=buildSeaWaypoints(oName,dName)||smooth([oP,dP],20);
  const n=ocean.length;
  return { phases:[
    { label:"Truck → Port",           vehicleType:"truck", color:RC.road,     points:smooth([oC,oP],12), altFn:()=>0, speedKmh:70 },
    { label:"Port Loading",           vehicleType:"ship",  color:RC.ship,     points:ocean.slice(0,Math.max(2,Math.floor(n*.05))), altFn:()=>0, speedKmh:8 },
    { label:"Ocean Voyage",           vehicleType:"ship",  color:RC.ship,     points:ocean.slice(Math.max(0,Math.floor(n*.04)),Math.floor(n*.96)), altFn:()=>0, speedKmh:42 },
    { label:"Port Docking",           vehicleType:"ship",  color:RC.ship,     points:ocean.slice(Math.floor(n*.95)), altFn:()=>0, speedKmh:8 },
    { label:"Container Truck",        vehicleType:"truck", color:RC.lastMile, points:smooth([dP,dC],12), altFn:()=>0, speedKmh:65 },
  ]};
}

function buildRoad(oName, dName, mode) {
  const o=findCity(oName), d=findCity(dName);
  if(!o||!d) return null;
  const oC=[o.lat,o.lon], dC=[d.lat,d.lon];
  const mLat=(oC[0]+dC[0])/2+(dC[1]-oC[1])*.05, mLon=(oC[1]+dC[1])/2-(dC[0]-oC[0])*.05;
  const label=mode==="two-wheeler"?"Motorcycle Courier":mode==="van"?"Van Delivery":"Road Freight";
  const color=mode==="van"?RC.van:mode==="two-wheeler"?RC.lastMile:RC.road;
  const speed=mode==="two-wheeler"?55:mode==="van"?70:90;
  return { phases:[{ label, vehicleType:mode, color, points:smooth([oC,[mLat,mLon],dC],40), altFn:t=>80+Math.sin(t*Math.PI*3)*12, speedKmh:speed }]};
}

function buildJourney(mode, oName, dName) {
  if(mode==="flight") return buildFlight(oName,dName);
  if(mode==="ship")   return buildShip(oName,dName);
  return buildRoad(oName,dName,mode);
}

function flattenJourney(journey) {
  if(!journey?.phases) return { points:[],phaseMap:[],phases:[] };
  const points=[],phaseMap=[];
  journey.phases.forEach((ph,pi)=>{
    (ph.points||[]).forEach((pt,idx)=>{ if(idx===0&&points.length>0)return; points.push(pt); phaseMap.push(pi); });
  });
  return { points, phaseMap, phases:journey.phases };
}

// ══════════════════════════════════════════════════════════════
// 8. MARKER HTML BUILDERS
// ══════════════════════════════════════════════════════════════
function vehicleMarkerHTML(type, deg=0) {
  const v=VI[type]||VI.truck;
  return `<div style="position:relative;width:54px;height:54px;display:flex;align-items:center;justify-content:center">
    <div style="position:absolute;width:50px;height:50px;border-radius:50%;background:${v.glow};filter:blur(7px)"></div>
    <div style="position:relative;width:46px;height:46px;border-radius:50%;background:${v.bg};border:2.5px solid ${v.border};display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px ${v.glow},inset 0 0 8px rgba(0,0,0,.5)">
      <div style="transform:rotate(${deg}deg);transition:transform .2s ease;display:flex;align-items:center;justify-content:center">${v.svg}</div>
    </div>
  </div>`;
}

function hubMarkerHTML(type) {
  const s={airport:{bg:"#1e40af",bd:"#60a5fa",c:"A"},port:{bg:"#0c4a6e",bd:"#38bdf8",c:"P"},hub:{bg:"#065f46",bd:"#34d399",c:"H"}}[type]||{bg:"#4c1d95",bd:"#a78bfa",c:"X"};
  return `<div style="width:20px;height:20px;border-radius:50%;background:${s.bg};border:2px solid ${s.bd};display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;color:#e2e8f0;font-family:monospace;box-shadow:0 0 8px ${s.bd}60">${s.c}</div>`;
}

function deliveredHTML() {
  return `<div style="position:relative;width:52px;height:52px;display:flex;align-items:center;justify-content:center">
    <div style="position:absolute;width:50px;height:50px;border-radius:50%;background:rgba(16,185,129,.3);filter:blur(6px)"></div>
    <div style="position:relative;width:44px;height:44px;border-radius:50%;background:rgba(4,47,31,.96);border:2.5px solid #10b981;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(16,185,129,.5)">
      <svg viewBox="0 0 24 24" fill="none" style="width:22px;height:22px" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
  </div>`;
}

// ══════════════════════════════════════════════════════════════
// 9. MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function ThreeDTrackMap({ activeShipment, shipment }) {
  const s = activeShipment || shipment || {};

  // ── Leaflet refs (imperative, no re-renders)
  const mapContRef  = useRef(null);
  const mapRef      = useRef(null);
  const vmRef       = useRef(null);   // vehicle marker
  const tlRef       = useRef(null);   // traveled line
  const rlRef       = useRef(null);   // remaining line
  const tileRef     = useRef(null);
  const hubsRef     = useRef([]);
  const phaseLinesRef = useRef([]);
  const fsRef       = useRef(null);   // fullscreen container

  // ── Animation refs
  const progRef     = useRef(0.05);
  const animRef     = useRef(null);
  const uiTickRef   = useRef(0);
  const smBrgRef    = useRef(0);
  const isPlayRef   = useRef(true);
  const speedRef    = useRef(1);
  const followRef   = useRef(false);
  const ptsRef      = useRef([]);
  const pmRef       = useRef([]);
  const phRef       = useRef([]);
  const dCRef       = useRef([0,0]);
  const lastVtRef   = useRef("");

  // ── UI state
  const [prog,setProg]           = useState(0.05);
  const [playing,setPlaying]     = useState(true);
  const [speed,setSpeed]         = useState(1);
  const [layer,setLayer]         = useState("satellite");
  const [fs,setFs]               = useState(false);
  const [follow,setFollow]       = useState(false);
  const [showDone,setShowDone]   = useState(true);
  const [showRem,setShowRem]     = useState(true);
  const [showHubs,setShowHubs]   = useState(true);
  const [locErr,setLocErr]       = useState(null);
  const [phaseIdx,setPhaseIdx]   = useState(0);
  const [tele,setTele]           = useState({ lat:"—",lon:"—",alt:"0 m",speed:"—",brg:"—°",distRem:"—",eta:"—",chk:"En Route" });

  const isDelivered = s.status === "Delivered";

  // ── Resolve transport mode
  const mode = useMemo(()=>{
    if(s.transportModeUsed) return s.transportModeUsed;
    const sp=(s.speed||"").toLowerCase(), cat=(s.category||"").toLowerCase();
    if(sp.includes("ocean")||cat.includes("sea")||cat.includes("heavy")) return "ship";
    if(sp.includes("express")||sp.includes("air")) return "flight";
    if(sp.includes("same-day")||sp.includes("local")) return "two-wheeler";
    if(cat.includes("bulk")) return "truck";
    return "truck";
  }, [s.transportModeUsed,s.speed,s.category]);

  const oCity = useMemo(()=>findCity(s.senderCity),[s.senderCity]);
  const dCity = useMemo(()=>findCity(s.receiverCity),[s.receiverCity]);

  useEffect(()=>{
    if(!oCity&&s.senderCity) setLocErr(`Sender location not found: "${s.senderCity}". Check booking details.`);
    else if(!dCity&&s.receiverCity) setLocErr(`Receiver location not found: "${s.receiverCity}". Check booking details.`);
    else setLocErr(null);
  },[oCity,dCity,s.senderCity,s.receiverCity]);

  const journey = useMemo(()=>{
    if(!oCity||!dCity) return null;
    return buildJourney(mode, s.senderCity, s.receiverCity);
  },[mode,s.senderCity,s.receiverCity,oCity,dCity]);

  const { points,phaseMap,phases } = useMemo(()=>flattenJourney(journey),[journey]);
  const oCoord = oCity?[oCity.lat,oCity.lon]:[0,0];
  const dCoord = dCity?[dCity.lat,dCity.lon]:[0,0];
  const totDist = useMemo(()=>{let d=0;for(let i=0;i<points.length-1;i++)d+=haversine(points[i][0],points[i][1],points[i+1][0],points[i+1][1]);return Math.round(d);},[points]);

  // keep animation refs in sync
  useEffect(()=>{ ptsRef.current=points; pmRef.current=phaseMap; phRef.current=phases; dCRef.current=dCoord; },[points,phaseMap,phases,dCoord]);

  // ── MAP INIT ────────────────────────────────────────────────────
  useEffect(()=>{
    const c=mapContRef.current; if(!c) return;
    if(mapRef.current){ mapRef.current.remove(); mapRef.current=null; }
    hubsRef.current=[]; phaseLinesRef.current=[];

    const map=L.map(c,{ center:oCoord.some(v=>v!==0)?oCoord:[30,20], zoom:5, zoomControl:false, attributionControl:false, scrollWheelZoom:true });
    mapRef.current=map;
    // stop follow when user pans manually
    map.on("movestart",()=>{ followRef.current=false; setFollow(false); });

    const lc=TILES[layer]; tileRef.current=L.tileLayer(lc.url,{maxZoom:lc.maxZoom||19}).addTo(map);
    if(!points.length||locErr) return;

    // Origin marker
    const mkA=(html,sz)=>L.divIcon({className:"",html,iconSize:sz,iconAnchor:[sz[0]/2,sz[1]]});
    const oHtml=`<div style="display:flex;flex-direction:column;align-items:center"><div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#d97706,#f59e0b);border:3px solid #0f172a;box-shadow:0 4px 20px rgba(245,158,11,.65);display:flex;align-items:center;justify-content:center;color:#020617;font-weight:900;font-size:13px;font-family:monospace">A</div><div style="width:2px;height:10px;background:rgba(245,158,11,.5)"></div><div style="width:5px;height:5px;border-radius:50%;background:rgba(245,158,11,.35)"></div></div>`;
    L.marker(oCoord,{icon:mkA(oHtml,[32,47])}).addTo(map).bindPopup(
      `<div style="background:#0f172a;color:#f8fafc;border-radius:10px;padding:12px;min-width:180px;font-family:sans-serif;border:1px solid #1e293b"><div style="font-size:9px;font-weight:900;color:#f59e0b;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">ORIGIN</div><div style="font-size:14px;font-weight:900">${oCity?.label||s.senderCity}</div><div style="font-size:11px;color:#94a3b8;margin-top:2px">${s.senderAddress||""}</div><div style="margin-top:8px;padding-top:6px;border-top:1px solid #1e293b;font-size:10px;color:#64748b">Sender: ${s.senderName||"—"}</div></div>`
    );
    const dHtml=`<div style="display:flex;flex-direction:column;align-items:center"><div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#059669,#10b981);border:3px solid #0f172a;box-shadow:0 4px 20px rgba(16,185,129,.65);display:flex;align-items:center;justify-content:center;color:#020617;font-weight:900;font-size:13px;font-family:monospace">B</div><div style="width:2px;height:10px;background:rgba(16,185,129,.5)"></div><div style="width:5px;height:5px;border-radius:50%;background:rgba(16,185,129,.35)"></div></div>`;
    L.marker(dCoord,{icon:mkA(dHtml,[32,47])}).addTo(map).bindPopup(
      `<div style="background:#0f172a;color:#f8fafc;border-radius:10px;padding:12px;min-width:180px;font-family:sans-serif;border:1px solid #1e293b"><div style="font-size:9px;font-weight:900;color:#10b981;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">DESTINATION</div><div style="font-size:14px;font-weight:900">${dCity?.label||s.receiverCity}</div><div style="font-size:11px;color:#94a3b8;margin-top:2px">${s.receiverAddress||""}</div><div style="margin-top:8px;padding-top:6px;border-top:1px solid #1e293b;font-size:10px;color:#64748b">Receiver: ${s.receiverName||"—"}</div></div>`
    );

    // Hub markers
    const hubs=[];
    phases.forEach((ph,i)=>{
      if(i===0||!ph.points?.[0]) return;
      if(phases[i-1].vehicleType===ph.vehicleType) return;
      const ht=ph.vehicleType==="flight"?"airport":ph.vehicleType==="ship"?"port":"hub";
      const hIcon=L.divIcon({className:"",html:hubMarkerHTML(ht),iconSize:[20,20],iconAnchor:[10,10]});
      hubs.push(L.marker(ph.points[0],{icon:hIcon}).addTo(map).bindPopup(
        `<div style="background:#0f172a;color:#f8fafc;border-radius:8px;padding:10px;min-width:140px;font-family:sans-serif;border:1px solid #1e293b"><div style="font-size:9px;font-weight:900;color:#a78bfa;text-transform:uppercase;margin-bottom:2px">TRANSFER</div><div style="font-size:12px;font-weight:700">${ph.label}</div></div>`
      ));
    });
    hubsRef.current=hubs;

    // Phase polylines (faint background routes)
    const plines=[];
    phases.forEach(ph=>{
      if(!ph.points||ph.points.length<2) return;
      plines.push(L.polyline(ph.points,{ color:ph.color||RC.road, weight:mode==="flight"?2:3, opacity:.28, dashArray:ph.vehicleType==="flight"?"5 7":null, smoothFactor:2 }).addTo(map));
    });
    phaseLinesRef.current=plines;

    // Traveled / remaining overlay
    const iIdx=Math.max(0,Math.min(points.length-1,Math.floor(progRef.current*(points.length-1))));
    const iPt=points[iIdx]||oCoord;
    tlRef.current=L.polyline(points.slice(0,iIdx+1),{color:RC.completed,weight:4,opacity:.95}).addTo(map);
    rlRef.current=L.polyline(points.slice(iIdx),{color:RC.remaining,weight:2,opacity:.5,dashArray:"6 8"}).addTo(map);

    // Vehicle marker
    if(isDelivered) {
      L.marker(dCoord,{icon:L.divIcon({className:"",html:deliveredHTML(),iconSize:[52,52],iconAnchor:[26,26]}),zIndexOffset:1000}).addTo(map);
    } else {
      const initVt=phases[pmRef.current[iIdx]]?.vehicleType||mode;
      lastVtRef.current=initVt;
      const vm=L.marker(iPt,{icon:L.divIcon({className:"",html:vehicleMarkerHTML(initVt,0),iconSize:[54,54],iconAnchor:[27,27]}),zIndexOffset:1000}).addTo(map);
      vmRef.current=vm;
      vm.bindPopup(`<div style="background:#0f172a;color:#f8fafc;border-radius:10px;padding:12px;min-width:190px;font-family:sans-serif;border:1px solid #1e293b"><div style="font-size:9px;font-weight:900;color:#38bdf8;text-transform:uppercase;margin-bottom:4px">LIVE CARRIER</div><div style="font-size:13px;font-weight:900;font-family:monospace">${s.id}</div><div style="font-size:11px;color:#94a3b8;margin-top:4px">${s.currentLocation||"En Route"}</div><div style="margin-top:8px;padding-top:6px;border-top:1px solid #1e293b;display:flex;justify-content:space-between;font-size:10px"><span style="color:#64748b">${mode.toUpperCase()}</span><span style="color:#10b981;font-weight:700">${s.status}</span></div></div>`);
    }

    // Fit bounds
    try {
      const b=L.latLngBounds([oCoord,dCoord]);
      points.forEach((pt,i)=>{if(i%15===0)b.extend(pt);});
      map.fitBounds(b,{padding:[60,60],maxZoom:8,animate:false});
    } catch{}

    return ()=>{ if(mapRef.current){mapRef.current.remove();mapRef.current=null;} };
  },[s.id,journey,locErr]); // eslint-disable-line

  // ── ANIMATION ───────────────────────────────────────────────────
  useEffect(()=>{ isPlayRef.current=playing; },[playing]);
  useEffect(()=>{ speedRef.current=speed; },[speed]);
  useEffect(()=>{ followRef.current=follow; },[follow]);

  useEffect(()=>{
    if(animRef.current) clearInterval(animRef.current);
    if(isDelivered) return;
    animRef.current=setInterval(()=>{
      if(!isPlayRef.current) return;
      const pts=ptsRef.current; if(!pts.length) return;
      progRef.current+=0.0018*speedRef.current;
      if(progRef.current>=1) progRef.current=0;

      const tot=pts.length-1, exact=progRef.current*tot;
      const ci=Math.min(tot,Math.floor(exact)), ni=Math.min(tot,ci+1), sub=exact-ci;
      const c=pts[ci],n=pts[ni]||c;
      const lat=c[0]+(n[0]-c[0])*sub, lon=c[1]+(n[1]-c[1])*sub;

      // smooth bearing
      const la=pts[Math.min(tot,ci+5)]||n;
      const rb=brg(lat,lon,la[0],la[1]);
      let diff=(rb-smBrgRef.current+360)%360; if(diff>180)diff-=360;
      smBrgRef.current=(smBrgRef.current+diff*.15+360)%360;
      const deg=Math.round(smBrgRef.current);

      // update vehicle marker imperatively
      const vm=vmRef.current;
      if(vm) {
        vm.setLatLng([lat,lon]);
        const phIdx=pmRef.current[ci]||0;
        const newVt=phRef.current[phIdx]?.vehicleType||"truck";
        if(newVt!==lastVtRef.current) {
          lastVtRef.current=newVt;
          vm.setIcon(L.divIcon({className:"",html:vehicleMarkerHTML(newVt,deg),iconSize:[54,54],iconAnchor:[27,27]}));
        } else {
          const el=vm.getElement();
          if(el){ const r=el.querySelector(`[style*="rotate"]`); if(r) r.style.transform=`rotate(${deg}deg)`; }
        }
      }

      // polyline updates
      if(tlRef.current) tlRef.current.setLatLngs([...pts.slice(0,ci+1),[lat,lon]]);
      if(rlRef.current) rlRef.current.setLatLngs([[lat,lon],...pts.slice(ni)]);

      // auto-follow (only if enabled, and vehicle near edge)
      if(followRef.current&&mapRef.current) {
        const b=mapRef.current.getBounds();
        if(!b.pad(-.25).contains([lat,lon])) mapRef.current.panTo([lat,lon],{animate:true,duration:1.5});
      }

      // throttled UI update (5fps)
      const now=Date.now();
      if(now-uiTickRef.current>200) {
        uiTickRef.current=now;
        const phIdx=pmRef.current[ci]||0;
        const ph=phRef.current[phIdx];
        const dc=dCRef.current;
        const distRem=Math.round(haversine(lat,lon,dc[0],dc[1]));
        const spd=ph?.speedKmh||80;
        const alt=ph?Math.round(ph.altFn(sub)):0;
        const etaMins=spd>0?Math.round((distRem/spd)*60):0;
        let chk=ph?.label||"En Route";
        if(progRef.current<.05) chk=`Departing ${s.senderCity||"Origin"}`;
        else if(progRef.current>.93) chk=`Approaching ${s.receiverCity||"Destination"}`;
        setProg(progRef.current);
        setPhaseIdx(phIdx);
        setTele({
          lat:`${Math.abs(lat).toFixed(4)}°${lat>=0?"N":"S"}`,
          lon:`${Math.abs(lon).toFixed(4)}°${lon>=0?"E":"W"}`,
          alt:alt>0?`${alt.toLocaleString()} m`:"Sea Level",
          speed:`${spd} km/h`, brg:`${deg}° ${bLabel(deg)}`,
          distRem:`${distRem.toLocaleString()} km`, totDist:`${totDist.toLocaleString()} km`,
          etaMins, chk,
        });
      }
    },50);
    return()=>{ if(animRef.current) clearInterval(animRef.current); };
  },[s.id,isDelivered,totDist]); // eslint-disable-line

  // ── TILE LAYER UPDATE ────────────────────────────────────────────
  useEffect(()=>{
    if(!mapRef.current) return;
    if(tileRef.current) mapRef.current.removeLayer(tileRef.current);
    const lc=TILES[layer]; tileRef.current=L.tileLayer(lc.url,{maxZoom:lc.maxZoom||19}).addTo(mapRef.current);
  },[layer]);

  // ── VISIBILITY TOGGLES ───────────────────────────────────────────
  useEffect(()=>{
    if(!mapRef.current) return;
    hubsRef.current.forEach(m=>{ try{ showHubs?m.addTo(mapRef.current):mapRef.current.removeLayer(m); }catch{} });
  },[showHubs]);
  useEffect(()=>{
    if(!mapRef.current||!tlRef.current) return;
    try{ showDone?tlRef.current.addTo(mapRef.current):mapRef.current.removeLayer(tlRef.current); }catch{}
  },[showDone]);
  useEffect(()=>{
    if(!mapRef.current||!rlRef.current) return;
    try{ showRem?rlRef.current.addTo(mapRef.current):mapRef.current.removeLayer(rlRef.current); }catch{}
  },[showRem]);

  // ── FULLSCREEN ───────────────────────────────────────────────────
  useEffect(()=>{
    const fn=()=>{ setFs(!!document.fullscreenElement); setTimeout(()=>mapRef.current?.invalidateSize(),150); };
    document.addEventListener("fullscreenchange",fn);
    return()=>document.removeEventListener("fullscreenchange",fn);
  },[]);
  useEffect(()=>{ setTimeout(()=>mapRef.current?.invalidateSize(),100); },[fs]);

  // ── CONTROLS ─────────────────────────────────────────────────────
  const zoomIn  = useCallback(()=>mapRef.current?.zoomIn(),[]);
  const zoomOut = useCallback(()=>mapRef.current?.zoomOut(),[]);
  const fitRoute = useCallback(()=>{
    if(!mapRef.current||!points.length) return;
    try{ const b=L.latLngBounds([oCoord,dCoord]); points.forEach((p,i)=>{if(i%10===0)b.extend(p);}); mapRef.current.fitBounds(b,{padding:[60,60],maxZoom:9,animate:true}); }catch{}
  },[points,oCoord,dCoord]);
  const locateShipment = useCallback(()=>{
    if(!mapRef.current) return;
    const idx=Math.min(ptsRef.current.length-1,Math.floor(progRef.current*(ptsRef.current.length-1)));
    const pt=ptsRef.current[idx]; if(pt) mapRef.current.setView(pt,10,{animate:true,duration:1.2});
  },[]);
  const toggleFS = useCallback(()=>{
    if(!document.fullscreenElement) fsRef.current?.requestFullscreen?.().catch(()=>{});
    else document.exitFullscreen?.().catch(()=>{});
  },[]);
  const togglePlay = useCallback(()=>{ const next=!isPlayRef.current; setPlaying(next); isPlayRef.current=next; },[]);
  const changeSpeed = useCallback(sp=>{ setSpeed(sp); speedRef.current=sp; },[]);
  const toggleFollow = useCallback(()=>{ const next=!followRef.current; setFollow(next); followRef.current=next; },[]);
  const scrub = useCallback(v=>{ progRef.current=v; setProg(v); setPlaying(false); isPlayRef.current=false; },[]);

  const curPhase = phases[phaseIdx];

  return (
    <div ref={fsRef} className="relative w-full bg-slate-950 overflow-hidden select-none"
      style={{height:fs?"100vh":"100%",minHeight:fs?"100vh":"580px"}}>

      {/* Error banner */}
      {locErr && (
        <div className="absolute top-0 inset-x-0 z-[600] flex items-center gap-3 bg-rose-950/97 border-b border-rose-500/60 px-4 py-3 backdrop-blur-xl">
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0"/>
          <span className="text-rose-200 text-sm font-bold flex-1">{locErr}</span>
          <button onClick={()=>setLocErr(null)} className="text-rose-400 hover:text-white cursor-pointer p-1"><X className="h-4 w-4"/></button>
        </div>
      )}

      {/* Delivered banner */}
      {isDelivered && (
        <div className="absolute top-0 inset-x-0 z-[600] flex items-center gap-3 bg-emerald-950/97 border-b border-emerald-500/60 px-4 py-3 backdrop-blur-xl">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0"/>
          <span className="text-emerald-200 text-sm font-bold">Shipment Delivered Successfully</span>
          {s.estimatedDelivery && <span className="text-emerald-400/70 text-xs font-mono ml-2">{s.estimatedDelivery}</span>}
        </div>
      )}

      {/* Top HUD */}
      <div className="absolute top-3 left-3 right-14 z-[500] flex flex-wrap items-start gap-2 pointer-events-none">
        {/* Waybill badge */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-slate-900/97 backdrop-blur-xl px-3 py-2.5 rounded-xl border border-slate-700/80 shadow-2xl">
          <div className={`p-1.5 rounded-lg border ${mode==="flight"?"bg-blue-500/20 text-blue-400 border-blue-500/40":mode==="ship"?"bg-cyan-500/20 text-cyan-400 border-cyan-500/40":mode==="two-wheeler"?"bg-orange-500/20 text-orange-400 border-orange-500/40":mode==="van"?"bg-green-500/20 text-green-400 border-green-500/40":"bg-amber-500/20 text-amber-400 border-amber-500/40"}`}>
            {mode==="flight"?<Plane className="h-4 w-4"/>:mode==="ship"?<Ship className="h-4 w-4"/>:mode==="two-wheeler"?<svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2"><circle cx="5" cy="17" r="3"/><circle cx="19" cy="17" r="3"/><path d="M5 17L9 10L14 10L19 17M9 10L8 6H5"/></svg>:<Truck className="h-4 w-4"/>}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-black text-sky-300 truncate">{s.id||"—"}</span>
              <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-full shrink-0 ${isDelivered?"bg-emerald-500/20 text-emerald-300 border border-emerald-500/40":s.status==="In Transit"||s.status==="Out for Delivery"?"bg-sky-500/20 text-sky-300 border border-sky-500/40":"bg-rose-500/20 text-rose-300 border border-rose-500/40"}`}>{s.status}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium truncate mt-0.5">{s.senderCity} <ArrowRight className="h-2.5 w-2.5 inline"/> {s.receiverCity}</div>
            {curPhase&&phases.length>1&&<div className="flex items-center gap-1 mt-0.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"/><span className="text-[10px] font-bold text-emerald-300 font-mono truncate">{curPhase.label}</span></div>}
          </div>
        </div>

        {/* Phase journey bar */}
        {phases.length>1&&(
          <div className="pointer-events-auto flex-1 min-w-0 bg-slate-900/90 backdrop-blur-xl rounded-xl border border-slate-800/80 p-2 flex items-center gap-1 overflow-x-auto" style={{scrollbarWidth:"none"}}>
            {phases.map((ph,i)=>(
              <React.Fragment key={i}>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold whitespace-nowrap shrink-0 ${i===phaseIdx?"bg-sky-500/20 text-sky-300 border border-sky-500/40":i<phaseIdx?"text-slate-600 line-through":"text-slate-600"}`}>
                  {ph.vehicleType==="flight"?<Plane className="h-2.5 w-2.5 shrink-0"/>:ph.vehicleType==="ship"?<Anchor className="h-2.5 w-2.5 shrink-0"/>:<Truck className="h-2.5 w-2.5 shrink-0"/>}
                  <span>{ph.label}</span>
                </div>
                {i<phases.length-1&&<ArrowRight className="h-2.5 w-2.5 text-slate-700 shrink-0"/>}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Map canvas */}
      <div ref={mapContRef} className="absolute inset-0" style={{zIndex:1}}/>

      {/* Right controls */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-[500] flex flex-col gap-1.5">
        {[
          {ic:<ZoomIn className="h-4 w-4"/>,       fn:zoomIn,          tt:"Zoom In"},
          {ic:<ZoomOut className="h-4 w-4"/>,      fn:zoomOut,         tt:"Zoom Out"},
          {ic:<Route className="h-4 w-4"/>,        fn:fitRoute,        tt:"Fit Route",     hi:true},
          {ic:<Locate className="h-4 w-4"/>,       fn:locateShipment,  tt:"Locate Shipment", hi:true},
          {ic:<Navigation className="h-4 w-4"/>,   fn:toggleFollow,    tt:"Auto-Follow",   act:follow},
        ].map((b,i)=>(
          <button key={i} onClick={b.fn} title={b.tt} className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer shadow-lg ${b.act?"bg-sky-500 text-white border border-sky-400":b.hi?"bg-sky-500/15 text-sky-400 border border-sky-500/40 hover:bg-sky-500/25":"bg-slate-900/97 text-slate-400 border border-slate-700/80 hover:text-slate-200 hover:bg-slate-800"}`}>{b.ic}</button>
        ))}

        <div className="h-px bg-slate-700/60 my-0.5"/>

        {/* Visibility */}
        {[
          {ic:<Eye className="h-4 w-4"/>,    fn:()=>setShowDone(p=>!p), tt:"Completed Route", act:showDone},
          {ic:<EyeOff className="h-4 w-4"/>, fn:()=>setShowRem(p=>!p),  tt:"Remaining Route",  act:showRem},
          {ic:<MapPin className="h-4 w-4"/>, fn:()=>setShowHubs(p=>!p), tt:"Transport Hubs",   act:showHubs},
        ].map((b,i)=>(
          <button key={i} onClick={b.fn} title={b.tt} className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer shadow-lg ${b.act?"bg-slate-700 text-slate-200 border border-slate-600":"bg-slate-900/97 text-slate-600 border border-slate-700/80 hover:text-slate-400"}`}>{b.ic}</button>
        ))}

        <div className="h-px bg-slate-700/60 my-0.5"/>

        {/* Fullscreen */}
        <button onClick={toggleFS} title={fs?"Exit Fullscreen":"Fullscreen"} className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-900/97 text-slate-400 border border-slate-700/80 hover:text-sky-300 hover:border-sky-500/40 hover:bg-sky-500/10 transition cursor-pointer">
          {fs?<Minimize2 className="h-4 w-4"/>:<Maximize2 className="h-4 w-4"/>}
        </button>

        <div className="h-px bg-slate-700/60 my-0.5"/>

        {/* Map style */}
        <div className="flex flex-col gap-0.5 bg-slate-900/97 border border-slate-700/80 rounded-xl p-1">
          {Object.entries(TILES).map(([k,v])=>(
            <button key={k} onClick={()=>setLayer(k)} className={`px-1.5 py-1 rounded-lg text-[8px] font-bold transition cursor-pointer ${layer===k?"bg-sky-500 text-white":"text-slate-400 hover:text-slate-200"}`}>{v.name}</button>
          ))}
        </div>

        <div className="h-px bg-slate-700/60 my-0.5"/>

        {/* Play/Pause */}
        <button onClick={togglePlay} className={`w-9 h-9 rounded-xl flex items-center justify-center border transition cursor-pointer ${playing?"bg-amber-500/15 text-amber-400 border-amber-500/40":"bg-emerald-500/15 text-emerald-400 border-emerald-500/40"}`}>
          {playing?<Pause className="h-4 w-4"/>:<Play className="h-4 w-4 fill-current"/>}
        </button>

        {/* Speed */}
        <div className="flex flex-col gap-0.5 bg-slate-900/97 border border-slate-700/80 rounded-xl p-1">
          {[0.5,1,2,4].map(sp=>(
            <button key={sp} onClick={()=>changeSpeed(sp)} className={`px-1 py-0.5 rounded text-[8px] font-bold transition cursor-pointer ${speed===sp?"bg-sky-500 text-white":"text-slate-400 hover:text-slate-200"}`}>{sp}×</button>
          ))}
        </div>
      </div>

      {/* Route Legend */}
      <div className="absolute bottom-28 left-3 z-[500] bg-slate-900/97 backdrop-blur-xl rounded-xl border border-slate-700/80 p-3 shadow-xl">
        <div className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-2">Legend</div>
        <div className="space-y-1.5">
          {[
            {c:RC.completed, l:"Completed",   d:false},
            {c:RC.remaining, l:"Remaining",   d:true},
            {c:RC.flight,    l:"Flight",       d:true},
            {c:RC.ship,      l:"Sea Route",    d:false},
            {c:RC.road,      l:"Road/Truck",   d:false},
            {c:RC.lastMile,  l:"Last Mile",    d:false},
          ].map(({c,l,d})=>(
            <div key={l} className="flex items-center gap-2">
              <div style={{width:22,height:2.5,background:c,borderRadius:2,opacity:d?.7:1,backgroundImage:d?"repeating-linear-gradient(90deg,transparent,transparent 4px,#0f172a 4px,#0f172a 7px)":"none"}}/>
              <span className="text-[9px] text-slate-400 font-bold">{l}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
          {[{c:"A",b:"#1e40af",l:"Airport"},{c:"P",b:"#0c4a6e",l:"Port"},{c:"H",b:"#065f46",l:"Hub"}].map(({c,b,l})=>(
            <div key={l} className="flex items-center gap-2">
              <div style={{width:14,height:14,borderRadius:"50%",background:b,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:900,color:"#e2e8f0",fontFamily:"monospace"}}>{c}</div>
              <span className="text-[9px] text-slate-400 font-bold">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom telemetry */}
      <div className="absolute bottom-2 left-2 right-2 z-[500] bg-slate-900/97 backdrop-blur-xl rounded-2xl border border-slate-700/80 shadow-2xl p-3">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-4 gap-y-2 text-xs">
          {[
            {l:"POSITION",   v:tele.lat,     s:tele.lon,      vc:"text-white"},
            {l:"SPEED / ALT",v:tele.speed,   s:tele.alt,      vc:"text-emerald-400"},
            {l:"HEADING",    v:tele.brg,     s:mode.toUpperCase(), vc:"text-sky-400"},
            {l:"DISTANCE",   v:tele.distRem+" rem", s:`Total: ${tele.totDist||"—"}`, vc:"text-amber-400"},
            {l:"ETA",        v:isDelivered?"Delivered":tele.etaMins>0?`~${tele.etaMins} min`:"Arriving", s:s.estimatedDelivery||"—", vc:"text-purple-400"},
            {l:"CHECKPOINT", v:tele.chk,     s:<span className="text-emerald-400 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"/>{isDelivered?"Done":"GPS Live"}</span>, vc:"text-white"},
          ].map(({l,v,s,vc})=>(
            <div key={l}>
              <span className="text-[8px] text-slate-500 uppercase font-mono tracking-wider block mb-0.5">{l}</span>
              <span className={`font-mono font-bold block text-[10px] truncate ${vc}`}>{v}</span>
              <span className="font-mono text-[9px] text-slate-500 truncate block">{s}</span>
            </div>
          ))}
        </div>
        {/* Progress */}
        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center gap-2">
          <span className="text-[8px] font-mono text-slate-600 shrink-0 truncate max-w-[60px]">{s.senderCity||"A"}</span>
          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full" style={{width:`${Math.round(prog*100)}%`,transition:"width .05s linear"}}/>
          </div>
          <span className="text-[8px] font-mono text-slate-600 shrink-0 truncate max-w-[60px] text-right">{s.receiverCity||"B"}</span>
          <span className="text-[10px] font-mono font-bold text-sky-400 shrink-0 w-7 text-right">{Math.round(prog*100)}%</span>
          <input type="range" min="0" max="1" step="0.001" value={prog} onChange={e=>scrub(parseFloat(e.target.value))} className="w-16 cursor-pointer accent-sky-400 h-1 shrink-0"/>
        </div>
      </div>
    </div>
  );
}
