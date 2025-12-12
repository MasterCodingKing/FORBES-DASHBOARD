/**
 * Fix department names with trailing/leading whitespace
 * Run this script with: node fix-department-whitespace.js
 */

require('dotenv').config();
const { Department } = require('./models');
const { sequelize } = require('./config/database');

const fixDepartmentNames = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Find all departments
    const departments = await Department.findAll();
    console.log(`Found ${departments.length} departments`);

    let fixedCount = 0;

    for (const dept of departments) {
      const trimmedName = dept.name.trim();
      if (dept.name !== trimmedName) {
        console.log(`Fixing department "${dept.name}" -> "${trimmedName}"`);
        await dept.update({ name: trimmedName });
        fixedCount++;
      }
    }

    if (fixedCount > 0) {
      console.log(`\n✅ Fixed ${fixedCount} department name(s)`);
    } else {
      console.log('\n✅ All department names are already clean');
    }

    // Show current departments
    console.log('\nCurrent departments:');
    const updatedDepts = await Department.findAll({ order: [['id', 'ASC']] });
    updatedDepts.forEach(dept => {
      console.log(`  ${dept.id}: "${dept.name}"`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing department names:', error);
    process.exit(1);
  }
};

fixDepartmentNames();
