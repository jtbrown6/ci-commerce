const { sequelize, Sequelize } = require('../utils/database');
const { Order, ORDER_STATUS, PAYMENT_METHOD } = require('./order');
const OrderItem = require('./orderItem');

// Define model associations
// An Order has many OrderItems
Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'items',
  onDelete: 'CASCADE'
});

// An OrderItem belongs to an Order
OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order'
});

// Export models and constants
const models = {
  Order,
  OrderItem
};

// Export status and payment enums
const constants = {
  ORDER_STATUS,
  PAYMENT_METHOD
};

module.exports = {
  sequelize,
  Sequelize,
  models,
  constants
};
