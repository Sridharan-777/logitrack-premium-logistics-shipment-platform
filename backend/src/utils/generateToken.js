import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token containing only necessary identity info.
 * Never put passwords or sensitive personal data inside JWT.
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

export default generateToken;
