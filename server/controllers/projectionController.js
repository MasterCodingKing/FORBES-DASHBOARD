const { MonthlyProjection, Department } = require('../models');

/**
 * Get all monthly projections
 * GET /api/projections
 */
const getAllProjections = async (req, res, next) => {
  try {
    const { year, month, department_id, sort_by = 'year', sort_order = 'desc' } = req.query;

    const where = {};
    if (year) where.year = year;
    if (month) where.month = month;
    if (department_id) where.department_id = department_id;

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
    } else {
      order.push(['year', 'DESC']);
      order.push(['month', 'DESC']);
    }

    const projections = await MonthlyProjection.findAll({
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
      data: { projections }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get projections for a specific month and year
 * GET /api/projections/:year/:month
 */
const getProjectionsByMonth = async (req, res, next) => {
  try {
    const { year, month } = req.params;

    const projections = await MonthlyProjection.findAll({
      where: {
        year: parseInt(year),
        month: parseInt(month)
      },
      include: [{
        model: Department,
        as: 'department',
        attributes: ['id', 'name']
      }],
      order: [[{ model: Department, as: 'department' }, 'name', 'ASC']]
    });

    // Calculate totals
    const totals = {
      avg_monthly: projections.reduce((sum, p) => sum + parseFloat(p.avg_monthly || 0), 0),
      monthly_target: projections.reduce((sum, p) => sum + parseFloat(p.monthly_target || 0), 0)
    };

    res.json({
      success: true,
      data: { projections, totals }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create or update a monthly projection
 * POST /api/projections
 */
const createOrUpdateProjection = async (req, res, next) => {
  try {
    const { department_id, year, month, avg_monthly, monthly_target } = req.body;

    // Validate required fields
    if (!department_id || !year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Department ID, year, and month are required'
      });
    }

    // Validate parsed values
    const parsedYear = parseInt(year);
    const parsedMonth = parseInt(month);
    const parsedAvgMonthly = parseFloat(avg_monthly || 0);
    const parsedMonthlyTarget = parseFloat(monthly_target || 0);

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

    if (isNaN(parsedAvgMonthly) || parsedAvgMonthly < 0) {
      return res.status(400).json({
        success: false,
        message: 'Average monthly must be a valid non-negative number'
      });
    }

    if (isNaN(parsedMonthlyTarget) || parsedMonthlyTarget < 0) {
      return res.status(400).json({
        success: false,
        message: 'Monthly target must be a valid non-negative number'
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

    // Check if projection already exists (upsert)
    const [projection, created] = await MonthlyProjection.upsert({
      department_id,
      year: parsedYear,
      month: parsedMonth,
      avg_monthly: parsedAvgMonthly,
      monthly_target: parsedMonthlyTarget
    }, {
      returning: true
    });

    // Fetch with department association
    const projectionWithDept = await MonthlyProjection.findOne({
      where: { department_id, year: parsedYear, month: parsedMonth },
      include: [{
        model: Department,
        as: 'department',
        attributes: ['id', 'name']
      }]
    });

    res.status(created ? 201 : 200).json({
      success: true,
      message: created ? 'Monthly projection created successfully' : 'Monthly projection updated successfully',
      data: { projection: projectionWithDept }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk create/update projections for a month
 * POST /api/projections/bulk
 */
const bulkCreateProjections = async (req, res, next) => {
  try {
    const { year, month, projections } = req.body;

    // Validate required fields
    if (!year || !month || !projections || !Array.isArray(projections)) {
      return res.status(400).json({
        success: false,
        message: 'Year, month, and projections array are required'
      });
    }

    // Validate year and month
    const parsedYear = parseInt(year);
    const parsedMonth = parseInt(month);
    
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

    // Prepare upsert data with validation
    const projectionRecords = [];
    for (const p of projections) {
      const deptId = parseInt(p.department_id);
      const avgMonthly = parseFloat(p.avg_monthly || 0);
      const monthlyTarget = parseFloat(p.monthly_target || 0);
      
      if (isNaN(deptId) || deptId < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid department_id in projections array'
        });
      }
      
      if (isNaN(avgMonthly) || avgMonthly < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid avg_monthly value in projections array'
        });
      }
      
      if (isNaN(monthlyTarget) || monthlyTarget < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid monthly_target value in projections array'
        });
      }
      
      projectionRecords.push({
        department_id: deptId,
        year: parsedYear,
        month: parsedMonth,
        avg_monthly: avgMonthly,
        monthly_target: monthlyTarget
      });
    }

    // Upsert all projections
    const results = await Promise.all(
      projectionRecords.map(record => 
        MonthlyProjection.upsert(record, { returning: true })
      )
    );

    res.status(200).json({
      success: true,
      message: `Successfully saved ${results.length} monthly projections`,
      data: { count: results.length }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a projection by ID
 * PUT /api/projections/:id
 */
const updateProjection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { avg_monthly, monthly_target, year, month } = req.body;

    const projection = await MonthlyProjection.findByPk(id);

    if (!projection) {
      return res.status(404).json({
        success: false,
        message: 'Monthly projection not found'
      });
    }

    const updateData = {};
    
    // Validate and parse avg_monthly if provided
    if (avg_monthly !== undefined) {
      const parsedAvg = parseFloat(avg_monthly);
      if (isNaN(parsedAvg) || parsedAvg < 0) {
        return res.status(400).json({
          success: false,
          message: 'Average monthly must be a valid non-negative number'
        });
      }
      updateData.avg_monthly = parsedAvg;
    }
    
    // Validate and parse monthly_target if provided
    if (monthly_target !== undefined) {
      const parsedTarget = parseFloat(monthly_target);
      if (isNaN(parsedTarget) || parsedTarget < 0) {
        return res.status(400).json({
          success: false,
          message: 'Monthly target must be a valid non-negative number'
        });
      }
      updateData.monthly_target = parsedTarget;
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

    await projection.update(updateData);

    const updatedProjection = await MonthlyProjection.findByPk(id, {
      include: [{
        model: Department,
        as: 'department',
        attributes: ['id', 'name']
      }]
    });

    res.json({
      success: true,
      message: 'Monthly projection updated successfully',
      data: { projection: updatedProjection }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a projection
 * DELETE /api/projections/:id
 */
const deleteProjection = async (req, res, next) => {
  try {
    const { id } = req.params;

    const projection = await MonthlyProjection.findByPk(id);

    if (!projection) {
      return res.status(404).json({
        success: false,
        message: 'Monthly projection not found'
      });
    }

    await projection.destroy();

    res.json({
      success: true,
      message: 'Monthly projection deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProjections,
  getProjectionsByMonth,
  createOrUpdateProjection,
  bulkCreateProjections,
  updateProjection,
  deleteProjection
};
