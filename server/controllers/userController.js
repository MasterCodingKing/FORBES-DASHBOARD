const { User } = require('../models');
const { sendWelcomeEmail } = require('../services/emailService');
const { DEFAULT_PERMISSIONS } = require('../middleware/permissionMiddleware');

/**
 * Get all users
 * GET /api/users
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'remember_token'] },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single user
 * GET /api/users/:id
 */
const getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'remember_token'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new user
 * POST /api/users
 */
const createUser = async (req, res, next) => {
  try {
    const { first_name, last_name, username, password, is_admin, role, permissions } = req.body;

    // Set default role and permissions based on is_admin flag
    const userRole = role || (is_admin ? 'admin' : 'user');
    const userPermissions = permissions || DEFAULT_PERMISSIONS[userRole] || DEFAULT_PERMISSIONS.user;

    const user = await User.create({
      first_name,
      last_name,
      username,
      password,
      is_admin: is_admin || false,
      role: userRole,
      permissions: userPermissions,
      is_active: true
    });

    // Send welcome email (non-blocking)
    if (req.body.email) {
      sendWelcomeEmail({
        to: req.body.email,
        firstName: first_name,
        username
      }).catch(err => console.error('Welcome email error:', err));
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: user.toSafeObject() }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user
 * PUT /api/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { first_name, last_name, username, password, is_admin } = req.body;

    // Prevent changing own admin status
    if (req.user.id === user.id && is_admin !== undefined && is_admin !== user.is_admin) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own admin status'
      });
    }

    // Update fields
    const updates = {};
    if (first_name) updates.first_name = first_name;
    if (last_name) updates.last_name = last_name;
    if (username) updates.username = username;
    if (password) updates.password = password;
    if (is_admin !== undefined) updates.is_admin = is_admin;

    await user.update(updates);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: user.toSafeObject() }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent self-deletion
    if (req.user.id === user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Prevent deletion of last admin
    if (user.is_admin) {
      const adminCount = await User.count({ where: { is_admin: true } });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last admin user'
        });
      }
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user permissions
 * PUT /api/users/:id/permissions
 */
const updateUserPermissions = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { permissions, role, is_active, allowed_modules } = req.body;

    // Prevent deactivating the last active admin
    if (is_active === false && user.is_active && user.role === 'admin') {
      const activeAdminCount = await User.count({ 
        where: { role: 'admin', is_active: true } 
      });
      if (activeAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate the last active admin user'
        });
      }
    }

    // Prevent demoting the last admin
    if (role && role !== 'admin' && user.role === 'admin') {
      const adminCount = await User.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot demote the last admin user'
        });
      }
    }

    const updates = {};
    if (permissions !== undefined) updates.permissions = permissions;
    if (role !== undefined) {
      updates.role = role;
      // If role is changed and no custom permissions, use defaults
      if (!permissions) {
        updates.permissions = DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.user;
      }
    }
    if (is_active !== undefined) updates.is_active = is_active;
    if (allowed_modules !== undefined) updates.allowed_modules = allowed_modules;

    await user.update(updates);

    res.json({
      success: true,
      message: 'User permissions updated successfully',
      data: { user: user.toSafeObject() }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all available permissions
 * GET /api/users/permissions/available
 */
const getAvailablePermissions = async (req, res, next) => {
  try {
    const { PERMISSIONS, MODULES } = require('../middleware/permissionMiddleware');
    
    res.json({
      success: true,
      data: {
        permissions: PERMISSIONS,
        modules: MODULES,
        defaultPermissions: DEFAULT_PERMISSIONS
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserPermissions,
  getAvailablePermissions
};
