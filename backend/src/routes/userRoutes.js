import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersByRole,
  updateProfile,
} from '../controllers/userController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All user routes require authentication
router.use(protect);

// Profile update (any authenticated user, own profile)
router.put('/:id/profile', updateProfile);

// Get users by role
router.get('/role/:role', authorizeRoles('ADMIN', 'STAFF'), getUsersByRole);

// Full CRUD (Admin + Staff with restrictions enforced in controller)
router.route('/')
  .get(authorizeRoles('ADMIN', 'STAFF'), getUsers)
  .post(authorizeRoles('ADMIN', 'STAFF'), createUser);

router.route('/:id')
  .get(getUserById)
  .put(authorizeRoles('ADMIN', 'STAFF', 'WORKER', 'CUSTOMER'), updateUser)
  .delete(authorizeRoles('ADMIN', 'STAFF'), deleteUser);

export default router;
