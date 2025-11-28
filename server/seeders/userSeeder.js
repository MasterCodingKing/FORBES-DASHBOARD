const { User } = require('../models');

const users = [
  {
    first_name: 'Admin',
    last_name: 'User',
    username: 'admin',
    password: 'password123',
    is_admin: true
  },
  {
    first_name: 'John',
    last_name: 'Doe',
    username: 'johndoe',
    password: 'password123',
    is_admin: false
  },
  {
    first_name: 'Jane',
    last_name: 'Smith',
    username: 'janesmith',
    password: 'password123',
    is_admin: false
  }
];

const seedUsers = async () => {
  try {
    // Check if users already exist
    const existingCount = await User.count();
    
    if (existingCount > 0) {
      console.log('⏩ Users already seeded, skipping...');
      return;
    }

    // Create users one by one to trigger password hashing hooks
    for (const userData of users) {
      await User.create(userData);
    }
    
    console.log('✅ Users seeded successfully');
    console.log('📝 Admin credentials: username=admin, password=password123');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

module.exports = { seedUsers, users };
