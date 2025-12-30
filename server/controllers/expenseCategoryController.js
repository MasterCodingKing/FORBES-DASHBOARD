const { ExpenseAccount } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all expense accounts
 * GET /api/expense-categories
 */
const getCategories = async (req, res, next) => {
  try {
    const { active_only = 'true' } = req.query;
    
    const where = {};
    if (active_only === 'true') {
      where.isActive = true;
    }

    const categories = await ExpenseAccount.findAll({
      where,
      order: [['accountNumber', 'ASC']]
    });

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single category
 * GET /api/expense-categories/:id
 */
const getCategory = async (req, res, next) => {
  try {
    const category = await ExpenseAccount.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new category
 * POST /api/expense-categories
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Account name is required'
      });
    }

    // Check if name already exists
    const existingName = await ExpenseAccount.findOne({
      where: { name: name.trim() }
    });

    if (existingName) {
      return res.status(400).json({
        success: false,
        message: 'Account name already exists'
      });
    }

    const category = await ExpenseAccount.create({
      name: name.trim(),
      description: description?.trim() || null,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update category
 * PUT /api/expense-categories/:id
 */
const updateCategory = async (req, res, next) => {
  try {
    const { name, description, isActive } = req.body;
    
    const category = await ExpenseAccount.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if new name conflicts with existing
    if (name && name.trim() !== category.name) {
      const existingName = await ExpenseAccount.findOne({
        where: { 
          name: name.trim(),
          id: { [Op.ne]: req.params.id }
        }
      });

      if (existingName) {
        return res.status(400).json({
          success: false,
          message: 'Account name already exists'
        });
      }
    }

    await category.update({
      name: name ? name.trim() : category.name,
      description: description !== undefined ? (description?.trim() || null) : category.description,
      isActive: isActive !== undefined ? isActive : category.isActive
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete category
 * DELETE /api/expense-categories/:id
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await ExpenseAccount.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category is being used by any expenses
    const { Expense } = require('../models');
    const expenseCount = await Expense.count({
      where: { category: category.name }
    });

    if (expenseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It is being used by ${expenseCount} expense(s). Consider deactivating it instead.`
      });
    }

    await category.destroy();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};
