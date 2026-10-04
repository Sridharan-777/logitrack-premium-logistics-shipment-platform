# LogiTrack 3D

Full-stack logistics platform with React/Vite, Express, MongoDB, JWT role authorization, shipment operations, multimodal route estimates, and protected live phone GPS.

## Local development

Prerequisites: Node.js, npm, MongoDB Community Server, and optionally MongoDB Compass.

Backend:

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run seed
npm run dev
```

Frontend:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open `http://localhost:3000`. The API and health check are at `http://localhost:3001/api` and `http://localhost:3001/api/health`.

MongoDB Compass connects to `mongodb://127.0.0.1:27017`; expand the `logitrack` database after seeding.

## Required environment variables

`backend/.env`:

```env
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/logitrack
JWT_SECRET=replace-with-a-long-random-production-secret
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
TRACKING_OPERATOR_KEY=replace-with-at-least-32-random-characters
TRACKING_DATA_DIR=data
```

`frontend/.env`:

```env
VITE_API_URL=http://localhost:3001/api
VITE_GOOGLE_CLIENT_ID=
```

Google Sign-In stays hidden when its client ID is blank.

## Authorization

- Admin: manages staff, workers, customers, shipments, fleet and operations.
- Staff: manages workers and customers and performs shipment operations.
- Worker: sees assigned deliveries and updates only assigned shipment work.
- Customer: creates and sees only their own shipments.

The backend enforces these rules. The UI contains no role-switching shortcut.

## Maps

Shipment Route Simulation is an estimate. It changes vehicle types by leg and calculates ETA from road, air and sea distances and speeds. It is never presented as GPS.

Phone GPS Tracking uses browser geolocation from an authorized driver link. Viewer data refreshes every five seconds, includes accuracy and timestamps, and becomes stale after 30 seconds. Phone geolocation requires HTTPS outside localhost.

## Production build

```powershell
cd frontend
npm run lint
npm run build

cd ..\backend
npm test
npm start
```

The Express server serves `frontend/dist` in production. Use a public HTTPS domain, a hosted MongoDB connection, a strong JWT secret, and a private tracking operator key.

## Mobile and Play Store

The frontend includes a web app manifest, service worker, theme metadata and a maskable app icon, so it is installable as a PWA.

Google Play does not accept a website directory directly. Publishing requires all of the following:

1. Deploy the frontend/backend to a public HTTPS domain.
2. Point `VITE_API_URL` and `FRONTEND_URL` at that domain and rebuild.
3. Install Android Studio/Android SDK.
4. Wrap the deployed PWA using a Trusted Web Activity or Capacitor.
5. Generate a signed Android App Bundle (`.aab`).
6. Create the Play Console app, complete privacy/data-safety declarations, upload screenshots and the `.aab`, and submit for review.

Play review is controlled by Google and cannot be guaranteed for a same-day deadline. Do not ship the seeded passwords or development database in production.
