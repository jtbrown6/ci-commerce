const { sequelize } = require('../utils/database');
const User = require('./user');

// Define model associations here if needed
// For example:
// User.hasMany(SomeOtherModel);

// Export models
const models = {
  User
};

module.exports = {
  sequelize,
  models
};
