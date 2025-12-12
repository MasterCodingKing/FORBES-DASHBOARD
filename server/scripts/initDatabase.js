/**
 * Database Initialization Script
 * 
 * This script will:
 * 1. Create the database if it doesn't exist
 * 2. Create all tables with proper schema
 * 3. Insert initial seed data (departments and users)
 * 
 * Usage: node scripts/initDatabase.js
 */

require('dotenv').config();
const { sequelize } = require('../config/database');
const { syncDatabase } = require('../models');
const { seedDepartments } = require('../seeders/departmentSeeder');
const { seedUsers } = require('../seeders/userSeeder');

const initializeDatabase = async () => {
  console.log('\n🚀 Starting database initialization...\n');
  
  try {
    // Step 1: Test database connection
    console.log('📡 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.\n');
    
    // Step 2: Sync database schema (create tables)
    console.log('🔨 Creating database tables...');
    await syncDatabase({ force: false }); // Set force: true to drop existing tables
    console.log('✅ All tables created successfully.\n');
    
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
    console.log('✨ Database initialization completed successfully!');
    console.log('════════════════════════════════════════════════════════');
    console.log('\n📝 Default Admin Credentials:');
    console.log('   Username: admin');
    console.log('   Password: password123');
    console.log('\n⚠️  Remember to change the admin password after first login!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
};

// Run the initialization
initializeDatabase();
