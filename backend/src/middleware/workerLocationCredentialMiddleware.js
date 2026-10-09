import WorkerLocationSession from '../models/WorkerLocationSession.js';
import User, { ROLES } from '../models/User.js';
import {
  hashWorkerLocationCredentialId,
  verifyWorkerLocationCredential,
  WORKER_LOCATION_TOKEN_PURPOSE,
} from '../utils/workerLocationCredential.js';

const bearerToken = (req) => {
  const authorization = req.headers?.authorization;
  if (typeof authorization !== 'string') return null;
  const match = authorization.match(/^Bearer\s+(\S+)$/i);
  return match?.[1] || null;
};

const revokeSession = async (session, at) => {
  session.active = false;
  session.endedAt = at;
  session.lastLocation = null;
  session.deviceCredentialHash = null;
  session.deviceCredentialIssuedAt = null;
  await session.save();
};

export const createWorkerLocationCredentialMiddleware = ({
  WorkerLocationSessionModel = WorkerLocationSession,
  UserModel = User,
  verifyCredential = verifyWorkerLocationCredential,
  hashCredentialId = hashWorkerLocationCredentialId,
  now = () => new Date(),
} = {}) => {
  return (requiredScope) => async (req, res, next) => {
    const token = bearerToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'A worker location device credential is required.',
      });
    }

    let claims;
    try {
      claims = verifyCredential(token);
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Worker location device credential is invalid or expired.',
      });
    }

    if (
      claims?.purpose !== WORKER_LOCATION_TOKEN_PURPOSE ||
      typeof claims.sub !== 'string' ||
      typeof claims.sid !== 'string' ||
      typeof claims.jti !== 'string' ||
      !Array.isArray(claims.scopes)
    ) {
      return res.status(401).json({
        success: false,
        message: 'Worker location device credential has invalid claims.',
      });
    }

    if (!claims.scopes.includes(requiredScope)) {
      return res.status(403).json({
        success: false,
        message: 'Worker location device credential does not allow this action.',
      });
    }

    const sessionQuery = WorkerLocationSessionModel.findOne({
      _id: claims.sid,
      worker: claims.sub,
    });
    const session = typeof sessionQuery?.select === 'function'
      ? await sessionQuery.select('+deviceCredentialHash')
      : await sessionQuery;

    if (!session || !session.deviceCredentialHash) {
      return res.status(401).json({
        success: false,
        message: 'Worker location device credential has been revoked.',
      });
    }

    const at = new Date(now());
    if (!session.active || new Date(session.expiresAt).getTime() <= at.getTime()) {
      if (session.active || session.lastLocation || session.deviceCredentialHash) {
        await revokeSession(session, at);
      }
      return res.status(401).json({
        success: false,
        message: 'Worker location shift is stopped or expired.',
      });
    }

    if (hashCredentialId(claims.jti) !== session.deviceCredentialHash) {
      return res.status(401).json({
        success: false,
        message: 'Worker location device credential has been replaced.',
      });
    }

    if (
      !session.deviceId ||
      typeof req.body?.deviceId !== 'string' ||
      req.body.deviceId !== session.deviceId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Worker location device does not match the active shift.',
      });
    }

    const worker = await UserModel.findOne({
      _id: claims.sub,
      role: ROLES.WORKER,
      active: true,
    });
    if (!worker) {
      await revokeSession(session, at);
      return res.status(401).json({
        success: false,
        message: 'Worker account is no longer active.',
      });
    }

    req.user = worker;
    req.workerLocationSession = session;
    req.workerLocationCredential = claims;
    return next();
  };
};

export const protectWorkerLocationCredential =
  createWorkerLocationCredentialMiddleware();
