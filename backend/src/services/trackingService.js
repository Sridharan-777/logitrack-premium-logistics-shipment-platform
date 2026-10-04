// Preserved GPS tracking service from the original server/tracking.js
// This module maintains the real phone GPS tracking system with operator-key auth,
// driver/viewer tokens, rate limiting, and JSON file persistence.
//
// It is mounted into the Express app alongside the new MongoDB-backed API routes.

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

  const router = express.Router();

  // Rate limiting for tracking API
  const attempts = new Map();
  router.use((req, res, next) => {
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

  router.get('/vehicles', operator, (req, res) => res.json(Object.values(vehicles).map(publicVehicle)));

  router.post('/vehicles', operator, (req, res) => {
    const plate = normalizePlate(req.body.plate);
    if (plate.length < 4 || plate.length > 20 || typeof req.body.label !== 'string' || req.body.label.length > 100) return res.status(400).json({ error: 'Enter a valid plate (4–20 letters/digits) and vehicle name (up to 100 characters).' });
    const driverToken = randomBytes(32).toString('hex');
    const viewerToken = randomBytes(32).toString('hex');
    vehicles[plate] = { plate, label: req.body.label.trim(), driverHash: hash(driverToken), viewerHash: hash(viewerToken), expiresAt: now() + 86400000, sharing: false, location: null };
    save();
    res.status(201).json({ plate, driverToken, viewerToken, expiresAt: vehicles[plate].expiresAt });
  });

  router.delete('/vehicles/:plate', operator, (req, res) => { delete vehicles[normalizePlate(req.params.plate)]; save(); res.sendStatus(204); });

  const access = kind => (req, res, next) => {
    const v = vehicles[normalizePlate(req.params.plate)];
    if (!v || now() > v.expiresAt || !timingSafeEqual(Buffer.from(hash(token(req))), Buffer.from(v[kind + 'Hash']))) return res.status(401).json({ error: 'This tracking link is invalid, expired, or revoked. Ask your supervisor for a new link.' });
    req.vehicle = v; next();
  };

  router.get('/vehicles/:plate', access('viewer'), (req, res) => res.json(publicVehicle(req.vehicle)));

  router.post('/vehicles/:plate/location', access('driver'), (req, res) => {
    const { latitude, longitude, accuracy, timestamp } = req.body;
    if (![latitude, longitude, accuracy, timestamp].every(Number.isFinite) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180 || accuracy < 0 || accuracy > 100000 || timestamp > now() + 60000 || timestamp < now() - 120000) return res.status(400).json({ error: 'Invalid or outdated GPS position.' });
    if (req.vehicle.location && timestamp <= req.vehicle.location.timestamp) return res.status(409).json({ error: 'An equal or newer position is already recorded.' });
    req.vehicle.location = { latitude, longitude, accuracy, timestamp, receivedAt: now() };
    req.vehicle.sharing = true; save(); res.json(publicVehicle(req.vehicle));
  });

  router.post('/vehicles/:plate/stop', access('driver'), (req, res) => { req.vehicle.sharing = false; req.vehicle.location = null; save(); res.sendStatus(204); });

  return router;
}
