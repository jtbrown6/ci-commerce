const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../utils/database');
const { logger } = require('../utils/logger');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    afterCreate: (user) => {
      logger.info('New user created', {
        userId: user.id,
        username: user.username,
        email: user.email
      });
    }
  }
});

// Instance method to check password
User.prototype.isValidPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Static method to find user by credentials
User.findByCredentials = async function(login, password) {
  try {
    // Check if login is email or username
    const user = await this.findOne({
      where: {
        [sequelize.Op.or]: [
          { email: login },
          { username: login }
        ]
      }
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await user.isValidPassword(password);
    
    if (!isPasswordValid) {
      return null;
    }

    return user;
  } catch (error) {
    logger.error('Error finding user by credentials', { error: error.message });
    throw error;
  }
};

module.exports = User;
