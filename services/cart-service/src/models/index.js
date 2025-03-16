const { sequelize, Sequelize } = require('../utils/database');
const Cart = require('./cart');
const CartItem = require('./cartItem');

// Define model associations
// A Cart has many CartItems
Cart.hasMany(CartItem, {
  foreignKey: 'cartId',
  as: 'items',
  onDelete: 'CASCADE'
});

// A CartItem belongs to a Cart
CartItem.belongsTo(Cart, {
  foreignKey: 'cartId',
  as: 'cart'
});

// Export models
const models = {
  Cart,
  CartItem
};

module.exports = {
  sequelize,
  Sequelize,
  models
};
