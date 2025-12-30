require('dotenv').config();

// Warn if using default secret in production
const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
if (jwtSecret === 'default-secret-key' && process.env.NODE_ENV === 'production') {
  console.error('⚠️  WARNING: Using default JWT secret in production is a security risk!');
  console.error('⚠️  Please set the JWT_SECRET environment variable.');
}

module.exports = {
  secret: jwtSecret,
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshExpiresIn: '7d'
};
