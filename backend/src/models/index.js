const sequelize = require('../config/database');
const logger = require('../config/logger');

const User = require('./User');
const Employee = require('./Employee');
const Product = require('./Product');

const models = {
  User,
  Employee,
  Product
};

// 同步所有模型
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');
    
    await sequelize.sync({ alter: true });
    logger.info('数据库模型同步完成');
  } catch (error) {
    logger.error('数据库同步失败:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  syncDatabase,
  ...models
};