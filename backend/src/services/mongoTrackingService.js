import express from 'express';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import TrackedVehicle from '../models/TrackedVehicle.js';
import { normalizePlate } from './trackingService.js';

const hash = value => createHash('sha256').update(String(value || '')).digest('hex');
const safeMatch = (value, expected) => timingSafeEqual(Buffer.from(hash(value)), Buffer.from(expected));
const bearer = req => (req.headers.authorization || '').replace(/^Bearer /, '');
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function createMongoTrackingApp({ operatorKey, now = Date.now }) {
  const router = express.Router();
  const publicVehicle = record => {
    const v = record.toObject ? record.toObject() : record;
    const expiresAt = new Date(v.expiresAt).getTime();
    const receivedAt = v.location?.receivedAt ? new Date(v.location.receivedAt).getTime() : null;
    return {
      plate: v.plate,
      label: v.label,
      expiresAt,
      sharing: v.sharing,
      location: v.location?.latitude == null ? null : { ...v.location, timestamp: new Date(v.location.timestamp).getTime(), receivedAt },
      stale: !v.sharing || !receivedAt || now() - receivedAt > 30000 || now() > expiresAt,
    };
  };
  const operator = (req, res, next) => safeMatch(bearer(req), hash(operatorKey)) ? next() : res.status(401).json({ error: 'Enter a valid operator key.' });
  const access = kind => wrap(async (req, res, next) => {
    const vehicle = await TrackedVehicle.findOne({ plate: normalizePlate(req.params.plate) }).select('+driverHash +viewerHash');
    if (!vehicle || now() > new Date(vehicle.expiresAt).getTime() || !safeMatch(bearer(req), vehicle[`${kind}Hash`])) {
      return res.status(401).json({ error: 'This tracking link is invalid, expired, or revoked. Ask your supervisor for a new link.' });
    }
    req.vehicle = vehicle;
    next();
  });

  router.get('/vehicles', operator, wrap(async (_req, res) => res.json((await TrackedVehicle.find().sort({ updatedAt: -1 })).map(publicVehicle))));
  router.post('/vehicles', operator, wrap(async (req, res) => {
    const plate = normalizePlate(req.body.plate);
    if (plate.length < 4 || plate.length > 20 || typeof req.body.label !== 'string' || !req.body.label.trim() || req.body.label.length > 100) {
      return res.status(400).json({ error: 'Enter a valid plate (4-20 letters/digits) and vehicle name.' });
    }
    const driverToken = randomBytes(32).toString('hex');
    const viewerToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(now() + 86400000);
    await TrackedVehicle.findOneAndUpdate({ plate }, {
      plate, label: req.body.label.trim(), driverHash: hash(driverToken), viewerHash: hash(viewerToken), expiresAt, sharing: false, $unset: { location: 1 },
    }, { upsert: true, runValidators: true });
    res.status(201).json({ plate, driverToken, viewerToken, expiresAt: expiresAt.getTime() });
  }));
  router.get('/vehicles/:plate', access('viewer'), (req, res) => res.json(publicVehicle(req.vehicle)));
  router.post('/vehicles/:plate/location', access('driver'), wrap(async (req, res) => {
    const { latitude, longitude, accuracy, timestamp } = req.body;
    if (![latitude, longitude, accuracy, timestamp].every(Number.isFinite) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180 || accuracy < 0 || accuracy > 100000 || timestamp > now() + 60000 || timestamp < now() - 120000) {
      return res.status(400).json({ error: 'Invalid or outdated GPS position.' });
    }
    const previous = req.vehicle.location?.timestamp ? new Date(req.vehicle.location.timestamp).getTime() : 0;
    if (timestamp <= previous) return res.status(409).json({ error: 'An equal or newer position is already recorded.' });
    req.vehicle.location = { latitude, longitude, accuracy, timestamp: new Date(timestamp), receivedAt: new Date(now()) };
    req.vehicle.sharing = true;
    await req.vehicle.save();
    res.json(publicVehicle(req.vehicle));
  }));
  router.post('/vehicles/:plate/stop', access('driver'), wrap(async (req, res) => {
    req.vehicle.sharing = false;
    req.vehicle.location = undefined;
    await req.vehicle.save();
    res.sendStatus(204);
  }));
  router.delete('/vehicles/:plate', operator, wrap(async (req, res) => {
    await TrackedVehicle.deleteOne({ plate: normalizePlate(req.params.plate) });
    res.sendStatus(204);
  }));
  return router;
}
