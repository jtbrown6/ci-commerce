const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');
const { logger } = require('../utils/logger');
const { newOrdersCounter, failedOrdersCounter } = require('../utils/metrics');

// Order statuses
const ORDER_STATUS = {
  CREATED: 'created',
  PENDING: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  FAILED: 'failed'
};

// Payment methods
const PAYMENT_METHOD = {
  CREDIT_CARD: 'credit_card',
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
  CRYPTO: 'crypto'
};

// Define Order model
const Order = sequelize.define('Order', {
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
    type: DataTypes.ENUM(Object.values(ORDER_STATUS)),
    defaultValue: ORDER_STATUS.CREATED,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  shipping: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  shippingAddress: {
    type: DataTypes.JSONB,
    allowNull: false,
    validate: {
      hasRequiredFields(value) {
        const requiredFields = ['street', 'city', 'state', 'postalCode', 'country'];
        for (const field of requiredFields) {
          if (!value[field]) {
            throw new Error(`Shipping address missing required field: ${field}`);
          }
        }
      }
    }
  },
  billingAddress: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  paymentMethod: {
    type: DataTypes.ENUM(Object.values(PAYMENT_METHOD)),
    allowNull: true
  },
  paymentId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Reference to Payment in the Payment Service'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  // Tracking when status changes for metrics
  statusHistory: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  }
}, {
  hooks: {
    beforeCreate: (order) => {
      // Add initial status to history
      order.statusHistory = [{
        status: order.status,
        timestamp: new Date().toISOString()
      }];
      
      logger.info('Creating new order', {
        userId: order.userId,
        totalAmount: order.totalAmount,
        component: 'order-model'
      });
      
      // Increment new orders counter
      newOrdersCounter.inc();
    },
    beforeUpdate: (order) => {
      // Track status changes
      if (order.changed('status')) {
        const oldStatus = order._previousDataValues.status;
        const newStatus = order.status;
        
        // Add to status history
        order.statusHistory = [
          ...order.statusHistory,
          {
            status: newStatus,
            timestamp: new Date().toISOString(),
            previousStatus: oldStatus
          }
        ];
        
        logger.info('Order status changed', {
          orderId: order.id,
          oldStatus,
          newStatus,
          component: 'order-model'
        });
        
        // Track failed orders in metrics
        if (newStatus === ORDER_STATUS.FAILED) {
          failedOrdersCounter.inc({ reason: 'status_change' });
        }
      }
    },
    afterFind: (result) => {
      if (!result) return result;
      
      // If result is an array (findAll)
      if (Array.isArray(result)) {
        logger.debug(`Retrieved ${result.length} orders`);
      } else {
        // Single order found
        logger.debug(`Retrieved order ${result.id}`);
      }
      
      return result;
    }
  }
});

module.exports = {
  Order,
  ORDER_STATUS,
  PAYMENT_METHOD
};
