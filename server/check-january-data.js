require('dotenv').config();
const { sequelize } = require('./config/database');

async function checkJanuaryData() {
  try {
    console.log('🔍 Checking January 2024 sales data...\n');
    
    // Check all sales in January 2024
    const [januarySales] = await sequelize.query(`
      SELECT date, COUNT(*) as count, SUM(amount) as total 
      FROM sales 
      WHERE date BETWEEN '2024-01-01' AND '2024-01-31' 
      GROUP BY date 
      ORDER BY date
    `);
    
    console.log('📊 January 2024 Sales by Date:');
    if (januarySales.length === 0) {
      console.log('   ❌ No sales data found for January 2024');
    } else {
      januarySales.forEach(row => {
        console.log(`   ${row.date}: ${row.count} sales, Total: ₱${parseFloat(row.total).toLocaleString()}`);
      });
      const totalAmount = januarySales.reduce((sum, row) => sum + parseFloat(row.total), 0);
      console.log(`\n   📈 Total: ${januarySales.length} days with data, ₱${totalAmount.toLocaleString()}`);
    }
    
    // Check date range of all sales
    const [dateRange] = await sequelize.query(`
      SELECT 
        MIN(date) as earliest_sale,
        MAX(date) as latest_sale,
        COUNT(*) as total_sales
      FROM sales
    `);
    
    console.log('\n📅 Overall Sales Date Range:');
    console.log(`   Earliest: ${dateRange[0].earliest_sale}`);
    console.log(`   Latest: ${dateRange[0].latest_sale}`);
    console.log(`   Total Sales: ${dateRange[0].total_sales}`);
    
    // Check sales by month for 2024
    const [monthlySales] = await sequelize.query(`
      SELECT 
        YEAR(date) as year,
        MONTH(date) as month,
        COUNT(*) as count,
        SUM(amount) as total
      FROM sales 
      WHERE YEAR(date) = 2024
      GROUP BY YEAR(date), MONTH(date)
      ORDER BY month
    `);
    
    console.log('\n📆 2024 Sales by Month:');
    if (monthlySales.length === 0) {
      console.log('   ❌ No sales data found for 2024');
    } else {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      monthlySales.forEach(row => {
        console.log(`   ${monthNames[row.month - 1]} 2024: ${row.count} sales, Total: ₱${parseFloat(row.total).toLocaleString()}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkJanuaryData();
