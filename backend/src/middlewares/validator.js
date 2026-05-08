const { ValidationError } = require('../utils/errors');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const data = req[source];
      const { error } = schema.validate(data, {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true
      });

      if (error) {
        const messages = error.details.map(d => d.message);
        throw new ValidationError(messages.join('; '));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

const validateBody = (schema) => validate(schema, 'body');
const validateQuery = (schema) => validate(schema, 'query');
const validateParams = (schema) => validate(schema, 'params');

module.exports = {
  validate,
  validateBody,
  validateQuery,
  validateParams
};
