import express from 'express';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import path from 'node:path';

const hash = value => createHash('sha256').update(value).digest('hex');
export const normalizePlate = plate => String(plate || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
export function createTrackingApp({ operatorKey, dataDir, now = Date.now }) {
  if (!operatorKey || operatorKey.length < 32) throw new Error('TRACKING_OPERATOR_KEY must contain at least 32 characters.');
  mkdirSync(dataDir, { recursive: true });
  const file = path.join(dataDir, 'vehicles.json');
  let vehicles = {};
  try { vehicles = JSON.parse(readFileSync(file, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const save = () => { writeFileSync(file + '.tmp', JSON.stringify(vehicles), { mode: 0o600 }); renameSync(file + '.tmp', file); };
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '4kb' }));
  app.use((req, res, next) => {
    res.set({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Permissions-Policy': 'geolocation=(self)' });
    next();
  });
  const attempts = new Map();
  app.use('/api', (req, res, next) => {
    const time = now(), key = req.ip;
    for (const [ip, item] of attempts) if (time - item.start > 60000) attempts.delete(ip);
    const item = attempts.get(key) || { start: time, count: 0 };
    item.count++; attempts.set(key, item);
    if (item.count > 240) return res.status(429).json({ error: 'Too many requests. Retry in a minute.' });
    next();
  });
  const token = req => (req.headers.authorization || '').replace(/^Bearer /, '');
  const operator = (req, res, next) => {
    if (!timingSafeEqual(Buffer.from(hash(token(req))), Buffer.from(hash(operatorKey)))) return res.status(401).json({ error: 'Enter a valid operator key.' });
    next();
  };
  const publicVehicle = v => ({ plate: v.plate, label: v.label, expiresAt: v.expiresAt, sharing: v.sharing, location: v.location, stale: !v.sharing || !v.location || now() - v.location.receivedAt > 30000 || now() > v.expiresAt });
  app.get('/api/tracking/vehicles', operator, (req, res) => res.json(Object.values(vehicles).map(publicVehicle)));
  app.post('/api/tracking/vehicles', operator, (req, res) => {
    const plate = normalizePlate(req.body.plate);
    if (plate.length < 4 || plate.length > 20 || typeof req.body.label !== 'string' || req.body.label.length > 100) return res.status(400).json({ error: 'Enter a valid plate (4–20 letters/digits) and vehicle name (up to 100 characters).' });
    const driverToken = randomBytes(32).toString('hex');
    const viewerToken = randomBytes(32).toString('hex');
    vehicles[plate] = { plate, label: req.body.label.trim(), driverHash: hash(driverToken), viewerHash: hash(viewerToken), expiresAt: now() + 86400000, sharing: false, location: null };
    save();
    res.status(201).json({ plate, driverToken, viewerToken, expiresAt: vehicles[plate].expiresAt });
  });
  app.delete('/api/tracking/vehicles/:plate', operator, (req, res) => { delete vehicles[normalizePlate(req.params.plate)]; save(); res.sendStatus(204); });
  const access = kind => (req, res, next) => {
    const v = vehicles[normalizePlate(req.params.plate)];
    if (!v || now() > v.expiresAt || !timingSafeEqual(Buffer.from(hash(token(req))), Buffer.from(v[kind + 'Hash']))) return res.status(401).json({ error: 'This tracking link is invalid, expired, or revoked. Ask your supervisor for a new link.' });
    req.vehicle = v; next();
  };
  app.get('/api/tracking/vehicles/:plate', access('viewer'), (req, res) => res.json(publicVehicle(req.vehicle)));
  app.post('/api/tracking/vehicles/:plate/location', access('driver'), (req, res) => {
    const { latitude, longitude, accuracy, timestamp } = req.body;
    if (![latitude, longitude, accuracy, timestamp].every(Number.isFinite) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180 || accuracy < 0 || accuracy > 100000 || timestamp > now() + 60000 || timestamp < now() - 120000) return res.status(400).json({ error: 'Invalid or outdated GPS position.' });
    if (req.vehicle.location && timestamp <= req.vehicle.location.timestamp) return res.status(409).json({ error: 'An equal or newer position is already recorded.' });
    req.vehicle.location = { latitude, longitude, accuracy, timestamp, receivedAt: now() };
    req.vehicle.sharing = true; save(); res.json(publicVehicle(req.vehicle));
  });
  app.post('/api/tracking/vehicles/:plate/stop', access('driver'), (req, res) => { req.vehicle.sharing = false; req.vehicle.location = null; save(); res.sendStatus(204); });
  app.use('/api', (req, res) => res.status(404).json({ error: 'API route not found.' }));
  app.use((error, req, res, next) => { res.status(error.type === 'entity.too.large' ? 413 : error.type === 'entity.parse.failed' ? 400 : 500).json({ error: error.type === 'entity.too.large' ? 'Request is too large.' : error.type === 'entity.parse.failed' ? 'Invalid JSON.' : 'Tracking service could not save this update.' }); });
  return app;
}
