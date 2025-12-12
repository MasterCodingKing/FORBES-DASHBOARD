/**
 * Database Reset Script
 * 
 * ⚠️  WARNING: This script will DROP all tables and recreate them!
 * This will delete ALL data in your database.
 * 
 * Use this script only for:
 * - Development/testing environments
 * - When you need a fresh database
 * - When schema has changed significantly
 * 
 * Usage: node scripts/resetDatabase.js
 */

require('dotenv').config();
const readline = require('readline');
const { sequelize } = require('../config/database');
const { syncDatabase } = require('../models');
const { seedDepartments } = require('../seeders/departmentSeeder');
const { seedUsers } = require('../seeders/userSeeder');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askConfirmation = () => {
  return new Promise((resolve) => {
    rl.question(
      '\n⚠️  WARNING: This will DELETE ALL DATA in the database!\n' +
      'Are you sure you want to continue? (yes/no): ',
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes');
      }
    );
  });
};

const resetDatabase = async () => {
  console.log('\n🔄 Database Reset Script\n');
  
  try {
    // Ask for confirmation
    const confirmed = await askConfirmation();
    
    if (!confirmed) {
      console.log('\n❌ Operation cancelled by user.');
      process.exit(0);
    }
    
    console.log('\n🚀 Starting database reset...\n');
    
    // Step 1: Test database connection
    console.log('📡 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established.\n');
    
    // Step 2: Drop and recreate all tables
    console.log('💣 Dropping existing tables...');
    await syncDatabase({ force: true }); // force: true will drop tables
    console.log('✅ Tables dropped and recreated.\n');
    
    // Step 3: Seed departments
    console.log('🌱 Seeding departments...');
    await seedDepartments();
    console.log('');
    
    // Step 4: Seed users
    console.log('👥 Seeding users...');
    await seedUsers();
    console.log('');
    
    // Summary
    console.log('════════════════════════════════════════════════════════');
    console.log('✨ Database reset completed successfully!');
    console.log('════════════════════════════════════════════════════════');
    console.log('\n📝 Default Admin Credentials:');
    console.log('   Username: admin');
    console.log('   Password: password123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database reset failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
};

// Run the reset
resetDatabase();
