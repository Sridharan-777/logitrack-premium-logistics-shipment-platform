import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';

import connectDB from './src/config/db.js';
import errorMiddleware from './src/middleware/errorMiddleware.js';

// Route imports
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import shipmentRoutes from './src/routes/shipmentRoutes.js';
import vehicleRoutes from './src/routes/vehicleRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';

// Preserved GPS tracking service
import { createTrackingApp } from './src/services/trackingService.js';
import { createMongoTrackingApp } from './src/services/mongoTrackingService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Allow Leaflet tiles and external resources
}));

// CORS — allow only explicitly configured browser/native app origins.
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging (development)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Security headers for all responses
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  });
  next();
});

// ——— Health Check ———
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
  res.json({
    success: true,
    server: 'running',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Vercel runs Express as a serverless function, so connect lazily and reuse
// Mongoose's cached connection between warm invocations.
app.use('/api', async (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(503).json({ success: false, message: 'Database connection is unavailable.' });
  }
});

// ——— API Routes ———
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/vehicles', vehicleRoutes);

// ——— GPS Tracking (preserved from original system) ———
if (process.env.TRACKING_OPERATOR_KEY && process.env.TRACKING_OPERATOR_KEY.length >= 32) {
  const trackingRouter = process.env.VERCEL
    ? createMongoTrackingApp({ operatorKey: process.env.TRACKING_OPERATOR_KEY })
    : createTrackingApp({ operatorKey: process.env.TRACKING_OPERATOR_KEY, dataDir: path.resolve(process.env.TRACKING_DATA_DIR || path.join(__dirname, 'data')) });
  app.use('/api/tracking', trackingRouter);
  console.log('GPS tracking service enabled');
} else {
  console.log('GPS tracking service disabled (TRACKING_OPERATOR_KEY not set or too short)');
}

// Keep the generic notification/ticket router after capability-token GPS routes.
// Its router-level JWT middleware would otherwise consume /api/tracking requests.
app.use('/api', notificationRoutes);

// ——— Serve frontend in production ———
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(distPath, { setHeaders: res => res.setHeader('Cache-Control', 'no-cache') }));
app.get('*', (req, res, next) => {
  // Don't catch API routes
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'), err => {
    if (err) {
      // In dev mode, frontend is served by Vite
      res.status(200).json({ message: 'LogiTrack API is running. Frontend is served by Vite dev server in development.' });
    }
  });
});

// ——— 404 for unmatched API routes ———
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found.' });
});

// ——— Error Handler ———
app.use(errorMiddleware);

// ——— Start Server ———
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LogiTrack API running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

if (!process.env.VERCEL) {
  startServer().catch(err => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
}

export default app;
