const { sequelize } = require('./config/database');
const { Sale, Department } = require('./models');

/**
 * Script to import backup data and distribute monthly totals across daily entries
 * This creates realistic daily data from monthly aggregates
 */

async function importAndDistributeSales() {
  try {
    console.log('🚀 Starting sales data import and distribution...\n');

    // Step 1: Clear existing sales data
    console.log('🗑️  Clearing existing sales data...');
    await Sale.destroy({ where: {}, truncate: true });
    console.log('✅ Existing data cleared\n');

    // Step 2: Import the backup data from SQL file
    console.log('📥 Importing backup data...');
    const fs = require('fs');
    const path = require('path');
    
    const backupFile = path.join(__dirname, '../backupforbesdashboardsales-5.sql');
    
    if (!fs.existsSync(backupFile)) {
      throw new Error('Backup file not found: ' + backupFile);
    }

    // Read and parse the SQL file
    const sqlContent = fs.readFileSync(backupFile, 'utf8');
    
    // Extract INSERT statements
    const insertMatch = sqlContent.match(/INSERT INTO `sales`[^;]+;/gs);
    
    if (!insertMatch) {
      throw new Error('No INSERT statements found in backup file');
    }

    // Parse the values from INSERT statements
    const valueRegex = /\((\d+),\s*(\d+),\s*([\d.-]+),\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'\)/g;
    const backupSales = [];
    
    insertMatch.forEach(statement => {
      let match;
      while ((match = valueRegex.exec(statement)) !== null) {
        backupSales.push({
          id: parseInt(match[1]),
          department_id: parseInt(match[2]),
          amount: parseFloat(match[3]),
          date: match[4],
          created_at: match[5],
          updated_at: match[6]
        });
      }
    });

    console.log(`📊 Found ${backupSales.length} sales records in backup\n`);

    // Step 3: Group by department, year, and month
    console.log('📈 Distributing monthly totals across daily entries...');
    
    const monthlyTotals = {};
    
    backupSales.forEach(sale => {
      const date = new Date(sale.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${sale.department_id}-${year}-${month}`;
      
      if (!monthlyTotals[key]) {
        monthlyTotals[key] = {
          department_id: sale.department_id,
          year: year,
          month: month,
          total: 0
        };
      }
      
      monthlyTotals[key].total += sale.amount;
    });

    // Step 4: Create daily entries by distributing the monthly total
    const dailySales = [];
    
    for (const [key, monthData] of Object.entries(monthlyTotals)) {
      const { department_id, year, month, total } = monthData;
      
      // Get number of days in this month
      const daysInMonth = new Date(year, month, 0).getDate();
      
      // Generate random weights for each day (to make it look more natural)
      const weights = [];
      let totalWeight = 0;
      
      for (let day = 1; day <= daysInMonth; day++) {
        // Create variation in daily sales (some days are busier than others)
        const weight = Math.random() * 0.8 + 0.6; // Random between 0.6 and 1.4
        weights.push(weight);
        totalWeight += weight;
      }
      
      // Distribute the total amount across days using the weights
      let distributedTotal = 0;
      
      for (let day = 1; day <= daysInMonth; day++) {
        const weight = weights[day - 1];
        let dailyAmount;
        
        // For the last day, use the remaining amount to ensure exact total
        if (day === daysInMonth) {
          dailyAmount = total - distributedTotal;
        } else {
          dailyAmount = (total * weight) / totalWeight;
          distributedTotal += dailyAmount;
        }
        
        // Round to 2 decimal places
        dailyAmount = Math.round(dailyAmount * 100) / 100;
        
        // Create date string
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        dailySales.push({
          department_id: department_id,
          amount: dailyAmount,
          date: dateStr,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }

    console.log(`📅 Created ${dailySales.length} daily entries from ${Object.keys(monthlyTotals).length} monthly totals`);

    // Step 5: Insert the daily sales data
    console.log('💾 Inserting daily sales data into database...');
    
    // Insert in batches to avoid memory issues
    const batchSize = 500;
    for (let i = 0; i < dailySales.length; i += batchSize) {
      const batch = dailySales.slice(i, i + batchSize);
      await Sale.bulkCreate(batch);
      console.log(`   Inserted ${Math.min(i + batchSize, dailySales.length)}/${dailySales.length} records`);
    }

    console.log('\n✅ Sales data import and distribution completed successfully!');
    console.log(`📊 Total daily sales entries: ${dailySales.length}`);
    
    // Verify the data
    console.log('\n🔍 Verifying data...');
    const totalSales = await Sale.count();
    const sampleSales = await Sale.findAll({
      where: {
        date: {
          [require('sequelize').Op.between]: ['2024-01-01', '2024-01-31']
        }
      },
      order: [['date', 'ASC']],
      limit: 5
    });
    
    console.log(`✓ Total sales records in database: ${totalSales}`);
    console.log('\n📅 Sample January 2024 entries:');
    sampleSales.forEach(sale => {
      console.log(`   ${sale.date} - Dept ${sale.department_id}: ₱${parseFloat(sale.amount).toLocaleString()}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the import
importAndDistributeSales();
