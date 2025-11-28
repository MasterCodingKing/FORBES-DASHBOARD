const { sequelize } = require('../config/database');
const { syncDatabase, Sale, Expense, Department } = require('../models');
const { seedDepartments } = require('./departmentSeeder');
const { seedUsers } = require('./userSeeder');

// Generate random sales data
const generateSalesData = async () => {
  const departments = await Department.findAll({ raw: true });
  const sales = [];
  
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  
  // Generate data for current and previous year
  for (const year of [previousYear, currentYear]) {
    for (let month = 1; month <= 12; month++) {
      // Skip future months for current year
      if (year === currentYear && month > new Date().getMonth() + 1) continue;
      
      const daysInMonth = new Date(year, month, 0).getDate();
      
      for (const dept of departments) {
        // Generate 15-30 sales per department per month
        const numSales = Math.floor(Math.random() * 16) + 15;
        
        for (let i = 0; i < numSales; i++) {
          const day = Math.floor(Math.random() * daysInMonth) + 1;
          const amount = (Math.random() * 50000 + 5000).toFixed(2);
          
          sales.push({
            department_id: dept.id,
            amount: parseFloat(amount),
            date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          });
        }
      }
    }
  }
  
  return sales;
};

// Generate random expenses data
const generateExpensesData = () => {
  const categories = ['General', 'Utilities', 'Supplies', 'Marketing', 'Salaries', 'Rent', 'Equipment', 'Travel', 'Maintenance', 'Other'];
  const descriptions = {
    'General': ['Office supplies', 'Miscellaneous expenses', 'Administrative costs'],
    'Utilities': ['Electricity bill', 'Water bill', 'Internet service', 'Phone bill'],
    'Supplies': ['Paper and stationery', 'Printer ink', 'Cleaning supplies'],
    'Marketing': ['Social media ads', 'Google ads', 'Promotional materials', 'Event sponsorship'],
    'Salaries': ['Staff salary', 'Contractor payment', 'Bonus payment'],
    'Rent': ['Office rent', 'Storage facility rent', 'Parking space'],
    'Equipment': ['Computer purchase', 'Furniture', 'Office equipment'],
    'Travel': ['Business trip', 'Client meeting travel', 'Conference attendance'],
    'Maintenance': ['Building maintenance', 'Equipment repair', 'Software maintenance'],
    'Other': ['Subscription services', 'Professional fees', 'Insurance']
  };
  
  const expenses = [];
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  
  for (const year of [previousYear, currentYear]) {
    for (let month = 1; month <= 12; month++) {
      if (year === currentYear && month > new Date().getMonth() + 1) continue;
      
      const daysInMonth = new Date(year, month, 0).getDate();
      
      // Generate 10-20 expenses per month
      const numExpenses = Math.floor(Math.random() * 11) + 10;
      
      for (let i = 0; i < numExpenses; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const descList = descriptions[category];
        const description = descList[Math.floor(Math.random() * descList.length)];
        const day = Math.floor(Math.random() * daysInMonth) + 1;
        const amount = (Math.random() * 20000 + 1000).toFixed(2);
        
        expenses.push({
          description,
          category,
          amount: parseFloat(amount),
          date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        });
      }
    }
  }
  
  return expenses;
};

const runSeeders = async () => {
  try {
    console.log('🚀 Starting database seeding...\n');
    
    // Sync database
    await syncDatabase({ force: false });
    
    // Run seeders
    await seedDepartments();
    await seedUsers();
    
    // Check if sales data exists
    const salesCount = await Sale.count();
    if (salesCount === 0) {
      console.log('📊 Generating sales data...');
      const salesData = await generateSalesData();
      await Sale.bulkCreate(salesData);
      console.log(`✅ Created ${salesData.length} sales records`);
    } else {
      console.log('⏩ Sales data already exists, skipping...');
    }
    
    // Check if expenses data exists
    const expensesCount = await Expense.count();
    if (expensesCount === 0) {
      console.log('📊 Generating expenses data...');
      const expensesData = generateExpensesData();
      await Expense.bulkCreate(expensesData);
      console.log(`✅ Created ${expensesData.length} expense records`);
    } else {
      console.log('⏩ Expenses data already exists, skipping...');
    }
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Default login credentials:');
    console.log('   Admin: username=admin, password=password123');
    console.log('   User:  username=johndoe, password=password123');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  runSeeders();
}

module.exports = { runSeeders };
