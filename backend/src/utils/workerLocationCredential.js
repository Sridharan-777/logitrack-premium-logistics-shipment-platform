import { createHash, randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';

export const WORKER_LOCATION_TOKEN_PURPOSE = 'worker_location';
export const WORKER_LOCATION_TOKEN_ISSUER = 'logitrack-api';
export const WORKER_LOCATION_TOKEN_AUDIENCE = 'logitrack-worker-location';
export const WORKER_LOCATION_SCOPES = Object.freeze([
  'location:update',
  'location:stop',
]);

const credentialSecret = () => {
  const secret = process.env.WORKER_LOCATION_TOKEN_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('WORKER_LOCATION_TOKEN_SECRET or JWT_SECRET must be configured.');
  }
  return secret;
};

export const hashWorkerLocationCredentialId = (jti) =>
  createHash('sha256').update(String(jti), 'utf8').digest('hex');

export const issueWorkerLocationCredential = ({
  workerId,
  sessionId,
  expiresAt,
  scopes = WORKER_LOCATION_SCOPES,
  now = new Date(),
} = {}) => {
  const expiry = new Date(expiresAt);
  const issuedAtSeconds = Math.floor(new Date(now).getTime() / 1000);
  const expiresAtSeconds = Math.floor(expiry.getTime() / 1000);

  if (!workerId || !sessionId) {
    throw new Error('Worker and location session identifiers are required.');
  }
  if (!Number.isFinite(expiresAtSeconds) || expiresAtSeconds <= issuedAtSeconds) {
    throw new Error('Worker location credential expiry must be in the future.');
  }

  const jti = randomUUID();
  const token = jwt.sign(
    {
      purpose: WORKER_LOCATION_TOKEN_PURPOSE,
      sid: String(sessionId),
      scopes: [...scopes],
      iat: issuedAtSeconds,
      exp: expiresAtSeconds,
    },
    credentialSecret(),
    {
      algorithm: 'HS256',
      issuer: WORKER_LOCATION_TOKEN_ISSUER,
      audience: WORKER_LOCATION_TOKEN_AUDIENCE,
      subject: String(workerId),
      jwtid: jti,
    }
  );

  return {
    token,
    jtiHash: hashWorkerLocationCredentialId(jti),
    expiresAt: expiry,
  };
};

export const verifyWorkerLocationCredential = (token) =>
  jwt.verify(token, credentialSecret(), {
    algorithms: ['HS256'],
    issuer: WORKER_LOCATION_TOKEN_ISSUER,
    audience: WORKER_LOCATION_TOKEN_AUDIENCE,
  });
