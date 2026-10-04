import express from 'express';
import Notification from '../models/Notification.js';
import Ticket from '../models/Ticket.js';
import { ROLES } from '../models/User.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();
router.use(protect);

// ——— Notifications ———

router.get('/notifications', asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === ROLES.CUSTOMER || req.user.role === ROLES.WORKER) {
    filter.user = req.user._id;
  }
  const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, notifications });
}));

router.put('/notifications/:id/read', asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });
  if ([ROLES.CUSTOMER, ROLES.WORKER].includes(req.user.role) && notification.user?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'You can only update your own notifications.' });
  }
  notification.read = !notification.read;
  await notification.save();
  res.json({ success: true, notification });
}));

router.put('/notifications/read-all', asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === ROLES.CUSTOMER || req.user.role === ROLES.WORKER) {
    filter.user = req.user._id;
  }
  await Notification.updateMany(filter, { read: true });
  res.json({ success: true, message: 'All notifications marked as read.' });
}));

router.delete('/notifications', authorizeRoles('ADMIN', 'STAFF'), asyncHandler(async (req, res) => {
  await Notification.deleteMany({});
  res.json({ success: true, message: 'All notifications cleared.' });
}));

// ——— Support Tickets ———

router.get('/tickets', asyncHandler(async (req, res) => {
  const filter = {};
  if ([ROLES.CUSTOMER, ROLES.WORKER].includes(req.user.role)) {
    filter.user = req.user._id;
  }
  const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, tickets });
}));

router.post('/tickets', asyncHandler(async (req, res) => {
  const ticketData = {
    ...req.body,
    user: req.user._id,
    ticketId: req.body.ticketId || `TCK-${Date.now().toString().slice(-6)}`,
    date: req.body.date || new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
  };
  const ticket = await Ticket.create(ticketData);
  res.status(201).json({ success: true, ticket });
}));

router.put('/tickets/:id', authorizeRoles('ADMIN', 'STAFF'), asyncHandler(async (req, res) => {
  const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });
  res.json({ success: true, ticket });
}));

export default router;
