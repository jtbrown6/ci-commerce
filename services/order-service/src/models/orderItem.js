const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');
const { logger } = require('../utils/logger');
const { orderItemsPerOrder } = require('../utils/metrics');

// Define OrderItem model
const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Orders',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Reference to Product in the Product Service'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Product name at time of order'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    },
    comment: 'Product price at time of order'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    },
    comment: 'price * quantity'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Product metadata at time of order (size, color, etc.)'
  }
}, {
  hooks: {
    beforeValidate: (item) => {
      // Calculate subtotal if not provided
      if (!item.subtotal) {
        item.subtotal = parseFloat(item.price) * item.quantity;
      }
    },
    afterCreate: (item) => {
      logger.debug('Created order item', {
        orderItemId: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        subtotal: item.subtotal,
        component: 'order-item-model'
      });
    },
    afterBulkCreate: (items) => {
      // Count items for metrics if we have at least one item
      if (items && items.length > 0) {
        // Group items by order to update metrics
        const orderItems = {};
        
        items.forEach(item => {
          if (!orderItems[item.orderId]) {
            orderItems[item.orderId] = 0;
          }
          orderItems[item.orderId] += item.quantity;
        });
        
        // Update metrics for each order
        Object.entries(orderItems).forEach(([orderId, count]) => {
          orderItemsPerOrder.observe(count);
          logger.debug(`Order ${orderId} has ${count} items`, {
            component: 'order-item-model'
          });
        });
      }
    }
  }
});

module.exports = OrderItem;
