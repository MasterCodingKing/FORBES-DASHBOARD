const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'First name is required' },
      is: {
        args: /^[a-zA-Z\s]+$/,
        msg: 'First name can only contain letters and spaces'
      }
    }
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Last name is required' },
      is: {
        args: /^[a-zA-Z\s]+$/,
        msg: 'Last name can only contain letters and spaces'
      }
    }
  },
  username: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: {
      msg: 'Username already exists'
    },
    validate: {
      notEmpty: { msg: 'Username is required' },
      len: {
        args: [3, 255],
        msg: 'Username must be at least 3 characters'
      },
      is: {
        args: /^[a-zA-Z0-9_]+$/,
        msg: 'Username can only contain letters, numbers, and underscores'
      }
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Password is required' },
      len: {
        args: [6, 255],
        msg: 'Password must be at least 6 characters'
      }
    }
  },
  is_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'user', 'viewer'),
    allowNull: false,
    defaultValue: 'user'
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    comment: 'JSON object with granular permissions'
  },
  allowed_modules: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    comment: 'JSON array of allowed module names (e.g., ["sales", "expenses", "dashboard"]). Null means all modules allowed.'
  },
  allowed_reports: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    comment: 'JSON array of allowed report IDs (e.g., ["monthly-expense", "ytd-sales"]). Null means all reports allowed.'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  remember_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance method to check password
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get safe user data (without password)
User.prototype.toSafeObject = function() {
  const { password, remember_token, ...safeUser } = this.toJSON();
  
  // Ensure JSON fields are properly parsed
  if (typeof safeUser.permissions === 'string') {
    try {
      safeUser.permissions = JSON.parse(safeUser.permissions);
    } catch (e) {
      safeUser.permissions = null;
    }
  }
  
  if (typeof safeUser.allowed_modules === 'string') {
    try {
      safeUser.allowed_modules = JSON.parse(safeUser.allowed_modules);
    } catch (e) {
      safeUser.allowed_modules = null;
    }
  }
  
  if (typeof safeUser.allowed_reports === 'string') {
    try {
      safeUser.allowed_reports = JSON.parse(safeUser.allowed_reports);
    } catch (e) {
      safeUser.allowed_reports = null;
    }
  }
  
  return safeUser;
};

module.exports = User;
