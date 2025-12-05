require('dotenv').config();
const { sequelize } = require('./config/database');

async function analyzeSalesData() {
  try {
    console.log('🔍 Analyzing Sales Data Structure...\n');
    
    // Check January 2024 individual sales
    const [janSales] = await sequelize.query(`
      SELECT id, department_id, amount, date 
      FROM sales 
      WHERE date BETWEEN '2024-01-01' AND '2024-01-31' 
      ORDER BY date, id
    `);
    
    console.log('📊 January 2024 Individual Sales:');
    console.log(`Total records: ${janSales.length}\n`);
    
    janSales.forEach(sale => {
      console.log(`  ID: ${sale.id}, Dept: ${sale.department_id}, Amount: ₱${parseFloat(sale.amount).toLocaleString()}, Date: ${sale.date}`);
    });
    
    // Check December 2023 for comparison
    const [decSales] = await sequelize.query(`
      SELECT DATE(date) as day, COUNT(*) as count, SUM(amount) as total
      FROM sales 
      WHERE date BETWEEN '2023-12-01' AND '2023-12-31' 
      GROUP BY DATE(date)
      ORDER BY day
    `);
    
    console.log('\n📅 December 2023 Daily Totals:');
    if (decSales.length === 0) {
      console.log('   No data found');
    } else {
      decSales.forEach(day => {
        console.log(`   ${day.day}: ${day.count} sales, ₱${parseFloat(day.total).toLocaleString()}`);
      });
    }
    
    // Check how data is distributed by day across all months
    const [dailyDistribution] = await sequelize.query(`
      SELECT DAY(date) as day_of_month, COUNT(*) as occurrences
      FROM sales
      GROUP BY DAY(date)
      ORDER BY occurrences DESC
      LIMIT 10
    `);
    
    console.log('\n📈 Most Common Days (across all months):');
    dailyDistribution.forEach(d => {
      console.log(`   Day ${d.day_of_month}: ${d.occurrences} sales entries`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

analyzeSalesData();
