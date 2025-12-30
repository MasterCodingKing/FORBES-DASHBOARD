const { NOI } = require('../models');

/**
 * Get all NOI records
 * GET /api/noi
 */
const getAllNOI = async (req, res, next) => {
  try {
    const { year, month, sort_by = 'year', sort_order = 'desc' } = req.query;

    const where = {};
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
    } else {
      order.push(['year', 'DESC']);
      order.push(['month', 'DESC']);
    }

    const nois = await NOI.findAll({
      where,
      order
    });

    res.json({
      success: true,
      data: { nois }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get NOI for a specific month and year
 * GET /api/noi/:year/:month
 */
const getNOI = async (req, res, next) => {
  try {
    const { year, month } = req.params;

    const noi = await NOI.findOne({
      where: {
        year: parseInt(year),
        month: parseInt(month)
      }
    });

    if (!noi) {
      // Return null noi but with success - it's valid to have no NOI set
      return res.json({
        success: true,
        data: { noi: null }
      });
    }

    res.json({
      success: true,
      data: { noi }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create or update NOI
 * POST /api/noi
 */
const createOrUpdateNOI = async (req, res, next) => {
  try {
    const { year, month, noi_amount } = req.body;

    // Validate required fields
    if (!year || !month || noi_amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Year, month, and NOI amount are required'
      });
    }

    // Validate parsed values
    const parsedYear = parseInt(year);
    const parsedMonth = parseInt(month);
    const parsedAmount = parseFloat(noi_amount);

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

    if (isNaN(parsedAmount)) {
      return res.status(400).json({
        success: false,
        message: 'NOI amount must be a valid number'
      });
    }

    // Check if NOI already exists (upsert)
    const [noi, created] = await NOI.upsert({
      year: parsedYear,
      month: parsedMonth,
      noi_amount: parsedAmount
    }, {
      returning: true
    });

    res.status(created ? 201 : 200).json({
      success: true,
      message: created ? 'NOI created successfully' : 'NOI updated successfully',
      data: { noi }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update NOI by ID
 * PUT /api/noi/:id
 */
const updateNOI = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { noi_amount, year, month } = req.body;

    const noi = await NOI.findByPk(id);

    if (!noi) {
      return res.status(404).json({
        success: false,
        message: 'NOI not found'
      });
    }

    const updateData = {};
    
    // Validate and parse noi_amount if provided
    if (noi_amount !== undefined) {
      const parsedAmount = parseFloat(noi_amount);
      if (isNaN(parsedAmount)) {
        return res.status(400).json({
          success: false,
          message: 'NOI amount must be a valid number'
        });
      }
      updateData.noi_amount = parsedAmount;
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

    await noi.update(updateData);

    const updatedNOI = await NOI.findByPk(id);

    res.json({
      success: true,
      message: 'NOI updated successfully',
      data: { noi: updatedNOI }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete NOI
 * DELETE /api/noi/:id
 */
const deleteNOI = async (req, res, next) => {
  try {
    const { id } = req.params;

    const noi = await NOI.findByPk(id);

    if (!noi) {
      return res.status(404).json({
        success: false,
        message: 'NOI not found'
      });
    }

    await noi.destroy();

    res.json({
      success: true,
      message: 'NOI deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllNOI,
  getNOI,
  createOrUpdateNOI,
  updateNOI,
  deleteNOI
};
