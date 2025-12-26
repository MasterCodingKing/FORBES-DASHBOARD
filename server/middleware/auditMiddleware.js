const AuditLog = require('../models/AuditLog');

/**
 * Middleware to log actions to audit trail
 */
const createAuditLog = async (data) => {
  try {
    await AuditLog.create(data);
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error to prevent breaking the main operation
  }
};

/**
 * Extract IP address from request
 */
const getIpAddress = (req) => {
  return req.ip || 
         req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress;
};

/**
 * Generate descriptive action text
 */
const generateDescription = (action, entity, entityId, reqBody, oldValues, newValues) => {
  let description = `${action} ${entity}`;
  
  if (entityId) {
    description += ` #${entityId}`;
  }
  
  // Add more context based on entity type
  if (entity === 'Sale' && (reqBody || newValues?.sale)) {
    const sale = newValues?.sale || reqBody;
    if (sale?.amount) {
      description += ` - Amount: $${parseFloat(sale.amount).toLocaleString()}`;
    }
    if (sale?.date) {
      description += ` on ${sale.date}`;
    }
  }
  
  if (entity === 'Expense' && (reqBody || newValues?.expense)) {
    const expense = newValues?.expense || reqBody;
    if (expense?.amount) {
      description += ` - Amount: $${parseFloat(expense.amount).toLocaleString()}`;
    }
    if (expense?.category) {
      description += ` (${expense.category})`;
    }
  }
  
  if (entity === 'User' && (reqBody || newValues?.user)) {
    const user = newValues?.user || reqBody;
    if (user?.username) {
      description += ` - ${user.username}`;
    }
    if (action === 'UPDATE' && reqBody?.permissions) {
      description += ' (permissions updated)';
    }
    if (action === 'UPDATE' && reqBody?.allowed_modules) {
      description += ' (module access updated)';
    }
  }
  
  if (entity === 'Department' && (reqBody || newValues?.department)) {
    const dept = newValues?.department || reqBody;
    if (dept?.name) {
      description += ` - ${dept.name}`;
    }
  }
  
  if (entity === 'Target' && (reqBody || newValues?.target)) {
    const target = newValues?.target || reqBody;
    if (target?.target_amount) {
      description += ` - Target: $${parseFloat(target.target_amount).toLocaleString()}`;
    }
    if (target?.year && target?.month) {
      description += ` for ${target.month}/${target.year}`;
    }
  }
  
  return description;
};

/**
 * Middleware to automatically log certain actions
 * For UPDATE and DELETE actions, captures old values before the operation
 */
const auditMiddleware = (action, entity) => {
  return async (req, res, next) => {
    let oldValues = null;

    // For UPDATE and DELETE operations, capture old values first
    if ((action === 'UPDATE' || action === 'DELETE') && req.params.id) {
      try {
        // Dynamically load the appropriate model
        const models = require('../models');
        const Model = models[entity];
        
        if (Model) {
          const record = await Model.findByPk(req.params.id);
          if (record) {
            // Store the old values (convert to plain object to avoid Sequelize instance methods)
            oldValues = record.toJSON ? record.toJSON() : record.dataValues;
            
            // Remove timestamps and sensitive data if needed
            if (oldValues) {
              // Store old values in request for later use
              req.auditOldValues = oldValues;
            }
          }
        }
      } catch (error) {
        console.error('Error capturing old values for audit:', error);
      }
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to capture response
    res.json = function(data) {
      // Only log if request was successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const newValues = action === 'DELETE' ? null : (data?.data || null);
        
        const auditData = {
          user_id: req.user?.id || null,
          username: req.user?.username || 'Anonymous',
          action,
          entity,
          entity_id: req.params.id || data?.data?.id || data?.data?.sale?.id || data?.data?.expense?.id || data?.data?.user?.id || null,
          description: generateDescription(action, entity, req.params.id || data?.data?.id, req.body, req.auditOldValues, newValues),
          old_values: req.auditOldValues || null,
          new_values: newValues,
          ip_address: getIpAddress(req),
          user_agent: req.headers['user-agent']
        };

        // Create audit log asynchronously without blocking response
        createAuditLog(auditData).catch(err => {
          console.error('Audit log failed:', err);
        });
      }

      // Call original json method
      return originalJson(data);
    };

    next();
  };
};

module.exports = {
  createAuditLog,
  getIpAddress,
  auditMiddleware
};
