const { ValidationError } = require('../utils/errors');

/**
 * @description 创建请求数据验证中间件
 * @param {Object} schema - Joi 验证模式对象，可包含 body、query、params
 * @returns {Function} Express 中间件函数
 */
const validator = (schema) => {
  return async (req, res, next) => {
    try {
      const validationOptions = {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: false
      };

      if (schema.body) {
        const { error } = schema.body.validate(req.body, validationOptions);
        if (error) {
          throw new ValidationError(error.details.map(d => d.message).join(', '));
        }
      }

      if (schema.query) {
        const { error } = schema.query.validate(req.query, validationOptions);
        if (error) {
          throw new ValidationError(error.details.map(d => d.message).join(', '));
        }
      }

      if (schema.params) {
        const { error } = schema.params.validate(req.params, validationOptions);
        if (error) {
          throw new ValidationError(error.details.map(d => d.message).join(', '));
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = validator;
