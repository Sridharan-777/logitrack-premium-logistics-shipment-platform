import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { createTrackingApp } from './tracking.js';

const app = createTrackingApp({ operatorKey: process.env.TRACKING_OPERATOR_KEY, dataDir: path.resolve(process.env.TRACKING_DATA_DIR || 'data') });
app.use(express.static('dist', { setHeaders: res => res.setHeader('Cache-Control', 'no-cache') }));
app.get('*', (req, res) => res.sendFile(path.resolve('dist/index.html')));
app.listen(Number(process.env.PORT || 3001), '0.0.0.0', () => console.log('LogiTrack server listening. Use HTTPS when connecting a driver phone.'));
