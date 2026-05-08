const logger = require('../config/logger');
const {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError
} = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  logger.error(`[${err.name}] ${err.message}`);
  logger.error(err.stack);

  if (err instanceof ValidationError) {
    return res.status(400).json({
      status: 400,
      message: err.message
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      status: 404,
      message: err.message
    });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      status: 401,
      message: err.message
    });
  }

  if (err instanceof ForbiddenError) {
    return res.status(403).json({
      status: 403,
      message: err.message
    });
  }

  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(e => e.message);
    return res.status(400).json({
      status: 400,
      message: messages.join('; ')
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      status: 409,
      message: '数据已存在'
    });
  }

  res.status(500).json({
    status: 500,
    message: '服务器内部错误'
  });
};

module.exports = errorHandler;
