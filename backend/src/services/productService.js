const Joi = require('joi');
const { Op } = require('sequelize');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { buildPagination, calculateStockStatus } = require('../utils/helpers');

class ProductService {
  /**
   * @description 构造函数，通过依赖注入接收 Product 模型
   * @param {Object} productModel - Sequelize Product 模型
   */
  constructor(productModel) {
    this.productModel = productModel;
  }

  /**
   * @description 获取商品列表（分页、搜索）
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 分页商品列表
   * @throws {ValidationError} 参数验证失败
   */
  async getProducts(params) {
    const schema = Joi.object({
      keyword: Joi.string().allow('', null).default(''),
      category: Joi.string().allow('', null).default(''),
      status: Joi.string().valid('normal', 'low_stock', 'out_of_stock', 'discontinued', '').allow('', null).default(''),
      page: Joi.number().integer().min(1).default(1),
      pageSize: Joi.number().integer().min(1).max(100).default(10)
    });

    const { error, value } = schema.validate(params);
    if (error) throw new ValidationError(error.details.map(d => d.message).join(', '));

    const { page, pageSize, offset } = buildPagination(value);
    const where = {};

    if (value.keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${value.keyword}%` } },
        { productCode: { [Op.like]: `%${value.keyword}%` } }
      ];
    }
    if (value.category) where.category = value.category;
    if (value.status) where.status = value.status;

    const { count, rows } = await this.productModel.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return { list: rows, total: count, page, pageSize };
  }

  /**
   * @description 根据 ID 获取商品详情
   * @param {number} id - 商品 ID
   * @returns {Promise<Object>} 商品详情
   * @throws {NotFoundError} 商品不存在
   */
  async getProductById(id) {
    const schema = Joi.object({ id: Joi.number().integer().positive().required() });
    const { error } = schema.validate({ id });
    if (error) throw new ValidationError(error.details.map(d => d.message).join(', '));

    const product = await this.productModel.findByPk(id);
    if (!product) throw new NotFoundError('商品不存在');
    return product;
  }

  /**
   * @description 创建商品
   * @param {Object} data - 商品数据
   * @returns {Promise<Object>} 创建的商品
   * @throws {ValidationError} 数据验证失败
   */
  async createProduct(data) {
    const schema = Joi.object({
      productCode: Joi.string().min(2).max(50).required(),
      name: Joi.string().min(2).max(100).required(),
      category: Joi.string().required(),
      brand: Joi.string().allow('', null),
      unit: Joi.string().default('个'),
      price: Joi.number().min(0).required(),
      cost: Joi.number().min(0).allow(null),
      stock: Joi.number().integer().min(0).default(0),
      minStock: Joi.number().integer().min(0).default(10),
      maxStock: Joi.number().integer().min(0).default(1000),
      warehouse: Joi.string().allow('', null),
      location: Joi.string().allow('', null),
      supplier: Joi.string().allow('', null),
      description: Joi.string().allow('', null)
    });

    const { error, value } = schema.validate(data);
    if (error) throw new ValidationError(error.details.map(d => d.message).join(', '));

    const status = calculateStockStatus(value.stock, value.minStock);
    return await this.productModel.create({ ...value, status });
  }

  /**
   * @description 更新商品信息
   * @param {number} id - 商品 ID
   * @param {Object} data - 更新数据
   * @returns {Promise<Object>} 更新后的商品
   * @throws {NotFoundError} 商品不存在
   */
  async updateProduct(id, data) {
    const paramSchema = Joi.object({ id: Joi.number().integer().positive().required() });
    const { error: paramError } = paramSchema.validate({ id });
    if (paramError) throw new ValidationError(paramError.details.map(d => d.message).join(', '));

    const dataSchema = Joi.object({
      productCode: Joi.string().min(2).max(50),
      name: Joi.string().min(2).max(100),
      category: Joi.string(),
      brand: Joi.string().allow('', null),
      unit: Joi.string(),
      price: Joi.number().min(0),
      cost: Joi.number().min(0).allow(null),
      stock: Joi.number().integer().min(0),
      minStock: Joi.number().integer().min(0),
      maxStock: Joi.number().integer().min(0),
      warehouse: Joi.string().allow('', null),
      location: Joi.string().allow('', null),
      supplier: Joi.string().allow('', null),
      description: Joi.string().allow('', null)
    }).min(1);

    const { error: dataError, value } = dataSchema.validate(data);
    if (dataError) throw new ValidationError(dataError.details.map(d => d.message).join(', '));

    const product = await this.productModel.findByPk(id);
    if (!product) throw new NotFoundError('商品不存在');

    const mergedData = { ...product.dataValues, ...value };
    const status = calculateStockStatus(mergedData.stock, mergedData.minStock);
    await product.update({ ...value, status });
    return product;
  }

  /**
   * @description 删除商品
   * @param {number} id - 商品 ID
   * @returns {Promise<void>}
   * @throws {NotFoundError} 商品不存在
   */
  async deleteProduct(id) {
    const schema = Joi.object({ id: Joi.number().integer().positive().required() });
    const { error } = schema.validate({ id });
    if (error) throw new ValidationError(error.details.map(d => d.message).join(', '));

    const product = await this.productModel.findByPk(id);
    if (!product) throw new NotFoundError('商品不存在');

    await product.destroy();
  }

  /**
   * @description 更新商品库存
   * @param {number} id - 商品 ID
   * @param {string} type - 操作类型 (in/out)
   * @param {number} quantity - 数量
   * @returns {Promise<Object>} 更新后的商品
   * @throws {NotFoundError} 商品不存在
   * @throws {ValidationError} 库存不足或参数无效
   */
  async updateStock(id, type, quantity) {
    const schema = Joi.object({
      id: Joi.number().integer().positive().required(),
      type: Joi.string().valid('in', 'out').required(),
      quantity: Joi.number().integer().positive().required()
    });

    const { error } = schema.validate({ id, type, quantity });
    if (error) throw new ValidationError(error.details.map(d => d.message).join(', '));

    const product = await this.productModel.findByPk(id);
    if (!product) throw new NotFoundError('商品不存在');

    let newStock = parseInt(product.stock);
    if (type === 'in') {
      newStock += parseInt(quantity);
    } else {
      if (newStock < parseInt(quantity)) {
        throw new ValidationError('库存不足');
      }
      newStock -= parseInt(quantity);
    }

    const status = calculateStockStatus(newStock, product.minStock);
    await product.update({ stock: newStock, status });
    return product;
  }
}

module.exports = ProductService;
