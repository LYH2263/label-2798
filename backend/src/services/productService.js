const { Op } = require('sequelize');
const { NotFoundError, ValidationError } = require('../utils/errors');
const productSchemas = require('../validations/productSchemas');

class ProductService {
  constructor(productModel, logger) {
    this.Product = productModel;
    this.logger = logger;
  }

  /**
   * @description 计算商品状态
   * @param {number} stock - 当前库存
   * @param {number} minStock - 最小库存阈值
   * @returns {string} 状态值
   */
  calculateStatus(stock, minStock = 10) {
    if (stock === 0) return 'out_of_stock';
    if (stock < minStock) return 'low_stock';
    return 'normal';
  }

  /**
   * @description 分页获取商品列表，支持搜索和筛选
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.pageSize=10] - 每页数量
   * @param {string} [params.keyword=''] - 搜索关键字（名称/编码）
   * @param {string} [params.category=''] - 分类筛选
   * @param {string} [params.status=''] - 状态筛选
   * @returns {Promise<Object>} 包含列表、总数、分页信息的对象
   * @throws {ValidationError} 参数验证失败时抛出
   */
  async findAll(params = {}) {
    const { error, value } = productSchemas.findAll.validate(params);
    if (error) {
      throw new ValidationError(error.details.map(d => d.message).join('; '));
    }

    const { page, pageSize, keyword, category, status } = value;
    const offset = (page - 1) * pageSize;

    const where = {};

    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { productCode: { [Op.like]: `%${keyword}%` } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    const { count, rows } = await this.Product.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [['createdAt', 'DESC']]
    });

    this.logger.info(`获取商品列表: 共 ${count} 条记录`);

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  /**
   * @description 根据ID获取商品详情
   * @param {number} id - 商品ID
   * @returns {Promise<Object>} 商品对象
   * @throws {NotFoundError} 商品不存在时抛出
   */
  async findById(id) {
    const product = await this.Product.findByPk(id);
    if (!product) {
      throw new NotFoundError('商品不存在');
    }
    return product;
  }

  /**
   * @description 创建新商品
   * @param {Object} data - 商品数据
   * @returns {Promise<Object>} 创建的商品对象
   * @throws {ValidationError} 数据验证失败时抛出
   */
  async create(data) {
    const { error, value } = productSchemas.create.validate(data);
    if (error) {
      throw new ValidationError(error.details.map(d => d.message).join('; '));
    }

    const status = this.calculateStatus(value.stock, value.minStock);
    const product = await this.Product.create({ ...value, status });

    this.logger.info(`创建商品: ${product.name}`);
    return product;
  }

  /**
   * @description 更新商品信息
   * @param {number} id - 商品ID
   * @param {Object} data - 更新数据
   * @returns {Promise<Object>} 更新后的商品对象
   * @throws {NotFoundError} 商品不存在时抛出
   * @throws {ValidationError} 数据验证失败时抛出
   */
  async update(id, data) {
    const product = await this.findById(id);

    const { error, value } = productSchemas.update.validate(data);
    if (error) {
      throw new ValidationError(error.details.map(d => d.message).join('; '));
    }

    const existing = product.dataValues;
    const merged = { ...existing, ...value };
    const status = this.calculateStatus(merged.stock, merged.minStock);

    await product.update({ ...value, status });
    this.logger.info(`更新商品: ${product.name}`);
    return product;
  }

  /**
   * @description 删除商品
   * @param {number} id - 商品ID
   * @returns {Promise<void>}
   * @throws {NotFoundError} 商品不存在时抛出
   */
  async delete(id) {
    const product = await this.findById(id);
    await product.destroy();
    this.logger.info(`删除商品: ${product.name}`);
  }

  /**
   * @description 更新商品库存（入库/出库）
   * @param {number} id - 商品ID
   * @param {Object} data - 库存操作数据
   * @param {number} data.quantity - 操作数量
   * @param {string} data.type - 操作类型：'in' 入库，'out' 出库
   * @returns {Promise<Object>} 更新后的商品对象
   * @throws {NotFoundError} 商品不存在时抛出
   * @throws {ValidationError} 数据验证失败或库存不足时抛出
   */
  async updateStock(id, data) {
    const product = await this.findById(id);

    const { error, value } = productSchemas.updateStock.validate(data);
    if (error) {
      throw new ValidationError(error.details.map(d => d.message).join('; '));
    }

    const { quantity, type } = value;
    let newStock = parseInt(product.stock);

    if (type === 'in') {
      newStock += quantity;
    } else if (type === 'out') {
      if (newStock < quantity) {
        throw new ValidationError('库存不足');
      }
      newStock -= quantity;
    }

    const status = this.calculateStatus(newStock, product.minStock);
    await product.update({ stock: newStock, status });

    this.logger.info(`更新商品库存: ${product.name}, 数量: ${quantity}, 类型: ${type}`);
    return product;
  }
}

module.exports = ProductService;
