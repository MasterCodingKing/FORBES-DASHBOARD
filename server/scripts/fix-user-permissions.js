const { User } = require('../models');
const { DEFAULT_PERMISSIONS } = require('../middleware/permissionMiddleware');

async function fixUserPermissions() {
  try {
    console.log('Fixing user permissions...');
    
    // Get user with ID 1 (Admin User)
    const user = await User.findByPk(1);
    
    if (!user) {
      console.error('User with ID 1 not found');
      process.exit(1);
    }
    
    console.log(`Found user: ${user.username} (${user.first_name} ${user.last_name})`);
    console.log('Current role:', user.role);
    console.log('Current permissions:', JSON.stringify(user.permissions, null, 2));
    console.log('Current allowed_modules:', user.allowed_modules);
    
    // Update to admin role and give all permissions
    await user.update({
      role: 'admin',
      is_admin: true,
      permissions: null, // Null permissions for admin means all permissions
      allowed_modules: null // Null modules means access to all modules
    });
    
    console.log('\n✓ User permissions updated successfully!');
    console.log('New role:', user.role);
    console.log('New permissions: null (all permissions granted via admin role)');
    console.log('New allowed_modules: null (all modules accessible)');
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing user permissions:', error);
    process.exit(1);
  }
}

fixUserPermissions();
