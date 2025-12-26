const AuditLog = require('../models/AuditLog');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Get audit logs with filtering and pagination
 * GET /api/audit
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      entity,
      user_id,
      start_date,
      end_date
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};
    
    if (action) {
      where.action = action;
    }
    
    if (entity) {
      where.entity = entity;
    }
    
    if (user_id) {
      where.user_id = parseInt(user_id);
    }
    
    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) {
        where.createdAt[Op.gte] = new Date(start_date);
      }
      if (end_date) {
        where.createdAt[Op.lte] = new Date(end_date);
      }
    }

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        logs: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit statistics
 * GET /api/audit/stats
 */
const getAuditStats = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    const where = {};
    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) {
        where.createdAt[Op.gte] = new Date(start_date);
      }
      if (end_date) {
        where.createdAt[Op.lte] = new Date(end_date);
      }
    }

    // Get action counts
    const actionCounts = await AuditLog.findAll({
      where,
      attributes: [
        'action',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['action'],
      raw: true
    });

    // Get entity counts
    const entityCounts = await AuditLog.findAll({
      where,
      attributes: [
        'entity',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['entity'],
      raw: true
    });

    // Get user activity
    const userActivity = await AuditLog.findAll({
      where,
      attributes: [
        'user_id',
        'username',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['user_id', 'username'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10,
      raw: true
    });

    res.json({
      success: true,
      data: {
        actionCounts,
        entityCounts,
        userActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit log by ID
 * GET /api/audit/:id
 */
const getAuditLogById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const log = await AuditLog.findByPk(id);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found'
      });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs,
  getAuditStats,
  getAuditLogById
};
