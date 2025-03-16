const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');
const config = require('../config/config');

// Define Cart model
const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Reference to User in the User Service'
  },
  status: {
    type: DataTypes.ENUM('active', 'abandoned', 'converted'),
    defaultValue: 'active',
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'When the cart should expire if not converted to an order'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  hooks: {
    beforeCreate: (cart) => {
      // Set expiration date if not provided
      if (!cart.expiresAt) {
        const expirationDays = config.cart.expirationInDays;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expirationDays);
        cart.expiresAt = expiresAt;
      }
      
      console.log(`[${new Date().toISOString()}] [INFO] Creating new cart for user: ${cart.userId}`);
    },
    afterCreate: (cart) => {
      console.log(`[${new Date().toISOString()}] [INFO] Cart created: ${cart.id} for user ${cart.userId}`);
    },
    beforeUpdate: (cart) => {
      if (cart.changed('status')) {
        const oldStatus = cart._previousDataValues.status;
        const newStatus = cart.status;
        console.log(`[${new Date().toISOString()}] [INFO] Cart ${cart.id} status changing from ${oldStatus} to ${newStatus}`);
      }
    }
  }
});

module.exports = Cart;
