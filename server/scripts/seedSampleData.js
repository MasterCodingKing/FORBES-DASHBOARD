/**
 * Sample Data Seeding Script
 * 
 * This script seeds sample sales and expenses data for testing/demo purposes.
 * It creates realistic data for the past 3 months.
 * 
 * Usage: node scripts/seedSampleData.js
 */

require('dotenv').config();
const { sequelize, Department, Sale, Expense } = require('../models');

// Helper function to generate random number in range
const randomInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to generate random amount
const randomAmount = (min, max) => {
  return (Math.random() * (max - min) + min).toFixed(2);
};

// Helper function to get date X days ago
const getDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

const expenseCategories = [
  'General', 'Utilities', 'Supplies', 'Marketing', 
  'Salaries', 'Rent', 'Equipment', 'Travel', 
  'Maintenance', 'Other'
];

const expenseDescriptions = {
  'General': ['Office supplies', 'Miscellaneous expenses', 'Administrative costs'],
  'Utilities': ['Electricity bill', 'Internet service', 'Water bill', 'Phone bills'],
  'Supplies': ['Printer paper', 'Stationery', 'Cleaning supplies', 'Coffee and snacks'],
  'Marketing': ['Social media ads', 'Google Ads', 'Print materials', 'Event sponsorship'],
  'Salaries': ['Monthly payroll', 'Contractor payments', 'Bonuses'],
  'Rent': ['Office rent', 'Parking fees', 'Storage rental'],
  'Equipment': ['New computers', 'Software licenses', 'Office furniture', 'Monitors'],
  'Travel': ['Client meetings', 'Conference attendance', 'Team offsite', 'Transportation'],
  'Maintenance': ['Equipment repair', 'Building maintenance', 'System updates'],
  'Other': ['Insurance', 'Legal fees', 'Training courses', 'Subscriptions']
};

const seedSales = async (departments) => {
  console.log('💰 Seeding sales data...');
  const salesData = [];
  const days = 90; // Last 3 months
  
  for (let i = 0; i < days; i++) {
    const date = getDaysAgo(days - i);
    
    // Create 1-3 sales per day for random departments
    const salesCount = randomInRange(1, 3);
    
    for (let j = 0; j < salesCount; j++) {
      const department = departments[randomInRange(0, departments.length - 1)];
      const amount = randomAmount(500, 5000);
      
      salesData.push({
        department_id: department.id,
        amount: amount,
        date: date
      });
    }
  }
  
  await Sale.bulkCreate(salesData);
  console.log(`✅ Created ${salesData.length} sales records`);
};

const seedExpenses = async () => {
  console.log('💸 Seeding expenses data...');
  const expensesData = [];
  const days = 90; // Last 3 months
  
  for (let i = 0; i < days; i++) {
    const date = getDaysAgo(days - i);
    
    // Create 0-2 expenses per day
    const expenseCount = randomInRange(0, 2);
    
    for (let j = 0; j < expenseCount; j++) {
      const category = expenseCategories[randomInRange(0, expenseCategories.length - 1)];
      const descriptions = expenseDescriptions[category];
      const description = descriptions[randomInRange(0, descriptions.length - 1)];
      
      // Different amount ranges for different categories
      let minAmount = 50;
      let maxAmount = 500;
      
      if (category === 'Salaries') {
        minAmount = 3000;
        maxAmount = 15000;
      } else if (category === 'Rent') {
        minAmount = 2000;
        maxAmount = 5000;
      } else if (category === 'Equipment') {
        minAmount = 500;
        maxAmount = 3000;
      }
      
      const amount = randomAmount(minAmount, maxAmount);
      
      expensesData.push({
        description: description,
        amount: amount,
        date: date,
        category: category
      });
    }
  }
  
  await Expense.bulkCreate(expensesData);
  console.log(`✅ Created ${expensesData.length} expense records`);
};

const seedSampleData = async () => {
  console.log('\n🌱 Starting sample data seeding...\n');
  
  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established.\n');
    
    // Get all departments
    const departments = await Department.findAll();
    
    if (departments.length === 0) {
      console.error('❌ No departments found. Please run initDatabase.js first.');
      process.exit(1);
    }
    
    console.log(`📊 Found ${departments.length} departments\n`);
    
    // Check if data already exists
    const existingSales = await Sale.count();
    const existingExpenses = await Expense.count();
    
    if (existingSales > 0 || existingExpenses > 0) {
      console.log('⚠️  Warning: Sample data already exists.');
      console.log(`   Current sales records: ${existingSales}`);
      console.log(`   Current expense records: ${existingExpenses}`);
      console.log('\n   This will ADD MORE sample data, not replace existing data.');
      console.log('   To start fresh, run: node scripts/resetDatabase.js\n');
    }
    
    // Seed sales
    await seedSales(departments);
    console.log('');
    
    // Seed expenses
    await seedExpenses();
    console.log('');
    
    // Summary
    console.log('════════════════════════════════════════════════════════');
    console.log('✨ Sample data seeding completed successfully!');
    console.log('════════════════════════════════════════════════════════');
    console.log('\n📊 Data Summary:');
    console.log(`   Total Sales: ${await Sale.count()}`);
    console.log(`   Total Expenses: ${await Expense.count()}`);
    console.log(`   Date Range: Last 90 days\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Sample data seeding failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
};

// Run the seeder
seedSampleData();
