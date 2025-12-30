const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixCodeColumn() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Connected to database');

    // Option 1: Drop the code column entirely (recommended since we're using account_number now)
    console.log('📝 Dropping old code column...');
    try {
      await connection.execute('ALTER TABLE expense_categories DROP COLUMN code');
      console.log('✅ Code column dropped successfully');
    } catch (error) {
      if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('ℹ️  Code column already dropped');
      } else {
        throw error;
      }
    }

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Error code:', error.code);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Database connection closed');
    }
  }
}

fixCodeColumn();
