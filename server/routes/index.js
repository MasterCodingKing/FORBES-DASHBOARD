const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const salesRoutes = require('./salesRoutes');
const expenseRoutes = require('./expenseRoutes');
const departmentRoutes = require('./departmentRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const contactRoutes = require('./contactRoutes');
const targetRoutes = require('./targetRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/sales', salesRoutes);
router.use('/expenses', expenseRoutes);
router.use('/departments', departmentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/contact', contactRoutes);
router.use('/targets', targetRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
