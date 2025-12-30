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

    const parsedLimit = parseInt(limit) || 100;
    const parsedOffset = parseInt(offset) || 0;
    
    const { count, rows: expenses } = await Expense.findAndCountAll({
      where,
      order: [['date', 'DESC'], ['id', 'DESC']],
      limit: Math.max(1, Math.min(parsedLimit, 10000)),
      offset: Math.max(0, parsedOffset)
    });

    res.json({
      success: true,
      data: {
        expenses,
        pagination: {
          total: count,
          limit: parsedLimit,
          offset: parsedOffset
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

    // Validate required fields
    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    if (amount === undefined || amount === null || amount === '') {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a valid non-negative number'
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Date must be in YYYY-MM-DD format'
      });
    }

    // Category validation removed - now using dynamic expense_categories table

    const expense = await Expense.create({
      description: description.trim(),
      amount: parsedAmount,
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
 * Bulk create expenses
 * POST /api/expenses/bulk
 */
const createBulkExpenses = async (req, res, next) => {
  try {
    const { expenses } = req.body;

    if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Expenses array is required and must not be empty'
      });
    }

    if (expenses.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create more than 100 expenses at once'
      });
    }

    // Validate all expenses
    const validatedExpenses = [];
    const errors = [];

    for (let i = 0; i < expenses.length; i++) {
      const { description, amount, date, category } = expenses[i];
      const rowErrors = [];

      // Validate description
      if (!description || !description.trim()) {
        rowErrors.push('Description is required');
      }

      // Validate amount
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        rowErrors.push('Amount must be a valid non-negative number');
      }

      // Validate date
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!date || !dateRegex.test(date)) {
        rowErrors.push('Date must be in YYYY-MM-DD format');
      }

      // Category validation removed - now using dynamic expense_categories table

      if (rowErrors.length > 0) {
        errors.push({ row: i + 1, errors: rowErrors });
      } else {
        validatedExpenses.push({
          description: description.trim(),
          amount: parsedAmount,
          date,
          category: category || 'General'
        });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors in some expenses',
        errors
      });
    }

    // Bulk create all validated expenses
    const createdExpenses = await Expense.bulkCreate(validatedExpenses);

    res.status(201).json({
      success: true,
      message: `${createdExpenses.length} expenses created successfully`,
      data: { expenses: createdExpenses }
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

    // Validate amount if provided
    let parsedAmount = expense.amount;
    if (amount !== undefined && amount !== null && amount !== '') {
      parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be a valid non-negative number'
        });
      }
    }

    // Validate date format if provided
    if (date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          success: false,
          message: 'Date must be in YYYY-MM-DD format'
        });
      }
    }

    // Category validation removed - now using dynamic expense_categories table

    // Validate description if provided
    const trimmedDescription = description ? description.trim() : null;
    if (description !== undefined && (!trimmedDescription || trimmedDescription.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Description cannot be empty'
      });
    }

    await expense.update({
      description: trimmedDescription || expense.description,
      amount: parsedAmount,
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
  createBulkExpenses,
  updateExpense,
  deleteExpense,
  getCategories
};
