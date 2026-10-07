import WorkerLocationSession from '../models/WorkerLocationSession.js';
import Shipment from '../models/Shipment.js';
import User, { ROLES } from '../models/User.js';

export const SHIFT_DURATION_MS = 8 * 60 * 60 * 1000;
export const STALE_AFTER_MS = 30 * 1000;
export const MIN_UPDATE_INTERVAL_MS = 3 * 1000;
export const MAX_LOCATION_AGE_MS = 2 * 60 * 1000;
export const MAX_FUTURE_SKEW_MS = 60 * 1000;

const TERMINAL_SHIPMENT_STATUSES = ['Delivered', 'Cancelled'];
const SAFE_WORKER_FIELDS =
  'name avatar profileImage vehicleType vehiclePlate transportMode zone workerStatus';

const asDate = (value) => {
  if (value instanceof Date) return new Date(value.getTime());
  return new Date(value);
};

const dateIso = (value) => {
  if (!value) return null;
  const parsed = asDate(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const objectIdString = (value) => (value?._id || value)?.toString();

const sanitizeDeviceId = (value) => {
  if (value === undefined || value === null || value === '') {
    return { value: '' };
  }
  if (
    typeof value !== 'string' ||
    value.length > 128 ||
    !/^[A-Za-z0-9._:-]+$/.test(value)
  ) {
    return {
      error: 'deviceId must be at most 128 characters and contain only letters, numbers, dot, underscore, colon, or hyphen.',
    };
  }
  return { value };
};

export const validateLocationPayload = (body = {}, nowValue = new Date()) => {
  const now = asDate(nowValue);
  const { latitude, longitude, accuracy, timestamp } = body;

  if (typeof latitude !== 'number' || !Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return { error: 'latitude must be a finite number between -90 and 90.' };
  }
  if (typeof longitude !== 'number' || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return { error: 'longitude must be a finite number between -180 and 180.' };
  }
  if (typeof accuracy !== 'number' || !Number.isFinite(accuracy) || accuracy < 0 || accuracy > 10_000) {
    return { error: 'accuracy must be a finite number between 0 and 10000 metres.' };
  }

  const deviceTimestamp = asDate(timestamp);
  if (timestamp === undefined || timestamp === null || Number.isNaN(deviceTimestamp.getTime())) {
    return { error: 'timestamp must be a valid ISO-8601 value or epoch milliseconds.' };
  }

  const ageMs = now.getTime() - deviceTimestamp.getTime();
  if (ageMs > MAX_LOCATION_AGE_MS) {
    return { error: 'Location timestamp is too old. Request a fresh GPS position.' };
  }
  if (ageMs < -MAX_FUTURE_SKEW_MS) {
    return { error: 'Location timestamp is too far in the future.' };
  }

  const device = sanitizeDeviceId(body.deviceId);
  if (device.error) return device;

  return {
    value: {
      latitude,
      longitude,
      accuracy,
      deviceTimestamp,
      deviceId: device.value,
    },
  };
};

export const getSessionStatus = (session, nowValue = new Date()) => {
  if (!session) return 'OFFLINE';

  const now = asDate(nowValue);
  if (asDate(session.expiresAt).getTime() <= now.getTime()) return 'EXPIRED';
  if (!session.active) return 'STOPPED';
  if (!session.lastLocation?.receivedAt) return 'WAITING';

  return now.getTime() - asDate(session.lastLocation.receivedAt).getTime() > STALE_AFTER_MS
    ? 'STALE'
    : 'ACTIVE';
};

export const serializeSession = (session, nowValue = new Date(), { includeDeviceId = false } = {}) => {
  if (!session) return null;

  const now = asDate(nowValue);
  const status = getSessionStatus(session, now);
  const effectiveActive = ['ACTIVE', 'STALE', 'WAITING'].includes(status);
  const location = effectiveActive && session.lastLocation
    ? {
        latitude: session.lastLocation.latitude,
        longitude: session.lastLocation.longitude,
        accuracy: session.lastLocation.accuracy,
        deviceTimestamp: dateIso(session.lastLocation.deviceTimestamp),
        receivedAt: dateIso(session.lastLocation.receivedAt),
      }
    : null;

  const result = {
    id: objectIdString(session),
    active: effectiveActive,
    status,
    stale: status === 'STALE',
    staleAfterSeconds: STALE_AFTER_MS / 1000,
    startedAt: dateIso(session.startedAt),
    expiresAt: dateIso(session.expiresAt),
    endedAt: dateIso(session.endedAt),
    remainingSeconds: effectiveActive
      ? Math.max(0, Math.ceil((asDate(session.expiresAt).getTime() - now.getTime()) / 1000))
      : 0,
    lastLocation: location,
  };

  if (includeDeviceId) result.deviceId = session.deviceId || '';
  return result;
};

const serializeWorker = (worker) => ({
  id: objectIdString(worker),
  name: worker.name,
  avatar: worker.avatar || '',
  profileImage: worker.profileImage || '',
  vehicleType: worker.vehicleType || '',
  vehiclePlate: worker.vehiclePlate || '',
  transportMode: worker.transportMode || '',
  zone: worker.zone || '',
  workerStatus: worker.workerStatus || '',
});

export const createWorkerLocationHandlers = ({
  WorkerLocationSessionModel = WorkerLocationSession,
  ShipmentModel = Shipment,
  UserModel = User,
  now = () => new Date(),
} = {}) => {
  const currentTime = () => asDate(now());

  const expireOldSessions = async (at) => {
    await WorkerLocationSessionModel.updateMany(
      { active: true, expiresAt: { $lte: at } },
      { $set: { active: false, endedAt: at, lastLocation: null } }
    );
  };

  const startShift = async (req, res) => {
    const at = currentTime();
    const device = sanitizeDeviceId(req.body?.deviceId);
    if (device.error) {
      return res.status(400).json({ success: false, message: device.error });
    }

    await expireOldSessions(at);
    const existing = await WorkerLocationSessionModel.findOne({ worker: req.user._id });
    if (existing?.active && asDate(existing.expiresAt).getTime() > at.getTime()) {
      if (device.value && existing.deviceId && existing.deviceId !== device.value) {
        return res.status(409).json({
          success: false,
          message: 'This shift is already active on another registered device.',
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Location shift is already active.',
        session: serializeSession(existing, at, { includeDeviceId: true }),
      });
    }

    const session = await WorkerLocationSessionModel.findOneAndUpdate(
      { worker: req.user._id },
      {
        $set: {
          startedAt: at,
          expiresAt: new Date(at.getTime() + SHIFT_DURATION_MS),
          endedAt: null,
          active: true,
          deviceId: device.value,
          lastLocation: null,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    return res.status(201).json({
      success: true,
      message: 'Location shift started. It will expire after eight hours.',
      session: serializeSession(session, at, { includeDeviceId: true }),
    });
  };

  const updateLocation = async (req, res) => {
    const at = currentTime();
    const validated = validateLocationPayload(req.body, at);
    if (validated.error) {
      return res.status(400).json({ success: false, message: validated.error });
    }

    const session = await WorkerLocationSessionModel.findOne({ worker: req.user._id });
    if (!session) {
      return res.status(409).json({
        success: false,
        message: 'No location shift exists. Start a shift before sending GPS updates.',
      });
    }

    if (asDate(session.expiresAt).getTime() <= at.getTime()) {
      session.active = false;
      session.endedAt = at;
      session.lastLocation = null;
      await session.save();
      return res.status(410).json({
        success: false,
        message: 'The eight-hour location shift has expired. Start a new shift.',
      });
    }
    if (!session.active) {
      return res.status(409).json({
        success: false,
        message: 'Location shift is stopped. Start a new shift before sending GPS updates.',
      });
    }

    if (
      validated.value.deviceId &&
      session.deviceId &&
      validated.value.deviceId !== session.deviceId
    ) {
      return res.status(403).json({
        success: false,
        message: 'This device does not match the device that started the shift.',
      });
    }

    const previousReceivedAt = session.lastLocation?.receivedAt
      ? asDate(session.lastLocation.receivedAt)
      : null;
    if (previousReceivedAt) {
      const elapsedMs = at.getTime() - previousReceivedAt.getTime();
      if (elapsedMs < MIN_UPDATE_INTERVAL_MS) {
        const retryAfterMs = MIN_UPDATE_INTERVAL_MS - elapsedMs;
        res.set('Retry-After', String(Math.ceil(retryAfterMs / 1000)));
        return res.status(429).json({
          success: false,
          message: 'Location updates are arriving too quickly.',
          retryAfterMs,
        });
      }

      const previousDeviceTimestamp = session.lastLocation?.deviceTimestamp
        ? asDate(session.lastLocation.deviceTimestamp)
        : null;
      if (
        previousDeviceTimestamp &&
        validated.value.deviceTimestamp.getTime() < previousDeviceTimestamp.getTime()
      ) {
        return res.status(409).json({
          success: false,
          message: 'Location update is older than the latest stored GPS position.',
        });
      }
    }

    if (!session.deviceId && validated.value.deviceId) {
      session.deviceId = validated.value.deviceId;
    }
    session.lastLocation = {
      latitude: validated.value.latitude,
      longitude: validated.value.longitude,
      accuracy: validated.value.accuracy,
      deviceTimestamp: validated.value.deviceTimestamp,
      receivedAt: at,
    };
    await session.save();

    return res.json({
      success: true,
      message: 'Location updated.',
      session: serializeSession(session, at, { includeDeviceId: true }),
    });
  };

  const stopShift = async (req, res) => {
    const at = currentTime();
    const session = await WorkerLocationSessionModel.findOne({ worker: req.user._id });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No location shift exists for this worker.',
      });
    }

    session.active = false;
    session.endedAt = at;
    session.lastLocation = null;
    await session.save();

    return res.json({
      success: true,
      message: 'Location shift stopped and the current coordinates were cleared.',
      session: serializeSession(session, at, { includeDeviceId: true }),
    });
  };

  const getMyShift = async (req, res) => {
    const at = currentTime();
    await expireOldSessions(at);
    const session = await WorkerLocationSessionModel.findOne({ worker: req.user._id });
    return res.json({
      success: true,
      session: serializeSession(session, at, { includeDeviceId: true }),
    });
  };

  const getActiveWorkers = async (req, res) => {
    const at = currentTime();
    await expireOldSessions(at);

    const workers = await UserModel.find({ role: ROLES.WORKER, active: true })
      .select(SAFE_WORKER_FIELDS)
      .sort({ name: 1 })
      .lean();
    const workerIds = workers.map((worker) => worker._id);
    const sessions = workerIds.length
      ? await WorkerLocationSessionModel.find({ worker: { $in: workerIds } }).lean()
      : [];
    const sessionByWorker = new Map(
      sessions.map((session) => [objectIdString(session.worker), session])
    );

    const result = workers.map((worker) => ({
      worker: serializeWorker(worker),
      tracking: serializeSession(sessionByWorker.get(objectIdString(worker)), at),
    }));

    return res.json({
      success: true,
      generatedAt: at.toISOString(),
      staleAfterSeconds: STALE_AFTER_MS / 1000,
      count: result.length,
      activeCount: result.filter((item) => item.tracking?.active).length,
      workers: result,
    });
  };

  const getCustomerWorkers = async (req, res) => {
    const at = currentTime();
    await expireOldSessions(at);

    const shipments = await ShipmentModel.find({
      customer: req.user._id,
      assignedWorker: { $ne: null },
      status: { $nin: TERMINAL_SHIPMENT_STATUSES },
    })
      .select('trackingNumber status estimatedDelivery currentLocation assignedWorker')
      .lean();

    const workerIds = [...new Set(shipments.map((shipment) => objectIdString(shipment.assignedWorker)).filter(Boolean))];
    const workers = workerIds.length
      ? await UserModel.find({
          _id: { $in: workerIds },
          role: ROLES.WORKER,
          active: true,
        })
          .select(SAFE_WORKER_FIELDS)
          .lean()
      : [];
    const sessions = workerIds.length
      ? await WorkerLocationSessionModel.find({ worker: { $in: workerIds } }).lean()
      : [];
    const sessionByWorker = new Map(
      sessions.map((session) => [objectIdString(session.worker), session])
    );

    const result = workers.map((worker) => {
      const workerId = objectIdString(worker);
      return {
        worker: serializeWorker(worker),
        tracking: serializeSession(sessionByWorker.get(workerId), at),
        shipments: shipments
          .filter((shipment) => objectIdString(shipment.assignedWorker) === workerId)
          .map((shipment) => ({
            id: objectIdString(shipment),
            trackingNumber: shipment.trackingNumber,
            status: shipment.status,
            estimatedDelivery: shipment.estimatedDelivery || '',
            currentLocation: shipment.currentLocation || '',
          })),
      };
    });

    return res.json({
      success: true,
      generatedAt: at.toISOString(),
      count: result.length,
      workers: result,
    });
  };

  return {
    startShift,
    updateLocation,
    stopShift,
    getMyShift,
    getActiveWorkers,
    getCustomerWorkers,
  };
};

const handlers = createWorkerLocationHandlers();

export const {
  startShift,
  updateLocation,
  stopShift,
  getMyShift,
  getActiveWorkers,
  getCustomerWorkers,
} = handlers;
