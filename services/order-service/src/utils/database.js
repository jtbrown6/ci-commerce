const { Sequelize } = require('sequelize');
const config = require('../config/config');
const { logger } = require('./logger');

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
      ? (msg) => logger.debug(msg, { component: 'database' }) 
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
    logger.info('Database connection has been established successfully.', { component: 'database' });
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database:', { 
      error: error.message, 
      stack: error.stack,
      component: 'database'
    });
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  Sequelize // Export Sequelize constructor too
};
