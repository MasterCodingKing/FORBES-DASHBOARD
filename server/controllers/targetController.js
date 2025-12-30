const { MonthlyTarget, Department } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all monthly targets
 * GET /api/targets
 */
const getMonthlyTargets = async (req, res, next) => {
  try {
    const { department_id, year, month, sort_by = 'year', sort_order = 'desc' } = req.query;

    const where = {};
    if (department_id) where.department_id = department_id;
    if (year) where.year = year;
    if (month) where.month = month;

    // Build order clause
    const order = [];
    if (sort_by === 'year') {
      order.push(['year', sort_order.toUpperCase()]);
      order.push(['month', sort_order.toUpperCase()]);
    } else if (sort_by === 'month') {
      order.push(['month', sort_order.toUpperCase()]);
      order.push(['year', sort_order.toUpperCase()]);
    } else if (sort_by === 'department') {
      order.push([{ model: Department, as: 'department' }, 'name', sort_order.toUpperCase()]);
    } else if (sort_by === 'target') {
      order.push(['target_amount', sort_order.toUpperCase()]);
    } else {
      order.push(['year', 'DESC']);
      order.push(['month', 'DESC']);
    }

    const targets = await MonthlyTarget.findAll({
      where,
      include: [{
        model: Department,
        as: 'department',
        attributes: ['id', 'name']
      }],
      order
    });

    res.json({
      success: true,
      data: { targets }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get monthly target for a specific department and month
 * GET /api/targets/:departmentId/:year/:month
 */
const getMonthlyTarget = async (req, res, next) => {
  try {
    const { departmentId, year, month } = req.params;

    const target = await MonthlyTarget.findOne({
      where: {
        department_id: departmentId,
        year: parseInt(year),
        month: parseInt(month)
      },
      include: [{
        model: Department,
        as: 'department',
        attributes: ['id', 'name']
      }]
    });

    if (!target) {
      // Return null target but with success - it's valid to have no target set
      return res.json({
        success: true,
        data: { target: null }
      });
    }

    res.json({
      success: true,
      data: { target }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get targets for a specific department across all months
 * GET /api/targets/department/:departmentId
 */
const getDepartmentTargets = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const { year } = req.query;

    const where = { department_id: departmentId };
    if (year) where.year = year;

    const targets = await MonthlyTarget.findAll({
      where,
      include: [{
        model: Department,
        as: 'department',
        attributes: ['id', 'name']
      }],
      order: [['year', 'DESC'], ['month', 'DESC']]
    });

    res.json({
      success: true,
      data: { targets }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create or update a monthly target
 * POST /api/targets
 */
const createOrUpdateTarget = async (req, res, next) => {
  try {
    const { department_id, year, month, target_amount } = req.body;

    // Validate required fields
    if (!department_id || !year || !month || target_amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Department ID, year, month, and target amount are required'
      });
    }

    // Validate parsed values
    const parsedYear = parseInt(year);
    const parsedMonth = parseInt(month);
    const parsedAmount = parseFloat(target_amount);

    if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
      return res.status(400).json({
        success: false,
        message: 'Year must be between 2000 and 2100'
      });
    }

    if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).json({
        success: false,
        message: 'Month must be between 1 and 12'
      });
    }

    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Target amount must be a valid non-negative number'
      });
    }

    // Check if department exists
    const department = await Department.findByPk(department_id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if target already exists (upsert)
    const [target, created] = await MonthlyTarget.upsert({
      department_id,
      year: parsedYear,
      month: parsedMonth,
      target_amount: parsedAmount
    }, {
      returning: true
    });

    // Fetch with department association
    const targetWithDept = await MonthlyTarget.findOne({
      where: { department_id, year: parsedYear, month: parsedMonth },
      include: [{
        model: Department,
        as: 'department',
        attributes: ['id', 'name']
      }]
    });

    res.status(created ? 201 : 200).json({
      success: true,
      message: created ? 'Monthly target created successfully' : 'Monthly target updated successfully',
      data: { target: targetWithDept }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a monthly target by ID
 * PUT /api/targets/:id
 */
const updateTarget = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { target_amount, year, month } = req.body;

    const target = await MonthlyTarget.findByPk(id);

    if (!target) {
      return res.status(404).json({
        success: false,
        message: 'Monthly target not found'
      });
    }

    const updateData = {};
    
    // Validate and parse target_amount if provided
    if (target_amount !== undefined) {
      const parsedAmount = parseFloat(target_amount);
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        return res.status(400).json({
          success: false,
          message: 'Target amount must be a valid non-negative number'
        });
      }
      updateData.target_amount = parsedAmount;
    }
    
    // Validate and parse year if provided
    if (year !== undefined) {
      const parsedYear = parseInt(year);
      if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
        return res.status(400).json({
          success: false,
          message: 'Year must be between 2000 and 2100'
        });
      }
      updateData.year = parsedYear;
    }
    
    // Validate and parse month if provided
    if (month !== undefined) {
      const parsedMonth = parseInt(month);
      if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
        return res.status(400).json({
          success: false,
          message: 'Month must be between 1 and 12'
        });
      }
      updateData.month = parsedMonth;
    }

    await target.update(updateData);

    const updatedTarget = await MonthlyTarget.findByPk(id, {
      include: [{
        model: Department,
        as: 'department',
        attributes: ['id', 'name']
      }]
    });

    res.json({
      success: true,
      message: 'Monthly target updated successfully',
      data: { target: updatedTarget }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a monthly target
 * DELETE /api/targets/:id
 */
const deleteTarget = async (req, res, next) => {
  try {
    const { id } = req.params;

    const target = await MonthlyTarget.findByPk(id);

    if (!target) {
      return res.status(404).json({
        success: false,
        message: 'Monthly target not found'
      });
    }

    await target.destroy();

    res.json({
      success: true,
      message: 'Monthly target deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk create monthly targets for a department
 * POST /api/targets/bulk
 */
const bulkCreateTargets = async (req, res, next) => {
  try {
    const { department_id, year, targets } = req.body;

    // Validate required fields
    if (!department_id || !year || !targets || !Array.isArray(targets)) {
      return res.status(400).json({
        success: false,
        message: 'Department ID, year, and targets array are required'
      });
    }

    // Validate year
    const parsedYear = parseInt(year);
    if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
      return res.status(400).json({
        success: false,
        message: 'Year must be between 2000 and 2100'
      });
    }

    // Check if department exists
    const department = await Department.findByPk(department_id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Prepare upsert data with validation
    const targetRecords = [];
    for (const t of targets) {
      const parsedMonth = parseInt(t.month);
      const parsedAmount = parseFloat(t.target_amount);
      
      if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
        return res.status(400).json({
          success: false,
          message: `Invalid month in targets array: ${t.month}`
        });
      }
      
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid target_amount for month ${parsedMonth}`
        });
      }
      
      targetRecords.push({
        department_id,
        year: parsedYear,
        month: parsedMonth,
        target_amount: parsedAmount
      });
    }

    // Upsert all targets
    const results = await Promise.all(
      targetRecords.map(record => 
        MonthlyTarget.upsert(record, { returning: true })
      )
    );

    res.status(200).json({
      success: true,
      message: `Successfully saved ${results.length} monthly targets`,
      data: { count: results.length }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMonthlyTargets,
  getMonthlyTarget,
  getDepartmentTargets,
  createOrUpdateTarget,
  updateTarget,
  deleteTarget,
  bulkCreateTargets
};
