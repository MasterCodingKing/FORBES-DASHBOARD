const { User } = require('../models');
const { generateToken } = require('../utils/generateToken');
const { createAuditLog, getIpAddress } = require('../middleware/auditMiddleware');

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { username, password, remember } = req.body;

    // Find user
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Generate token
    const token = generateToken(user);

    // Update remember token if remember me is checked
    if (remember) {
      await user.update({ remember_token: token });
    }

    // Log successful login
    await createAuditLog({
      user_id: user.id,
      username: user.username,
      action: 'LOGIN',
      entity: 'Auth',
      description: `User ${user.username} logged in successfully`,
      ip_address: getIpAddress(req),
      user_agent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toSafeObject(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    // Log logout action
    await createAuditLog({
      user_id: req.user.id,
      username: req.user.username,
      action: 'LOGOUT',
      entity: 'Auth',
      description: `User ${req.user.username} logged out`,
      ip_address: getIpAddress(req),
      user_agent: req.headers['user-agent']
    });

    // Clear remember token
    await req.user.update({ remember_token: null });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 * GET /api/auth/me
 */
const me = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.toSafeObject()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh token
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res, next) => {
  try {
    const token = generateToken(req.user);

    res.json({
      success: true,
      data: { token }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  me,
  refreshToken
};
