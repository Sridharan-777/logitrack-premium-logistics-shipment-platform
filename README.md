# LogiTrack

React logistics workspace with customer, supervisor, courier, and admin demos, plus a separate authenticated service for real driver-phone GPS locations.

## Run locally

Requires Node.js 22 or newer. Run:

    npm install
    npm run setup
    npm run build
    npm start

Open http://localhost:3001. Setup generates a private .env containing TRACKING_OPERATOR_KEY. Copy that key into the Phone GPS Tracking operator form. It is never included in the frontend bundle. Keep .env private and out of Git.

For development, run npm run server in one terminal and npm run dev in another. Vite proxies /api to port 3001.

## Live phone GPS

1. Open Phone GPS Tracking and connect using the operator key.
2. Register the vehicle plate and name. Spaces and hyphens do not affect searching.
3. Send the driver link privately to the assigned driver. Send the separate read-only viewing link only to people authorized to see that vehicle.
4. On the phone, open the link and press Start sharing location. Allow location access. Keep the page open; mobile browsers may pause updates when backgrounded or locked. This is foreground web tracking, not an always-on native tracker.
5. Search the registered plate from the operator page or open its viewing link. The map displays actual coordinates and accuracy, polls every five seconds, and marks signals older than 30 seconds as stale. It never invents a position.
6. Press Stop sharing to clear the watcher and remove the server location. If the phone goes offline without stopping, the last known position is retained and marked stale.

Phone connections require HTTPS. Localhost works for development on that same device; a plain HTTP LAN address does not provide a secure phone geolocation context. Deploy the Node server behind HTTPS and open that deployed URL on both devices. The app cannot find a vehicle from its plate alone: the plate must be registered and paired with a sharing phone.

Links expire after 24 hours. Registering the same plate again replaces both links and revokes old ones. Operators can revoke and remove a vehicle. Driver and viewer tokens are separate; only token hashes are stored. The server retains only the latest coordinate, not travel history. Browser coordinates are device reports, not tamper-proof vehicle telemetry.

## Deployment

Use a Node hosting service or VM with TLS termination, a private TRACKING_OPERATOR_KEY environment variable, and persistent storage mounted at TRACKING_DATA_DIR. Run npm ci, npm run build, then npm start. Forward traffic to PORT (default 3001). Static hosting such as GitHub Pages cannot receive or store GPS updates.

This implementation uses one Node process with atomic JSON writes. Do not run multiple replicas against the same file. For a larger fleet, replace this with a database and individual operator accounts. Back up the private data directory and restrict host access. Rotating the operator key does not revoke vehicle links; revoke those separately when necessary.

## Workspace status

The logistics workspace remains a demo. Role selection is not production authentication. Shipments, staffing, fuel logs, tickets, and notifications persist in this browser's local storage, not across devices. Do not enter real credentials, payment cards, or customer information into demo forms. GPS uses its own protected backend and requires an operator key or vehicle-specific capability link independently of demo roles.

Bookings do not collect payments; customs clearance is simulated. The animated route map is labeled as a simulation and is separate from phone GPS. Financial and payroll views are planning calculations, not accounting records. The assistant is a rule-based helper and needs no Gemini key. New users receive a role-specific guide that can be reopened.

## Verification

    npm test
    npm run lint
    npm run build

Tests cover GPS authorization, validation, stale positions, persistence, stopping, expiry and revocation; shipment detail rendering; and repaired callback contracts. Lint retains the existing TypeScript configuration and is not a complete JavaScript lint pass.

Before deployment, verify phone permission granted/denied flows, two-device updates, background/locked-phone stale behavior, stop/revocation, and all themes at mobile and desktop widths. Automated checks do not replace physical phone acceptance testing.
