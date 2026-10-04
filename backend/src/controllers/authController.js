import User, { ROLES } from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * POST /api/auth/register
 * Public registration — only CUSTOMER role allowed via public signup.
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, company } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required.',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters.',
    });
  }

  // Check existing user
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'An account with this email already exists.',
    });
  }

  // Public registration creates CUSTOMER only — never trust role from request body
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash: password, // Will be hashed by pre-save hook
    phone: phone || '',
    company: company || '',
    role: ROLES.CUSTOMER,
    memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
  });

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      profileImage: user.profileImage,
      phone: user.phone,
      company: user.company,
    },
  });
});

/**
 * POST /api/auth/login
 * Email/password login for all roles.
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.',
    });
  }

  // Find user and explicitly include passwordHash for comparison
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
    });
  }

  if (!user.active) {
    return res.status(401).json({
      success: false,
      message: 'Account has been deactivated. Contact an administrator.',
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
    });
  }

  const token = generateToken(user._id, user.role);

  res.json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      profileImage: user.profileImage,
      phone: user.phone,
      company: user.company,
      location: user.location,
      jobTitle: user.jobTitle,
      accountType: user.accountType,
      memberSince: user.memberSince,
      // Worker fields
      vehicleType: user.vehicleType,
      transportMode: user.transportMode,
      zone: user.zone,
      // Staff fields
      assignedVehicle: user.assignedVehicle,
    },
  });
});

/**
 * POST /api/auth/google
 * Google Sign-In — validates Google token server-side, finds or creates user.
 */
export const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).json({
      success: false,
      message: 'Google Sign-In is not configured on the server.',
    });
  }

  if (!credential) {
    return res.status(400).json({
      success: false,
      message: 'Google credential token is required.',
    });
  }

  try {
    // Dynamically import google-auth-library
    const { OAuth2Client } = await import('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, email_verified: emailVerified, name, picture } = payload;

    if (!email || !emailVerified) {
      return res.status(401).json({ success: false, message: 'Google account email is not verified.' });
    }

    // Find existing user by Google ID or email
    let user = await User.findOne({
      $or: [{ googleId }, { email: email.toLowerCase() }],
    });

    if (user) {
      // Update Google info if needed
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (picture && !user.profileImage) {
        user.profileImage = picture;
      }
      if (!user.active) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated.',
        });
      }
      await user.save();
    } else {
      // Create new CUSTOMER account via Google
      user = await User.create({
        name,
        email: email.toLowerCase(),
        googleId,
        profileImage: picture || '',
        role: ROLES.CUSTOMER,
        memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        profileImage: user.profileImage,
        phone: user.phone,
        company: user.company,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid Google credential.',
    });
  }
});

/**
 * GET /api/auth/me
 * Returns authenticated user's profile. Restores session after page refresh.
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found.',
    });
  }

  res.json({
    success: true,
    user,
  });
});

/**
 * POST /api/auth/logout
 * Clears token cookie if used.
 */
export const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
});

/**
 * PUT /api/auth/password
 * Change the authenticated user's password after verifying the current one.
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current and new passwords are required.' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
  }
  if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
    return res.status(400).json({ success: false, message: 'Use uppercase, lowercase, and a number in the new password.' });
  }

  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!user || !(await user.comparePassword(currentPassword))) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
  }
  if (await user.comparePassword(newPassword)) {
    return res.status(400).json({ success: false, message: 'New password must be different.' });
  }

  user.passwordHash = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully.' });
});
