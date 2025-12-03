const { Sale, Department } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all sales
 * GET /api/sales
 */
const getSales = async (req, res, next) => {
  try {
    const { department_id, departmentId, start_date, end_date, month, year, limit = 100, offset = 0 } = req.query;
    
    const where = {};
    
    // Support both naming conventions
    const deptId = department_id || departmentId;
    if (deptId) {
      where.department_id = deptId;
    }
    
    // Support month/year filtering
    if (month && year) {
      // Use string-based date comparison to avoid timezone issues
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate(); // Get last day of month
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      where.date = { [Op.between]: [startDate, endDate] };
    } else if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    }

    const { count, rows: sales } = await Sale.findAndCountAll({
      where,
      include: [{
        model: Department,
        as: 'department',
        attributes: ['id', 'name']
      }],
      order: [['date', 'DESC'], ['id', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        sales,
        pagination: {
          total: count,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single sale
 * GET /api/sales/:id
 */
const getSale = async (req, res, next) => {
  try {
    const sale = await Sale.findByPk(req.params.id, {
      include: [{
        model: Department,
        as: 'department',
        attributes: ['id', 'name']
      }]
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    res.json({
      success: true,
      data: { sale }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new sale
 * POST /api/sales
 */
const createSale = async (req, res, next) => {
  try {
    const { department_id, amount, date, sale_date } = req.body;
    
    // Support both date field names
    const saleDate = date || sale_date;

    // Verify department exists
    const department = await Department.findByPk(department_id);
    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department'
      });
    }

    const sale = await Sale.create({
      department_id,
      amount,
      date: saleDate
    });

    // Reload with department info
    await sale.reload({
      include: [{
        model: Department,
        as: 'department',
        attributes: ['id', 'name']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      data: { sale }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update sale
 * PUT /api/sales/:id
 */
const updateSale = async (req, res, next) => {
  try {
    const { department_id, amount, date, sale_date } = req.body;
    
    const sale = await Sale.findByPk(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    // Verify department exists if department_id is being updated
    if (department_id) {
      const department = await Department.findByPk(department_id);
      if (!department) {
        return res.status(400).json({
          success: false,
          message: 'Invalid department'
        });
      }
    }

    // Support both date field names
    const saleDate = date || sale_date;

    await sale.update({
      department_id: department_id || sale.department_id,
      amount: amount !== undefined ? amount : sale.amount,
      date: saleDate || sale.date
    });

    // Reload with department info
    await sale.reload({
      include: [{
        model: Department,
        as: 'department',
        attributes: ['id', 'name']
      }]
    });

    res.json({
      success: true,
      message: 'Sale updated successfully',
      data: { sale }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete sale
 * DELETE /api/sales/:id
 */
const deleteSale = async (req, res, next) => {
  try {
    const sale = await Sale.findByPk(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    await sale.destroy();

    res.json({
      success: true,
      message: 'Sale deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSales,
  getSale,
  createSale,
  updateSale,
  deleteSale
};
