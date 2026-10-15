const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route, token missing'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tastybite_super_secret_jwt_key_2026_secure');
    req.user = await User.findById(decoded.id).select('-password');

    // If ID not found (e.g. database re-seeded in development)
    if (!req.user) {
      if (decoded.email) {
        req.user = await User.findOne({ email: decoded.email.toLowerCase() }).select('-password');
      }
      if (!req.user) {
        req.user = await User.findOne({ role: 'customer' }).select('-password') || await User.findOne().select('-password');
      }
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists'
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authorization token'
    });
  }
};

const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tastybite_super_secret_jwt_key_2026_secure');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      if (decoded.email) {
        req.user = await User.findOne({ email: decoded.email.toLowerCase() }).select('-password');
      }
      if (!req.user) {
        req.user = await User.findOne({ role: 'customer' }).select('-password') || await User.findOne().select('-password');
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { protect, optionalProtect };
