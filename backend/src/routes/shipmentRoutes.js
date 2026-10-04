import express from 'express';
import {
  getShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  deleteShipment,
  updateShipmentStatus,
} from '../controllers/shipmentController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All shipment routes require authentication
router.use(protect);

// Status update (Staff/Admin/Worker)
router.put('/:id/status', authorizeRoles('ADMIN', 'STAFF', 'WORKER'), updateShipmentStatus);

// Main CRUD
router.route('/')
  .get(getShipments)
  .post(authorizeRoles('ADMIN', 'STAFF', 'CUSTOMER'), createShipment);

router.route('/:id')
  .get(getShipmentById)
  .put(authorizeRoles('ADMIN', 'STAFF', 'WORKER'), updateShipment)
  .delete(authorizeRoles('ADMIN'), deleteShipment);

export default router;
