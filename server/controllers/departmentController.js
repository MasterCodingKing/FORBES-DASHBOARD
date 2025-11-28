const { Department, Sale } = require('../models');

/**
 * Get all departments
 * GET /api/departments
 */
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { departments }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single department
 * GET /api/departments/:id
 */
const getDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      data: { department }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new department
 * POST /api/departments
 */
const createDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const department = await Department.create({
      name,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: { department }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update department
 * PUT /api/departments/:id
 */
const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const { name, description } = req.body;

    await department.update({
      name: name || department.name,
      description: description !== undefined ? description : department.description
    });

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: { department }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete department
 * DELETE /api/departments/:id
 */
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if department has sales
    const salesCount = await Sale.count({ where: { department_id: department.id } });
    if (salesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department with ${salesCount} associated sales. Delete the sales first or reassign them.`
      });
    }

    await department.destroy();

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
