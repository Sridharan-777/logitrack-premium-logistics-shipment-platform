import test from 'node:test';
import assert from 'node:assert/strict';

import { createWorkerLocationCredentialMiddleware } from '../src/middleware/workerLocationCredentialMiddleware.js';
import { revokeWorkerLocationSession } from '../src/services/workerLocationLifecycle.js';
import {
  hashWorkerLocationCredentialId,
  issueWorkerLocationCredential,
  verifyWorkerLocationCredential,
  WORKER_LOCATION_SCOPES,
  WORKER_LOCATION_TOKEN_AUDIENCE,
  WORKER_LOCATION_TOKEN_ISSUER,
  WORKER_LOCATION_TOKEN_PURPOSE,
} from '../src/utils/workerLocationCredential.js';

process.env.WORKER_LOCATION_TOKEN_SECRET ||= 'test-worker-location-secret-that-is-long-enough';

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

test('issues a purpose- and session-scoped JWT with exact shift expiry', () => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
  const issued = issueWorkerLocationCredential({
    workerId: 'worker-1',
    sessionId: 'session-1',
    expiresAt,
    now,
  });
  const claims = verifyWorkerLocationCredential(issued.token);

  assert.equal(claims.purpose, WORKER_LOCATION_TOKEN_PURPOSE);
  assert.equal(claims.iss, WORKER_LOCATION_TOKEN_ISSUER);
  assert.equal(claims.aud, WORKER_LOCATION_TOKEN_AUDIENCE);
  assert.equal(claims.sub, 'worker-1');
  assert.equal(claims.sid, 'session-1');
  assert.deepEqual(claims.scopes, WORKER_LOCATION_SCOPES);
  assert.equal(claims.exp, Math.floor(expiresAt.getTime() / 1000));
  assert.equal(issued.jtiHash, hashWorkerLocationCredentialId(claims.jti));
  assert.equal(issued.jtiHash.length, 64);
});

test('rejects issuing a worker location credential after the shift expiry', () => {
  const now = new Date();
  assert.throws(
    () => issueWorkerLocationCredential({
      workerId: 'worker-1',
      sessionId: 'session-1',
      expiresAt: new Date(now.getTime() - 1),
      now,
    }),
    /expiry must be in the future/
  );
});

test('device middleware accepts the active matching credential and required scope', async () => {
  const now = new Date();
  const issued = issueWorkerLocationCredential({
    workerId: 'worker-1',
    sessionId: 'session-1',
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
    now,
  });
  const session = {
    _id: 'session-1',
    worker: 'worker-1',
    active: true,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
    deviceCredentialHash: issued.jtiHash,
    async save() { return this; },
  };
  const worker = { _id: 'worker-1', role: 'WORKER', active: true };
  const SessionModel = {
    findOne(filter) {
      assert.deepEqual(filter, { _id: 'session-1', worker: 'worker-1' });
      return { async select() { return session; } };
    },
  };
  const UserModel = {
    async findOne(filter) {
      assert.deepEqual(filter, { _id: 'worker-1', role: 'WORKER', active: true });
      return worker;
    },
  };
  const protectDevice = createWorkerLocationCredentialMiddleware({
    WorkerLocationSessionModel: SessionModel,
    UserModel,
    now: () => now,
  });
  const request = { headers: { authorization: `Bearer ${issued.token}` } };
  const response = createResponse();
  let nextCalled = false;

  await protectDevice('location:update')(request, response, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  assert.equal(request.user, worker);
  assert.equal(request.workerLocationSession, session);
  assert.equal(request.workerLocationCredential.purpose, WORKER_LOCATION_TOKEN_PURPOSE);
});

test('device middleware rejects a rotated credential and revokes an inactive worker session', async () => {
  const now = new Date();
  const claims = {
    purpose: WORKER_LOCATION_TOKEN_PURPOSE,
    sub: 'worker-1',
    sid: 'session-1',
    jti: 'old-credential',
    scopes: ['location:update'],
  };
  const session = {
    active: true,
    expiresAt: new Date(now.getTime() + 60_000),
    lastLocation: { latitude: 1, longitude: 1 },
    deviceCredentialHash: hashWorkerLocationCredentialId('new-credential'),
    saveCount: 0,
    async save() { this.saveCount += 1; return this; },
  };
  const SessionModel = {
    findOne() { return { async select() { return session; } }; },
  };
  const protectRotated = createWorkerLocationCredentialMiddleware({
    WorkerLocationSessionModel: SessionModel,
    UserModel: { async findOne() { return { _id: 'worker-1' }; } },
    verifyCredential: () => claims,
    now: () => now,
  });
  let response = createResponse();

  await protectRotated('location:update')(
    { headers: { authorization: 'Bearer replaced-token' } },
    response,
    () => assert.fail('Rotated credential must not call next.')
  );
  assert.equal(response.statusCode, 401);
  assert.match(response.body.message, /replaced/);

  session.deviceCredentialHash = hashWorkerLocationCredentialId('old-credential');
  const protectInactive = createWorkerLocationCredentialMiddleware({
    WorkerLocationSessionModel: SessionModel,
    UserModel: { async findOne() { return null; } },
    verifyCredential: () => claims,
    now: () => now,
  });
  response = createResponse();

  await protectInactive('location:update')(
    { headers: { authorization: 'Bearer inactive-worker-token' } },
    response,
    () => assert.fail('Inactive worker credential must not call next.')
  );
  assert.equal(response.statusCode, 401);
  assert.equal(session.active, false);
  assert.equal(session.lastLocation, null);
  assert.equal(session.deviceCredentialHash, null);
  assert.equal(session.saveCount, 1);
});

test('lifecycle revocation clears coordinates and the device credential hash', async () => {
  let capturedFilter;
  let capturedUpdate;
  const SessionModel = {
    async updateOne(filter, update) {
      capturedFilter = filter;
      capturedUpdate = update;
      return { modifiedCount: 1 };
    },
  };
  const endedAt = new Date();

  const changed = await revokeWorkerLocationSession('worker-1', endedAt, SessionModel);

  assert.equal(changed, true);
  assert.deepEqual(capturedFilter, { worker: 'worker-1', active: true });
  assert.equal(capturedUpdate.$set.active, false);
  assert.equal(capturedUpdate.$set.endedAt, endedAt);
  assert.equal(capturedUpdate.$set.lastLocation, null);
  assert.equal(capturedUpdate.$set.deviceCredentialHash, null);
  assert.equal(capturedUpdate.$set.deviceCredentialIssuedAt, null);
});
