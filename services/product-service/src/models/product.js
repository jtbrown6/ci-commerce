const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  stockQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  dimensions: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      length: 0,
      width: 0,
      height: 0
    }
  },
  features: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  hooks: {
    beforeCreate: (product) => {
      if (!product.slug) {
        product.slug = product.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      
      console.log(`[${new Date().toISOString()}] [INFO] Creating new product: ${product.name} (SKU: ${product.sku})`);
    },
    afterCreate: (product) => {
      console.log(`[${new Date().toISOString()}] [INFO] Product created: ${product.id} - ${product.name}`);
    },
    afterUpdate: (product) => {
      console.log(`[${new Date().toISOString()}] [INFO] Product updated: ${product.id} - ${product.name}`);
      
      if (product.changed('stockQuantity')) {
        const oldValue = product._previousDataValues.stockQuantity;
        const newValue = product.stockQuantity;
        
        console.log(`[${new Date().toISOString()}] [INFO] Stock quantity changed for product ${product.id} - ${product.name}: ${oldValue} → ${newValue}`);
        
        if (newValue <= 5 && newValue > 0) {
          console.log(`[${new Date().toISOString()}] [WARN] Low stock alert for product ${product.id} - ${product.name}: ${newValue} units remaining`);
        } else if (newValue === 0) {
          console.log(`[${new Date().toISOString()}] [WARN] Out of stock alert for product ${product.id} - ${product.name}`);
        }
      }
    }
  }
});

module.exports = Product;
