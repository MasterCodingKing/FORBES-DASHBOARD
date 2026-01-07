const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'dashboard_db'
    });

    console.log('Connected to database...');

    // Add allowed_reports column
    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN allowed_reports JSON DEFAULT NULL AFTER allowed_modules
    `);

    console.log('✅ Successfully added allowed_reports column to users table');

    await connection.end();
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('✅ Column allowed_reports already exists');
      process.exit(0);
    } else {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    }
  }
}

runMigration();
