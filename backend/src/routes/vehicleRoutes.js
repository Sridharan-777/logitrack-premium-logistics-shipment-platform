import express from 'express';
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getFuelLogs,
  addFuelLog,
} from '../controllers/vehicleController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Fuel logs
router.route('/fuellogs')
  .get(authorizeRoles('ADMIN', 'STAFF'), getFuelLogs)
  .post(authorizeRoles('ADMIN', 'STAFF', 'WORKER'), addFuelLog);

// Vehicle CRUD
router.route('/')
  .get(authorizeRoles('ADMIN', 'STAFF'), getVehicles)
  .post(authorizeRoles('ADMIN'), createVehicle);

router.route('/:id')
  .get(authorizeRoles('ADMIN', 'STAFF'), getVehicleById)
  .put(authorizeRoles('ADMIN'), updateVehicle)
  .delete(authorizeRoles('ADMIN'), deleteVehicle);

export default router;
