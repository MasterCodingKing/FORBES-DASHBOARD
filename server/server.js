require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const https = require('https');
const fs = require('fs');

const { testConnection } = require('./config/database');
const { syncDatabase } = require('./models');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration - allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://localhost:5173',
  'http://172.27.128.1:5173',
  'https://172.27.128.1:5173',
  'https://dashboard.test:8443',
  'http://dashboard.test:8443',
  'https://192.168.34.6:8443',
  'http://192.168.34.6:8443',
  'http://192.168.34.6:5173',
  'https://192.168.34.6:5173',
  'http://192.168.18.92:5000/',
  'https://192.168.18.92:5000/',
  'http://192.168.18.80:5000/',
  'https://192.168.18.80:5000/',
  'http://192.168.18.80:5173',
  'https://192.168.18.80:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Dashboard API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      sales: '/api/sales',
      expenses: '/api/expenses',
      departments: '/api/departments',
      dashboard: '/api/dashboard',
      targets: '/api/targets',
      contact: '/api/contact',
      audit: '/api/audit'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync database models (use alter: false to prevent automatic schema changes)
    await syncDatabase({ alter: false });
    
    // Check if SSL certificates exist for HTTPS
    const sslKeyPath = process.env.SSL_KEY_PATH;
    const sslCertPath = process.env.SSL_CERT_PATH;
    
    if (sslKeyPath && sslCertPath && fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
      // HTTPS server
      const httpsOptions = {
        key: fs.readFileSync(sslKeyPath),
        cert: fs.readFileSync(sslCertPath)
      };
      
      https.createServer(httpsOptions, app).listen(PORT, '0.0.0.0', () => {
        console.log(`\n🔒 HTTPS Server running on https://localhost:${PORT}`);
        console.log(`🌐 Network: https://192.168.34.6:${PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
      });
    } else {
      // HTTP server (fallback)
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🚀 HTTP Server running on http://localhost:${PORT}`);
        console.log(`🌐 Network: http://192.168.34.6:${PORT}`);
        console.log(`📝 API Documentation: http://localhost:${PORT}/api/health`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
