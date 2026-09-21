import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const normalize = s => s.toUpperCase().replace(/[^A-Z0-9]/g, '');
async function api(endpoint, key, method = 'GET', body) {
  const response = await fetch('/api/tracking/vehicles' + endpoint, { method, headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  if (response.status === 204) return null;
  let data; try { data = await response.json(); } catch { throw new Error('Tracking server is unavailable. Start the server and use its HTTPS address.'); }
  if (!response.ok) throw new Error(data.error || 'Tracking request failed.');
  return data;
}
function GPSMap({ vehicle }) {
  const container = useRef(null), map = useRef(null), marker = useRef(null), circle = useRef(null);
  useEffect(() => {
    map.current = L.map(container.current).setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }).addTo(map.current);
    return () => { map.current.remove(); map.current = null; };
  }, []);
  useEffect(() => {
    const point = vehicle?.location;
    if (!point) { marker.current?.remove(); circle.current?.remove(); marker.current = circle.current = null; return; }
    const position = [point.latitude, point.longitude];
    if (!marker.current) {
      marker.current = L.circleMarker(position, { radius: 9, color: '#fff', fillColor: '#0284c7', fillOpacity: 1 }).addTo(map.current);
      circle.current = L.circle(position, { radius: point.accuracy, color: '#0284c7', weight: 1 }).addTo(map.current);
    }
    marker.current.setLatLng(position); circle.current.setLatLng(position).setRadius(point.accuracy);
    map.current.setView(position, 16);
  }, [vehicle]);
  return <div className="gps-map-frame"><div ref={container} aria-label="Actual driver location map" /></div>;
}
export default function LiveFleetTracking() {
  const [link] = useState(() => new URLSearchParams(window.location.hash.slice(1)));
  const driver = link.get('driver'), viewer = link.get('viewer'), linkedPlate = link.get('plate');
  const [key, setKey] = useState(''), [connected, setConnected] = useState(false), [vehicles, setVehicles] = useState([]);
  const [plate, setPlate] = useState(linkedPlate || ''), [label, setLabel] = useState(''), [selected, setSelected] = useState(null);
  const [links, setLinks] = useState(null), [error, setError] = useState(''), [sharing, setSharing] = useState(false), [status, setStatus] = useState('');
  const watch = useRef(null), lastSent = useRef(0), generation = useRef(0), queue = useRef(Promise.resolve());
  const [clock, setClock] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setClock(Date.now()), 1000); return () => clearInterval(id); }, []);
  const endpoint = `/${encodeURIComponent(normalize(linkedPlate || plate))}`;
  const stop = async () => {
    generation.current++; if (watch.current !== null) navigator.geolocation.clearWatch(watch.current);
    watch.current = null; setSharing(false);
    try { await queue.current; await api(endpoint + '/stop', driver, 'POST'); setSelected(null); setStatus('Sharing stopped. The server location has been removed.'); }
    catch (e) { setError(`Phone sharing stopped. Server could not be notified: ${e.message}`); }
  };
  useEffect(() => () => { generation.current++; if (watch.current !== null) navigator.geolocation.clearWatch(watch.current); }, []);
  useEffect(() => {
    if (!viewer && !connected) return;
    let cancelled = false, timer;
    const poll = async () => {
      try {
        const data = await api(viewer ? `/${encodeURIComponent(normalize(linkedPlate || ''))}` : '', viewer || key);
        if (!cancelled) { if (viewer) setSelected(data); else setVehicles(data); setError(''); }
      } catch (e) { if (!cancelled) setError(e.message); }
      if (!cancelled) timer = setTimeout(poll, 5000);
    };
    poll(); return () => { cancelled = true; clearTimeout(timer); };
  }, [viewer, linkedPlate, connected, key]);
  const start = () => {
    if (!window.isSecureContext || !navigator.geolocation) { setError('Open this driver link over HTTPS and enable browser location access.'); return; }
    if (watch.current !== null) return;
    setError(''); setStatus('Waiting for phone GPS permission and a position…'); setSharing(true); lastSent.current = 0;
    const run = ++generation.current;
    watch.current = navigator.geolocation.watchPosition(position => {
      if (Date.now() - lastSent.current < 5000) return;
      lastSent.current = Date.now();
      queue.current = queue.current.catch(() => {}).then(async () => {
        if (run !== generation.current) return;
        try {
          const data = await api(endpoint + '/location', driver, 'POST', { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy, timestamp: position.timestamp });
          if (run === generation.current) { setSelected(data); setError(''); setStatus('Your phone location is being shared.'); }
        } catch (e) { if (run === generation.current) setError(e.message); }
      });
    }, e => { setError(e.code === 1 ? 'Location permission denied. Enable it in browser settings and try again.' : 'GPS is unavailable. Move outdoors and keep this page open.'); if (e.code === 1) { generation.current++; navigator.geolocation.clearWatch(watch.current); watch.current = null; setSharing(false); } }, { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
  };
  const current = !viewer && !driver ? vehicles.find(v => v.plate === normalize(plate)) : selected;
  const stale = !current?.sharing || !current.location || clock - current.location.receivedAt > 30000 || clock > current.expiresAt;
  return <section className="max-w-5xl mx-auto space-y-4 p-4 bg-slate-950 text-slate-100">
    <h1 className="text-2xl font-bold text-white">{driver ? 'Share your vehicle location' : 'Live vehicle tracking'}</h1>
    <p className="text-slate-300">{driver ? `Vehicle ${linkedPlate}. Share only while you are driving this registered vehicle. Keep this page open; phone browsers may pause GPS in the background.` : 'Search a registered number plate to view its latest authorized phone location. Positions update every five seconds when available.'}</p>
    {error && <p role="alert" className="p-3 bg-rose-500/10 text-rose-400 rounded-lg">{error}</p>}
    {status && <p role="status">{status}</p>}
    {driver ? <div className="flex gap-3"><button disabled={sharing} className="gps-button" onClick={start}>Start sharing location</button><button className="gps-button" onClick={stop}>Stop sharing</button></div> : !viewer && <>
      {!connected ? <form className="flex flex-wrap gap-3" onSubmit={async e => { e.preventDefault(); try { setVehicles(await api('', key)); setConnected(true); setError(''); } catch (e) { setError(e.message); } }}>
        <label>Operator key<input className="gps-input" type="password" value={key} onChange={e => setKey(e.target.value)} autoComplete="off" required /></label><button className="gps-button">Connect</button>
      </form> : <>
        <button className="underline" onClick={() => { setConnected(false); setKey(''); setVehicles([]); setLinks(null); }}>Disconnect operator</button>
        <form className="flex flex-wrap gap-3" onSubmit={async e => { e.preventDefault(); try { const data = await api('', key, 'POST', { plate, label }); const base = window.location.origin + window.location.pathname; setLinks({ driver: `${base}#driver=${data.driverToken}&plate=${data.plate}`, viewer: `${base}#viewer=${data.viewerToken}&plate=${data.plate}` }); setVehicles(await api('', key)); setError(''); } catch (e) { setError(e.message); } }}>
          <label>Vehicle plate<input className="gps-input" required minLength={4} maxLength={30} value={plate} onChange={e => setPlate(e.target.value)} placeholder="TN72LT2024" /></label>
          <label>Vehicle name<input className="gps-input" required maxLength={100} value={label} onChange={e => setLabel(e.target.value)} /></label>
          <button className="gps-button">{vehicles.some(v => v.plate === normalize(plate)) ? 'Replace links (revoke old links)' : 'Register vehicle'}</button>
        </form>
        {links && <div className="p-4 bg-slate-900 rounded-xl space-y-3"><p>Links expire after 24 hours. Share the driver link only with the assigned driver and the viewing link only with authorized viewers.</p>{Object.entries(links).map(([type, url]) => <label key={type}>{type === 'driver' ? 'Driver link' : 'Read-only viewing link'}<input className="gps-input w-full" readOnly value={url} onFocus={e => e.target.select()} /></label>)}</div>}
        <label>Find registered vehicle<input className="gps-input" value={plate} onChange={e => setPlate(e.target.value)} placeholder="Enter number plate" /></label>
        <div className="flex flex-wrap gap-2">{vehicles.map(v => <button className="gps-button" key={v.plate} onClick={() => setPlate(v.plate)}>{v.plate}</button>)}</div>
        {current && <button className="text-rose-400 underline" onClick={async () => { try { await api('/' + current.plate, key, 'DELETE'); setVehicles(await api('', key)); setLinks(null); } catch (e) { setError(e.message); } }}>Revoke tracking and remove vehicle</button>}
      </>}
    </>}
    <div role="status" className="p-4 rounded-xl bg-slate-900 border border-slate-700">
      <strong>{current?.plate || (plate ? 'No registered vehicle selected' : 'Select a vehicle')}</strong>
      <p>{stale ? 'No live signal — stopped, waiting, expired, or last update older than 30 seconds.' : 'Live phone signal'}</p>
      {current?.location && <p>Last update: {new Date(current.location.receivedAt).toLocaleString()} · Accuracy ±{Math.round(current.location.accuracy)} m{stale ? ' · Last known position only' : ''}</p>}
    </div>
    <GPSMap vehicle={current} />
  </section>;
}
