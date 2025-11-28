const { Department } = require('../models');

const departments = [
  { name: 'Web Development', description: 'Website design and development services' },
  { name: 'Mobile Apps', description: 'iOS and Android application development' },
  { name: 'Cloud Services', description: 'Cloud infrastructure and hosting solutions' },
  { name: 'Consulting', description: 'IT consulting and strategy services' },
  { name: 'Support', description: 'Technical support and maintenance services' },
  { name: 'Training', description: 'IT training and workshop services' },
  { name: 'Security', description: 'Cybersecurity and audit services' },
  { name: 'Data Analytics', description: 'Data analysis and business intelligence' }
];

const seedDepartments = async () => {
  try {
    // Check if departments already exist
    const existingCount = await Department.count();
    
    if (existingCount > 0) {
      console.log('⏩ Departments already seeded, skipping...');
      return;
    }

    await Department.bulkCreate(departments);
    console.log('✅ Departments seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding departments:', error);
    throw error;
  }
};

module.exports = { seedDepartments, departments };
