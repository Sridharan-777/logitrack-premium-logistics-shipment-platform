import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createTrackingApp } from '../server/tracking.js';

test('GPS authorization, persistence, validation, stop, expiry and revocation', async () => {
  const dataDir = mkdtempSync(path.join(tmpdir(), 'logitrack-test-'));
  const operatorKey = 'test-key-'.repeat(8);
  let time = Date.now();
  const app = createTrackingApp({ operatorKey, dataDir, now: () => time });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/tracking/vehicles`;
  const request = (url='', key='', method='GET', body) => fetch(base + url, { method, headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  try {
    assert.equal((await request()).status, 401);
    const registered = await request('', operatorKey, 'POST', { plate: 'TN-72 LT 2024', label: 'Delivery scooter' });
    assert.equal(registered.status, 201);
    const {driverToken, viewerToken, plate} = await registered.json();
    assert.equal(plate, 'TN72LT2024');
    const location = { latitude: 9.17, longitude: 77.87, accuracy: 12, timestamp: time };
    assert.equal((await request('/'+plate+'/location', viewerToken, 'POST', location)).status, 401);
    assert.equal((await request('/'+plate+'/location', driverToken, 'POST', {...location, latitude: 200})).status, 400);
    assert.equal((await request('/'+plate+'/location', driverToken, 'POST', location)).status, 200);
    assert.equal((await request('/'+plate+'/location', driverToken, 'POST', location)).status, 409);
    const live = await (await request('/'+plate, viewerToken)).json();
    assert.equal(live.stale, false); assert.equal(live.location.latitude, 9.17); assert.equal(live.driverHash, undefined);
    time += 31000;
    assert.equal((await (await request('/'+plate, viewerToken)).json()).stale, true);
    assert.equal((await request('/'+plate+'/stop', driverToken, 'POST')).status, 204);
    assert.equal((await (await request('/'+plate, viewerToken)).json()).location, null);
    createTrackingApp({ operatorKey, dataDir }); // Data can be reopened after a restart.
    time += 86400000;
    assert.equal((await request('/'+plate, viewerToken)).status, 401);
    await request('/'+plate, operatorKey, 'DELETE');
    assert.deepEqual(await (await request('', operatorKey)).json(), []);
  } finally {
    await new Promise(resolve => server.close(resolve));
    rmSync(dataDir, {recursive:true, force:true});
  }
});
