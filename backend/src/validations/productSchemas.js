const Joi = require('joi');

const productSchemas = {
  findAll: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(10),
    keyword: Joi.string().allow('').default(''),
    category: Joi.string().allow('').default(''),
    status: Joi.string().allow('').default('')
  }),

  create: Joi.object({
    productCode: Joi.string().required(),
    name: Joi.string().required(),
    category: Joi.string().required(),
    brand: Joi.string().allow('').optional(),
    unit: Joi.string().default('个'),
    price: Joi.number().min(0).required(),
    cost: Joi.number().min(0).optional(),
    stock: Joi.number().integer().min(0).default(0),
    minStock: Joi.number().integer().min(0).default(10),
    maxStock: Joi.number().integer().min(0).default(1000),
    warehouse: Joi.string().allow('').optional(),
    location: Joi.string().allow('').optional(),
    supplier: Joi.string().allow('').optional(),
    description: Joi.string().allow('').optional()
  }),

  update: Joi.object({
    productCode: Joi.string().optional(),
    name: Joi.string().optional(),
    category: Joi.string().optional(),
    brand: Joi.string().allow('').optional(),
    unit: Joi.string().optional(),
    price: Joi.number().min(0).optional(),
    cost: Joi.number().min(0).optional(),
    stock: Joi.number().integer().min(0).optional(),
    minStock: Joi.number().integer().min(0).optional(),
    maxStock: Joi.number().integer().min(0).optional(),
    warehouse: Joi.string().allow('').optional(),
    location: Joi.string().allow('').optional(),
    supplier: Joi.string().allow('').optional(),
    description: Joi.string().allow('').optional()
  }),

  updateStock: Joi.object({
    quantity: Joi.number().integer().min(1).required(),
    type: Joi.string().valid('in', 'out').required()
  })
};

module.exports = productSchemas;
