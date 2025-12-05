require('dotenv').config();
const { sequelize } = require('./config/database');

async function fixDepartmentsTable() {
  try {
    console.log('🔧 Fixing departments table...');
    
    // Check if columns exist and drop them
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'dashboard_db' 
      AND TABLE_NAME = 'departments' 
      AND COLUMN_NAME IN ('created_at', 'updated_at')
    `);
    
    if (columns.length > 0) {
      console.log('📝 Dropping existing timestamp columns...');
      for (const col of columns) {
        await sequelize.query(`ALTER TABLE departments DROP COLUMN ${col.COLUMN_NAME}`);
        console.log(`   Dropped ${col.COLUMN_NAME}`);
      }
    }
    
    // Add columns with proper defaults
    console.log('➕ Adding timestamp columns with defaults...');
    await sequelize.query(`
      ALTER TABLE departments 
      ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `);
    
    // Update existing rows
    console.log('🔄 Updating existing rows...');
    await sequelize.query(`
      UPDATE departments 
      SET created_at = CURRENT_TIMESTAMP, 
          updated_at = CURRENT_TIMESTAMP
    `);
    
    console.log('✅ Departments table fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing departments table:', error.message);
    process.exit(1);
  }
}

fixDepartmentsTable();
