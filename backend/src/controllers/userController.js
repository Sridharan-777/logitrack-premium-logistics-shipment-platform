import User, { ROLES } from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import bcrypt from 'bcrypt';

const MIN_PASSWORD_LENGTH = 8;
const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const BLOCKED_CREATE_FIELDS = new Set([
  '_id',
  '__v',
  'active',
  'createdAt',
  'updatedAt',
  'googleId',
  'passwordHash',
]);

/**
 * GET /api/users
 * Admin: get all users. Staff: get customers only.
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { role, search, active } = req.query;
  const filter = {};

  // Staff can only see customers
  if (req.user.role === ROLES.STAFF) {
    filter.role = ROLES.CUSTOMER;
  } else if (role) {
    filter.role = role.toUpperCase();
  }

  if (active !== undefined) {
    filter.active = active === 'true';
  }

  if (search) {
    const safeSearch = escapeRegExp(String(search).slice(0, 100));
    filter.$or = [
      { name: { $regex: safeSearch, $options: 'i' } },
      { email: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  const users = await User.find(filter).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: users.length,
    users,
  });
});

/**
 * GET /api/users/:id
 * Get single user by ID with ownership/role check.
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found.',
    });
  }

  // Staff can only view customers
  if (req.user.role === ROLES.STAFF && ![ROLES.CUSTOMER, ROLES.WORKER].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Staff can only view customer and worker accounts.',
    });
  }

  // Workers and Customers can only view their own profile
  if (
    (req.user.role === ROLES.WORKER || req.user.role === ROLES.CUSTOMER) &&
    req.user._id.toString() !== user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: 'You can only view your own profile.',
    });
  }

  res.json({ success: true, user });
});

/**
 * POST /api/users
 * Create a new user. Admin can create any role. Staff can create CUSTOMER only.
 */
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, company, location, jobTitle, ...otherFields } =
    req.body;

  if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Name and email are required.',
    });
  }

  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `A temporary password of at least ${MIN_PASSWORD_LENGTH} characters is required.`,
    });
  }

  const targetRole = (role || 'CUSTOMER').toUpperCase();

  if (!Object.values(ROLES).includes(targetRole)) {
    return res.status(400).json({ success: false, message: 'Invalid account role.' });
  }

  // Permission checks
  if (req.user.role === ROLES.STAFF) {
    if (![ROLES.CUSTOMER, ROLES.WORKER].includes(targetRole)) {
      return res.status(403).json({
        success: false,
        message: 'Staff can only create customer and worker accounts.',
      });
    }
  } else if (req.user.role === ROLES.ADMIN) {
    // Admin cannot create another ADMIN through this route
    if (targetRole === ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts must be created through the seed process or direct database access.',
      });
    }
  }

  // Check for existing email
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'An account with this email already exists.',
    });
  }

  const safeOtherFields = Object.fromEntries(
    Object.entries(otherFields).filter(([key]) => !BLOCKED_CREATE_FIELDS.has(key))
  );
  const userData = {
    name,
    email: email.toLowerCase(),
    role: targetRole,
    phone: phone || '',
    company: company || '',
    location: location || '',
    jobTitle: jobTitle || '',
    memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    ...safeOtherFields,
    passwordHash: password,
  };

  const user = await User.create(userData);

  res.status(201).json({
    success: true,
    user,
  });
});

/**
 * PUT /api/users/:id
 * Update user. Admin can update staff/worker/customer. Staff can update customers.
 * Workers/Customers can update their own profile (limited fields).
 */
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found.',
    });
  }

  // Permission checks
  if (req.user.role === ROLES.STAFF) {
    if (![ROLES.CUSTOMER, ROLES.WORKER].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Staff can only update customer and worker accounts.',
      });
    }
  } else if (req.user.role === ROLES.WORKER) {
    if (req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Workers can only update their own profile.',
      });
    }
    const selfFields = ['name', 'phone', 'company', 'location', 'addresses', 'profileImage', 'transportMode', 'vehicleType'];
    req.body = Object.fromEntries(Object.entries(req.body).filter(([key]) => selfFields.includes(key)));
  } else if (req.user.role === ROLES.CUSTOMER) {
    if (req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Customers can only update their own profile.',
      });
    }
    const selfFields = ['name', 'phone', 'company', 'location', 'addresses', 'profileImage'];
    req.body = Object.fromEntries(Object.entries(req.body).filter(([key]) => selfFields.includes(key)));
  }

  // Never allow role escalation from request body
  if (req.body.role) {
    if (req.user.role !== ROLES.ADMIN) {
      delete req.body.role; // Non-admins cannot change roles
    } else if (req.body.role.toUpperCase() === ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Cannot escalate to ADMIN role.',
      });
    }
  }

  // Password resets through user management are restricted to administrators.
  const requestedPassword = req.body.password;
  delete req.body.password;
  delete req.body.passwordHash;
  if (requestedPassword) {
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can reset another user password.',
      });
    }
    if (typeof requestedPassword !== 'string' || requestedPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      });
    } else {
      req.body.passwordHash = await bcrypt.hash(requestedPassword, 12);
    }
  }

  // Prevent sensitive field manipulation
  delete req.body.googleId;
  delete req.body._id;
  delete req.body.__v;
  delete req.body.createdAt;
  delete req.body.updatedAt;

  const allowedUpdates = { ...req.body };

  const updatedUser = await User.findByIdAndUpdate(req.params.id, allowedUpdates, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    user: updatedUser,
  });
});

/**
 * DELETE /api/users/:id
 * Soft delete (deactivate) user. Admin can deactivate staff/worker/customer.
 * Staff can deactivate customers.
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found.',
    });
  }

  // Cannot delete yourself
  if (req.user._id.toString() === user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'You cannot deactivate your own account.',
    });
  }

  // Cannot delete ADMIN accounts
  if (user.role === ROLES.ADMIN) {
    return res.status(403).json({
      success: false,
      message: 'Admin accounts cannot be deactivated through this endpoint.',
    });
  }

  // Staff can only deactivate customers
  if (req.user.role === ROLES.STAFF && ![ROLES.CUSTOMER, ROLES.WORKER].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Staff can only deactivate customer and worker accounts.',
    });
  }

  // Soft delete — set active to false
  user.active = false;
  await user.save();

  res.json({
    success: true,
    message: `User ${user.name} has been deactivated.`,
  });
});

/**
 * GET /api/users/role/:role
 * Get all users by role. Role-restricted.
 */
export const getUsersByRole = asyncHandler(async (req, res) => {
  const targetRole = req.params.role.toUpperCase();

  // Staff can only list customers
  if (req.user.role === ROLES.STAFF && ![ROLES.CUSTOMER, ROLES.WORKER].includes(targetRole)) {
    return res.status(403).json({
      success: false,
      message: 'Staff can only view customer and worker lists.',
    });
  }

  const users = await User.find({ role: targetRole, active: true }).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: users.length,
    users,
  });
});

/**
 * PUT /api/users/:id/profile
 * Update own profile (limited fields for workers/customers).
 */
export const updateProfile = asyncHandler(async (req, res) => {
  if (req.user._id.toString() !== req.params.id) {
    return res.status(403).json({
      success: false,
      message: 'You can only update your own profile.',
    });
  }

  // Allowed fields for self-update
  const allowedFields = ['name', 'phone', 'company', 'location', 'addresses', 'profileImage'];

  // Workers can also update transport mode
  if (req.user.role === ROLES.WORKER) {
    allowedFields.push('transportMode', 'vehicleType');
  }

  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  // Never allow role change via profile update
  delete updates.role;
  delete updates.passwordHash;
  delete updates.googleId;

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    user,
  });
});
