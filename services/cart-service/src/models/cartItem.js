const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

// Define CartItem model
const CartItem = sequelize.define('CartItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  cartId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Carts',
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
    comment: 'Product name at time of cart addition'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    },
    comment: 'Product price at time of cart addition'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Product metadata at time of cart addition (size, color, etc.)'
  }
}, {
  hooks: {
    beforeCreate: (item) => {
      console.log(`[${new Date().toISOString()}] [INFO] Adding item to cart ${item.cartId}: ${item.productId} (${item.quantity} x ${item.price})`);
    },
    afterCreate: (item) => {
      console.log(`[${new Date().toISOString()}] [INFO] Item ${item.id} added to cart ${item.cartId}`);
    },
    beforeUpdate: (item) => {
      if (item.changed('quantity')) {
        const oldQuantity = item._previousDataValues.quantity;
        const newQuantity = item.quantity;
        console.log(`[${new Date().toISOString()}] [INFO] Cart item ${item.id} quantity updated from ${oldQuantity} to ${newQuantity}`);
      }
    },
    beforeDestroy: (item) => {
      console.log(`[${new Date().toISOString()}] [INFO] Removing item ${item.id} from cart ${item.cartId}`);
    }
  }
});

module.exports = CartItem;
