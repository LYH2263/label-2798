const logger = require('../config/logger');
const { ValidationError, NotFoundError, UnauthorizedError } = require('../utils/errors');

/**
 * @description 统一错误处理中间件
 * @param {Error} err - 错误对象
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express next 函数
 * @returns {void}
 */
const errorHandler = (err, req, res, next) => {
  logger.error(`[${err.name || 'Error'}] ${err.message}`);

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message
    });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      status: 400,
      message: err.errors.map(e => e.message).join(', ')
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      status: 400,
      message: '数据已存在，请检查唯一字段'
    });
  }

  res.status(500).json({
    status: 500,
    message: '服务器内部错误'
  });
};

module.exports = errorHandler;
