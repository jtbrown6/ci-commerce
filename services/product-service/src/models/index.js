const { sequelize } = require('../utils/database');
const Category = require('./category');
const Product = require('./product');

// Define model associations
// A Product can belong to many Categories
// A Category can have many Products
Product.belongsToMany(Category, { 
  through: 'ProductCategory',
  as: 'categories'
});

Category.belongsToMany(Product, { 
  through: 'ProductCategory',
  as: 'products'
});

// Export models
const models = {
  Category,
  Product
};

module.exports = {
  sequelize,
  models
};
