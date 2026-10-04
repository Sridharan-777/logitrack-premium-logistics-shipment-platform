import Shipment from '../models/Shipment.js';
import mongoose from 'mongoose';
import { ROLES } from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

const referenceId = (value) => (value?._id || value)?.toString();

/**
 * GET /api/shipments
 * Role-filtered shipment listing.
 */
export const getShipments = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const filter = {};

  // Role-based filtering
  if (req.user.role === ROLES.CUSTOMER) {
    filter.$or = [
      { customer: req.user._id },
      { customerId: req.user._id.toString() },
      { senderEmail: { $regex: new RegExp(`^${req.user.email}$`, 'i') } },
      { receiverEmail: { $regex: new RegExp(`^${req.user.email}$`, 'i') } },
    ];
  } else if (req.user.role === ROLES.WORKER) {
    filter.$or = [
      { assignedWorker: req.user._id },
      { assignedWorkerId: req.user._id.toString() },
    ];
  }
  // ADMIN and STAFF see all shipments

  if (status) {
    filter.status = status;
  }

  if (search) {
    const searchFilter = {
      $or: [
        { trackingNumber: { $regex: search, $options: 'i' } },
        { receiverName: { $regex: search, $options: 'i' } },
        { senderName: { $regex: search, $options: 'i' } },
      ],
    };
    // Combine with existing filter
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, searchFilter];
      delete filter.$or;
    } else {
      Object.assign(filter, searchFilter);
    }
  }

  const shipments = await Shipment.find(filter)
    .populate('customer', 'name email')
    .populate('assignedStaff', 'name email')
    .populate('assignedWorker', 'name email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: shipments.length,
    shipments,
  });
});

/**
 * GET /api/shipments/:id
 * Get single shipment with ownership check.
 */
export const getShipmentById = asyncHandler(async (req, res) => {
  const shipment = mongoose.Types.ObjectId.isValid(req.params.id)
    ? await Shipment.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('assignedStaff', 'name email')
      .populate('assignedWorker', 'name email')
    : null;

  if (!shipment) {
    // Also try by tracking number
    const byTracking = await Shipment.findOne({ trackingNumber: req.params.id.toUpperCase() })
      .populate('customer', 'name email')
      .populate('assignedStaff', 'name email')
      .populate('assignedWorker', 'name email');

    if (!byTracking) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found.',
      });
    }

    // Ownership check
    if (req.user.role === ROLES.CUSTOMER) {
      const isOwner =
        referenceId(byTracking.customer) === req.user._id.toString() ||
        byTracking.customerId === req.user._id.toString() ||
        byTracking.senderEmail?.toLowerCase() === req.user.email.toLowerCase() ||
        byTracking.receiverEmail?.toLowerCase() === req.user.email.toLowerCase();
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'You can only view your own shipments.',
        });
      }
    }

    if (req.user.role === ROLES.WORKER) {
      const isAssigned =
        referenceId(byTracking.assignedWorker) === req.user._id.toString() ||
        byTracking.assignedWorkerId === req.user._id.toString();
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'You can only view your assigned shipments.',
        });
      }
    }

    return res.json({ success: true, shipment: byTracking });
  }

  // Ownership check for direct ID lookup
  if (req.user.role === ROLES.CUSTOMER) {
    const isOwner =
      referenceId(shipment.customer) === req.user._id.toString() ||
      shipment.customerId === req.user._id.toString() ||
      shipment.senderEmail?.toLowerCase() === req.user.email.toLowerCase() ||
      shipment.receiverEmail?.toLowerCase() === req.user.email.toLowerCase();
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own shipments.',
      });
    }
  }

  if (req.user.role === ROLES.WORKER) {
    const isAssigned =
      referenceId(shipment.assignedWorker) === req.user._id.toString() ||
      shipment.assignedWorkerId === req.user._id.toString();
    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your assigned shipments.',
      });
    }
  }

  res.json({ success: true, shipment });
});

/**
 * POST /api/shipments
 * Create a new shipment.
 */
export const createShipment = asyncHandler(async (req, res) => {
  const shipmentData = { ...req.body };

  // Generate tracking number if not provided
  if (!shipmentData.trackingNumber) {
    const prefix = 'TRK';
    const random = Math.floor(100000 + Math.random() * 900000);
    const suffix = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    shipmentData.trackingNumber = `${prefix}-${random}-${suffix}`;
  }

  // Set customer reference
  if (req.user.role === ROLES.CUSTOMER) {
    shipmentData.customer = req.user._id;
    shipmentData.customerId = req.user._id.toString();
  }

  // Set booking date
  if (!shipmentData.bookingDate) {
    shipmentData.bookingDate = new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  }

  // Initial timeline entry
  if (!shipmentData.timeline || shipmentData.timeline.length === 0) {
    shipmentData.timeline = [
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Booked',
        location: shipmentData.senderCity || 'Origin',
        description: `Shipment ${shipmentData.trackingNumber} booked by ${req.user.name}.`,
      },
    ];
  }

  const shipment = await Shipment.create(shipmentData);

  res.status(201).json({
    success: true,
    shipment,
  });
});

/**
 * PUT /api/shipments/:id
 * Update shipment. Admin/Staff can update any field. Worker can update status of assigned shipments.
 */
export const updateShipment = asyncHandler(async (req, res) => {
  let shipment = mongoose.Types.ObjectId.isValid(req.params.id) ? await Shipment.findById(req.params.id) : null;

  if (!shipment) {
    shipment = await Shipment.findOne({ trackingNumber: req.params.id.toUpperCase() });
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found.',
      });
    }
  }

  // Workers can only update their assigned shipments and only specific fields
  if (req.user.role === ROLES.WORKER) {
    const isAssigned =
      shipment.assignedWorker?.toString() === req.user._id.toString() ||
      shipment.assignedWorkerId === req.user._id.toString();
    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your assigned shipments.',
      });
    }
    // Workers can only update status, timeline, proof of delivery
    const allowedFields = ['status', 'timeline', 'proofOfDelivery', 'receivedByCustomer', 'escalationStatus', 'currentLocation'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    Object.assign(shipment, updates);
  } else if (req.user.role === ROLES.CUSTOMER) {
    return res.status(403).json({
      success: false,
      message: 'Customers cannot modify shipments directly.',
    });
  } else {
    // Admin and Staff can update all fields
    Object.assign(shipment, req.body);
  }

  await shipment.save();

  res.json({
    success: true,
    shipment,
  });
});

/**
 * DELETE /api/shipments/:id
 * Soft cancel shipment.
 */
export const deleteShipment = asyncHandler(async (req, res) => {
  let shipment = mongoose.Types.ObjectId.isValid(req.params.id) ? await Shipment.findById(req.params.id) : null;

  if (!shipment) {
    shipment = await Shipment.findOne({ trackingNumber: req.params.id.toUpperCase() });
  }

  if (!shipment) {
    return res.status(404).json({
      success: false,
      message: 'Shipment not found.',
    });
  }

  // Only Admin can delete. Change status to Cancelled rather than hard delete.
  shipment.status = 'Cancelled';
  shipment.timeline.unshift({
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Cancelled',
    location: 'System',
    description: `Shipment cancelled by ${req.user.name} (${req.user.role}).`,
  });
  await shipment.save();

  res.json({
    success: true,
    message: `Shipment ${shipment.trackingNumber} has been cancelled.`,
  });
});

/**
 * PUT /api/shipments/:id/status
 * Update shipment status (Staff/Admin).
 */
export const updateShipmentStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  let shipment = mongoose.Types.ObjectId.isValid(req.params.id) ? await Shipment.findById(req.params.id) : null;
  if (!shipment) {
    shipment = await Shipment.findOne({ trackingNumber: req.params.id.toUpperCase() });
  }

  if (!shipment) {
    return res.status(404).json({ success: false, message: 'Shipment not found.' });
  }

  if (req.user.role === ROLES.WORKER) {
    const isAssigned =
      referenceId(shipment.assignedWorker) === req.user._id.toString() ||
      shipment.assignedWorkerId === req.user._id.toString();
    if (!isAssigned) {
      return res.status(403).json({ success: false, message: 'You can only update your assigned shipments.' });
    }
  }

  shipment.status = status;
  if (status === 'Delivered') {
    shipment.receivedByCustomer = true;
    shipment.escalationStatus = 'Resolved';
  }

  shipment.timeline.unshift({
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status,
    location: shipment.currentLocation || 'En Route',
    description: note || `Status updated to '${status}' by ${req.user.name}.`,
  });

  await shipment.save();

  res.json({ success: true, shipment });
});
