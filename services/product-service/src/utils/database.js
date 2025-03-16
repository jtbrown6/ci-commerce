const { Sequelize } = require('sequelize');
const config = require('../config/config');

// Create Sequelize instance
const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    logging: config.database.logging 
      ? console.log
      : false,
    dialectOptions: {
      ssl: config.database.ssl ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`[${new Date().toISOString()}] [INFO] Database connection has been established successfully.`);
    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Unable to connect to the database:`, error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection
};
