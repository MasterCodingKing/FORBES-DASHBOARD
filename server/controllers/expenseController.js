const { Expense } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all expenses
 * GET /api/expenses
 */
const getExpenses = async (req, res, next) => {
  try {
    const { category, start_date, end_date, month, year, limit = 100, offset = 0 } = req.query;
    
    const where = {};
    
    if (category) {
      where.category = category;
    }
    
    // Support month/year filtering
    if (month && year) {
      // Use string-based date comparison to avoid timezone issues
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate(); // Get last day of month
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      where.date = { [Op.between]: [startDate, endDate] };
    } else if (year && !month) {
      // Filter by year only for yearly view
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      where.date = { [Op.between]: [startDate, endDate] };
    } else if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    }

    const { count, rows: expenses } = await Expense.findAndCountAll({
      where,
      order: [['date', 'DESC'], ['id', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        expenses,
        pagination: {
          total: count,
          limit: parseInt(limit),
          offset: parseInt(offset)
        },
        categories: Expense.CATEGORIES
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single expense
 * GET /api/expenses/:id
 */
const getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      data: { expense }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new expense
 * POST /api/expenses
 */
const createExpense = async (req, res, next) => {
  try {
    const { description, amount, date, category } = req.body;

    const expense = await Expense.create({
      description,
      amount,
      date,
      category: category || 'General'
    });

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: { expense }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update expense
 * PUT /api/expenses/:id
 */
const updateExpense = async (req, res, next) => {
  try {
    const { description, amount, date, category } = req.body;
    
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    await expense.update({
      description: description || expense.description,
      amount: amount !== undefined ? amount : expense.amount,
      date: date || expense.date,
      category: category || expense.category
    });

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: { expense }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete expense
 * DELETE /api/expenses/:id
 */
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    await expense.destroy();

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get expense categories
 * GET /api/expenses/categories
 */
const getCategories = async (req, res) => {
  res.json({
    success: true,
    data: { categories: Expense.CATEGORIES }
  });
};

module.exports = {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getCategories
};
