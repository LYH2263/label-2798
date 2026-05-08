const Joi = require('joi');
const logger = require('../config/logger');
const { validateBody } = require('../middlewares/validator');

const createSchema = Joi.object({
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
});

const updateSchema = Joi.object({
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
});

const updateStockSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
  type: Joi.string().valid('in', 'out').required()
});

class ProductController {
  constructor(productService) {
    this.service = productService;
  }

  /**
   * @description 获取商品列表（分页、搜索）
   * @param {Object} req - Express 请求对象
   * @param {Object} res - Express 响应对象
   * @param {Function} next - Express 中间件函数
   * @returns {Promise<void>}
   */
  async findAll(req, res, next) {
    try {
      const result = await this.service.findAll(req.query);
      res.json({
        status: 200,
        data: result,
        message: '获取成功'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 获取单个商品详情
   * @param {Object} req - Express 请求对象
   * @param {Object} res - Express 响应对象
   * @param {Function} next - Express 中间件函数
   * @returns {Promise<void>}
   */
  async findById(req, res, next) {
    try {
      const product = await this.service.findById(req.params.id);
      res.json({
        status: 200,
        data: product,
        message: '获取成功'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 创建商品
   * @param {Object} req - Express 请求对象
   * @param {Object} res - Express 响应对象
   * @param {Function} next - Express 中间件函数
   * @returns {Promise<void>}
   */
  async create(req, res, next) {
    try {
      const product = await this.service.create(req.body);
      res.status(201).json({
        status: 201,
        data: product,
        message: '创建成功'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 更新商品信息
   * @param {Object} req - Express 请求对象
   * @param {Object} res - Express 响应对象
   * @param {Function} next - Express 中间件函数
   * @returns {Promise<void>}
   */
  async update(req, res, next) {
    try {
      const product = await this.service.update(req.params.id, req.body);
      res.json({
        status: 200,
        data: product,
        message: '更新成功'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 删除商品
   * @param {Object} req - Express 请求对象
   * @param {Object} res - Express 响应对象
   * @param {Function} next - Express 中间件函数
   * @returns {Promise<void>}
   */
  async delete(req, res, next) {
    try {
      await this.service.delete(req.params.id);
      res.json({
        status: 200,
        message: '删除成功'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 更新商品库存
   * @param {Object} req - Express 请求对象
   * @param {Object} res - Express 响应对象
   * @param {Function} next - Express 中间件函数
   * @returns {Promise<void>}
   */
  async updateStock(req, res, next) {
    try {
      const product = await this.service.updateStock(req.params.id, req.body);
      res.json({
        status: 200,
        data: product,
        message: '库存更新成功'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = {
  ProductController,
  createValidator: validateBody(createSchema),
  updateValidator: validateBody(updateSchema),
  updateStockValidator: validateBody(updateStockSchema)
};
