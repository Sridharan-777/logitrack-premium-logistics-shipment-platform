import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SHIFT_DURATION_MS,
  createWorkerLocationHandlers,
  getSessionStatus,
  serializeSession,
  validateLocationPayload,
} from '../src/controllers/workerLocationController.js';

const createResponse = () => ({
  statusCode: 200,
  body: null,
  headers: {},
  status(code) {
    this.statusCode = code;
    return this;
  },
  set(name, value) {
    this.headers[name] = value;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

const attachSave = (session) => {
  session.save = async () => session;
  return session;
};

const createSessionModel = () => {
  let session = null;
  return {
    get current() {
      return session;
    },
    async updateMany(filter, update) {
      if (
        session?.active &&
        session.expiresAt <= filter.expiresAt.$lte
      ) {
        Object.assign(session, update.$set);
      }
      return { modifiedCount: 0 };
    },
    async findOne() {
      return session;
    },
    async findOneAndUpdate(filter, update) {
      session = attachSave({
        _id: 'session-1',
        worker: filter.worker,
        ...update.$set,
      });
      return session;
    },
  };
};

test('location payload validation accepts epoch/ISO timestamps and rejects unsafe fixes', () => {
  const now = new Date('2026-10-06T10:00:00.000Z');
  const base = { latitude: 9.9252, longitude: 78.1198, accuracy: 12 };

  const epoch = validateLocationPayload({ ...base, timestamp: now.getTime() }, now);
  assert.equal(epoch.error, undefined);
  assert.equal(epoch.value.deviceTimestamp.toISOString(), now.toISOString());

  const iso = validateLocationPayload({ ...base, timestamp: now.toISOString() }, now);
  assert.equal(iso.error, undefined);

  assert.match(
    validateLocationPayload({ ...base, latitude: 91, timestamp: now.getTime() }, now).error,
    /latitude/
  );
  assert.match(
    validateLocationPayload({ ...base, accuracy: -1, timestamp: now.getTime() }, now).error,
    /accuracy/
  );
  assert.match(
    validateLocationPayload(
      { ...base, timestamp: now.getTime() - 121_000 },
      now
    ).error,
    /too old/
  );
});

test('session status marks stale fixes and never exposes off-duty coordinates', () => {
  const now = new Date('2026-10-06T10:00:00.000Z');
  const session = {
    _id: 'session-1',
    active: true,
    startedAt: new Date(now.getTime() - 60_000),
    expiresAt: new Date(now.getTime() + 60_000),
    endedAt: null,
    lastLocation: {
      latitude: 9.9252,
      longitude: 78.1198,
      accuracy: 10,
      deviceTimestamp: new Date(now.getTime() - 31_000),
      receivedAt: new Date(now.getTime() - 31_000),
    },
  };

  assert.equal(getSessionStatus(session, now), 'STALE');
  assert.equal(serializeSession(session, now).lastLocation.latitude, 9.9252);

  session.active = false;
  session.endedAt = now;
  assert.equal(getSessionStatus(session, now), 'STOPPED');
  assert.equal(serializeSession(session, now).lastLocation, null);

  session.active = true;
  session.expiresAt = new Date(now.getTime() - 1);
  assert.equal(getSessionStatus(session, now), 'EXPIRED');
  assert.equal(serializeSession(session, now).lastLocation, null);
});

test('worker shift lifecycle enforces rate limits, eight-hour expiry, and coordinate clearing', async () => {
  let clock = Date.parse('2026-10-06T10:00:00.000Z');
  const SessionModel = createSessionModel();
  const handlers = createWorkerLocationHandlers({
    WorkerLocationSessionModel: SessionModel,
    now: () => new Date(clock),
  });
  const workerRequest = (body = {}) => ({ user: { _id: 'worker-1' }, body });

  let response = createResponse();
  await handlers.startShift(workerRequest({ deviceId: 'android-worker-1' }), response);
  assert.equal(response.statusCode, 201);
  assert.equal(response.body.session.status, 'WAITING');
  assert.equal(response.body.deviceCredential, undefined);
  assert.equal(
    Date.parse(response.body.session.expiresAt) - Date.parse(response.body.session.startedAt),
    SHIFT_DURATION_MS
  );

  response = createResponse();
  await handlers.updateLocation(
    workerRequest({
      latitude: 9.9252,
      longitude: 78.1198,
      accuracy: 8,
      timestamp: clock,
      deviceId: 'android-worker-1',
    }),
    response
  );
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.session.status, 'ACTIVE');
  assert.equal(response.body.session.lastLocation.latitude, 9.9252);

  clock += 1_000;
  response = createResponse();
  await handlers.updateLocation(
    workerRequest({
      latitude: 9.9253,
      longitude: 78.1199,
      accuracy: 8,
      timestamp: clock,
    }),
    response
  );
  assert.equal(response.statusCode, 429);
  assert.equal(response.body.retryAfterMs, 2_000);
  assert.equal(response.headers['Retry-After'], '2');

  response = createResponse();
  await handlers.stopShift(workerRequest(), response);
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.session.status, 'STOPPED');
  assert.equal(response.body.session.lastLocation, null);
  assert.equal(SessionModel.current.lastLocation, null);

  clock += 1_000;
  response = createResponse();
  await handlers.startShift(workerRequest(), response);
  assert.equal(response.statusCode, 201);
  clock += SHIFT_DURATION_MS + 1;

  response = createResponse();
  await handlers.updateLocation(
    workerRequest({
      latitude: 9.9252,
      longitude: 78.1198,
      accuracy: 8,
      timestamp: clock,
    }),
    response
  );
  assert.equal(response.statusCode, 410);
  assert.equal(SessionModel.current.active, false);
  assert.equal(SessionModel.current.lastLocation, null);
});

test('background shift requires a device and rotates its restricted credential', async () => {
  const clock = Date.parse('2026-10-06T10:00:00.000Z');
  const SessionModel = createSessionModel();
  let issuedCount = 0;
  const handlers = createWorkerLocationHandlers({
    WorkerLocationSessionModel: SessionModel,
    now: () => new Date(clock),
    issueDeviceCredential({ expiresAt }) {
      issuedCount += 1;
      return {
        token: `device-token-${issuedCount}`,
        jtiHash: `device-hash-${issuedCount}`,
        expiresAt,
      };
    },
  });
  const workerRequest = (body = {}) => ({ user: { _id: 'worker-1' }, body });

  let response = createResponse();
  await handlers.startShift(workerRequest({ background: true }), response);
  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /deviceId is required/);
  assert.equal(issuedCount, 0);

  response = createResponse();
  await handlers.startShift(
    workerRequest({ background: true, deviceId: 'android-installation-1' }),
    response
  );
  assert.equal(response.statusCode, 201);
  assert.equal(response.body.deviceCredential.token, 'device-token-1');
  assert.equal(SessionModel.current.deviceCredentialHash, 'device-hash-1');
  assert.equal(SessionModel.current.deviceId, 'android-installation-1');

  response = createResponse();
  await handlers.startShift(
    workerRequest({ background: true, deviceId: 'android-installation-1' }),
    response
  );
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.deviceCredential.token, 'device-token-2');
  assert.equal(SessionModel.current.deviceCredentialHash, 'device-hash-2');

  response = createResponse();
  await handlers.stopShift(workerRequest(), response);
  assert.equal(response.statusCode, 200);
  assert.equal(SessionModel.current.deviceCredentialHash, null);
  assert.equal(SessionModel.current.deviceCredentialIssuedAt, null);
});

test('customer response is scoped to active assignments and omits worker phone/device data', async () => {
  const now = new Date('2026-10-06T10:00:00.000Z');
  let shipmentFilter;

  const query = (value) => ({
    select() { return this; },
    sort() { return this; },
    async lean() { return value; },
  });

  const SessionModel = {
    async updateMany() { return { modifiedCount: 0 }; },
    find() {
      return query([{
        _id: 'session-1',
        worker: 'worker-1',
        active: true,
        startedAt: new Date(now.getTime() - 60_000),
        expiresAt: new Date(now.getTime() + 60_000),
        endedAt: null,
        deviceId: 'private-device-id',
        lastLocation: {
          latitude: 9.9252,
          longitude: 78.1198,
          accuracy: 8,
          deviceTimestamp: now,
          receivedAt: now,
        },
      }]);
    },
  };
  const ShipmentModel = {
    find(filter) {
      shipmentFilter = filter;
      return query([{
        _id: 'shipment-1',
        trackingNumber: 'TRK-100-A',
        status: 'Out for Delivery',
        estimatedDelivery: 'Today',
        currentLocation: 'Madurai',
        assignedWorker: 'worker-1',
      }]);
    },
  };
  const UserModel = {
    find() {
      return query([{
        _id: 'worker-1',
        name: 'Worker One',
        phone: 'must-not-leak',
        vehiclePlate: 'TN58AB1234',
      }]);
    },
  };
  const handlers = createWorkerLocationHandlers({
    WorkerLocationSessionModel: SessionModel,
    ShipmentModel,
    UserModel,
    now: () => now,
  });
  const response = createResponse();

  await handlers.getCustomerWorkers(
    { user: { _id: 'customer-1', email: 'customer@example.com' } },
    response
  );

  assert.equal(shipmentFilter.$or[0].customer, 'customer-1');
  assert.equal(shipmentFilter.$or[1].customerId, 'customer-1');
  assert.equal(shipmentFilter.$or[2].senderEmail.$regex.test('CUSTOMER@example.com'), true);
  assert.equal(shipmentFilter.$or[3].receiverEmail.$regex.test('customer@example.com'), true);
  assert.deepEqual(shipmentFilter.status, { $nin: ['Delivered', 'Cancelled'] });
  assert.equal(response.body.count, 1);
  assert.equal(response.body.workers[0].shipments[0].trackingNumber, 'TRK-100-A');
  assert.equal(response.body.workers[0].tracking.lastLocation.latitude, 9.9252);
  const serialized = JSON.stringify(response.body);
  assert.equal(serialized.includes('must-not-leak'), false);
  assert.equal(serialized.includes('private-device-id'), false);
});
