const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
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

    // Step 1: Add account_number column
    console.log('📝 Step 1: Adding account_number column...');
    try {
      await connection.execute(`
        ALTER TABLE expense_categories 
        ADD COLUMN account_number VARCHAR(50) AFTER code
      `);
      console.log('✅ account_number column added');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  account_number column already exists');
      } else {
        throw error;
      }
    }

    // Step 2: Migrate existing code values
    console.log('📝 Step 2: Migrating code values to account_number...');
    await connection.execute(`
      UPDATE expense_categories 
      SET account_number = CASE 
        WHEN code = 'GEN' THEN '10000'
        WHEN code = 'UTIL' THEN '10001'
        WHEN code = 'SUP' THEN '10002'
        WHEN code = 'MKT' THEN '10003'
        WHEN code = 'SAL' THEN '10004'
        WHEN code = 'RENT' THEN '10005'
        WHEN code = 'EQP' THEN '10006'
        WHEN code = 'TRV' THEN '10007'
        WHEN code = 'MNT' THEN '10008'
        WHEN code = 'OTH' THEN '10009'
        WHEN code = '50001' THEN '50001'
        ELSE CONCAT('1', LPAD(id, 4, '0'))
      END
      WHERE account_number IS NULL OR account_number = ''
    `);
    console.log('✅ Code values migrated');

    // Step 3: Make account_number NOT NULL and add unique constraint
    console.log('📝 Step 3: Adding constraints...');
    await connection.execute(`
      ALTER TABLE expense_categories 
      MODIFY COLUMN account_number VARCHAR(50) NOT NULL
    `);
    
    try {
      await connection.execute(`
        ALTER TABLE expense_categories 
        ADD UNIQUE KEY idx_account_number_unique (account_number)
      `);
      console.log('✅ Unique constraint added');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️  Unique constraint already exists');
      } else {
        throw error;
      }
    }

    // Step 4: Add index
    console.log('📝 Step 4: Adding index...');
    try {
      await connection.execute('DROP INDEX idx_code ON expense_categories');
      console.log('✅ Old index dropped');
    } catch (error) {
      if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('ℹ️  Old index does not exist');
      } else {
        throw error;
      }
    }

    try {
      await connection.execute(`
        CREATE INDEX idx_account_number ON expense_categories(account_number)
      `);
      console.log('✅ New index created');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️  Index already exists');
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

runMigration();
