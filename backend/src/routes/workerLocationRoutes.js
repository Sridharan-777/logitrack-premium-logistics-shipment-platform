import express from 'express';
import {
  getActiveWorkers,
  getCustomerWorkers,
  getMyShift,
  startShift,
  stopShift,
  updateLocation,
} from '../controllers/workerLocationController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

router.use(protect);

router.post('/shift/start', authorizeRoles('WORKER'), asyncHandler(startShift));
router.post('/shift/location', authorizeRoles('WORKER'), asyncHandler(updateLocation));
router.post('/shift/stop', authorizeRoles('WORKER'), asyncHandler(stopShift));
router.get('/shift/me', authorizeRoles('WORKER'), asyncHandler(getMyShift));

router.get('/active', authorizeRoles('ADMIN', 'STAFF'), asyncHandler(getActiveWorkers));
router.get('/customer', authorizeRoles('CUSTOMER'), asyncHandler(getCustomerWorkers));

export default router;
