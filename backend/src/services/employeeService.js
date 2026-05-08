const { Op } = require('sequelize');
const Joi = require('joi');
const { NotFoundError, ValidationError } = require('../utils/errors');

const findAllSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
  keyword: Joi.string().allow('').default(''),
  department: Joi.string().allow('').default(''),
  status: Joi.string().allow('').default('')
});

const createSchema = Joi.object({
  employeeNo: Joi.string().required(),
  name: Joi.string().required(),
  gender: Joi.string().valid('male', 'female').required(),
  age: Joi.number().integer().min(18).max(65).required(),
  department: Joi.string().required(),
  position: Joi.string().required(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).allow('').optional(),
  email: Joi.string().email().allow('').optional(),
  hireDate: Joi.date().optional(),
  status: Joi.string().valid('active', 'resigned', 'on_leave').default('active')
});

const updateSchema = Joi.object({
  employeeNo: Joi.string().optional(),
  name: Joi.string().optional(),
  gender: Joi.string().valid('male', 'female').optional(),
  age: Joi.number().integer().min(18).max(65).optional(),
  department: Joi.string().optional(),
  position: Joi.string().optional(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).allow('').optional(),
  email: Joi.string().email().allow('').optional(),
  hireDate: Joi.date().optional(),
  status: Joi.string().valid('active', 'resigned', 'on_leave').optional()
});

class EmployeeService {
  constructor(employeeModel, logger) {
    this.Employee = employeeModel;
    this.logger = logger;
  }

  /**
   * @description 分页获取员工列表，支持搜索和筛选
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.pageSize=10] - 每页数量
   * @param {string} [params.keyword=''] - 搜索关键字（姓名/工号）
   * @param {string} [params.department=''] - 部门筛选
   * @param {string} [params.status=''] - 状态筛选
   * @returns {Promise<Object>} 包含列表、总数、分页信息的对象
   * @throws {ValidationError} 参数验证失败时抛出
   */
  async findAll(params = {}) {
    const { error, value } = findAllSchema.validate(params);
    if (error) {
      throw new ValidationError(error.details.map(d => d.message).join('; '));
    }

    const { page, pageSize, keyword, department, status } = value;
    const offset = (page - 1) * pageSize;

    const where = {};

    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { employeeNo: { [Op.like]: `%${keyword}%` } }
      ];
    }

    if (department) {
      where.department = department;
    }

    if (status) {
      where.status = status;
    }

    const { count, rows } = await this.Employee.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [['createdAt', 'DESC']]
    });

    this.logger.info(`获取员工列表: 共 ${count} 条记录`);

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  /**
   * @description 根据ID获取员工详情
   * @param {number} id - 员工ID
   * @returns {Promise<Object>} 员工对象
   * @throws {NotFoundError} 员工不存在时抛出
   */
  async findById(id) {
    const employee = await this.Employee.findByPk(id);
    if (!employee) {
      throw new NotFoundError('员工不存在');
    }
    return employee;
  }

  /**
   * @description 创建新员工
   * @param {Object} data - 员工数据
   * @returns {Promise<Object>} 创建的员工对象
   * @throws {ValidationError} 数据验证失败时抛出
   */
  async create(data) {
    const { error, value } = createSchema.validate(data);
    if (error) {
      throw new ValidationError(error.details.map(d => d.message).join('; '));
    }

    const employee = await this.Employee.create(value);
    this.logger.info(`创建员工: ${employee.name}`);
    return employee;
  }

  /**
   * @description 更新员工信息
   * @param {number} id - 员工ID
   * @param {Object} data - 更新数据
   * @returns {Promise<Object>} 更新后的员工对象
   * @throws {NotFoundError} 员工不存在时抛出
   * @throws {ValidationError} 数据验证失败时抛出
   */
  async update(id, data) {
    const employee = await this.findById(id);

    const { error, value } = updateSchema.validate(data);
    if (error) {
      throw new ValidationError(error.details.map(d => d.message).join('; '));
    }

    await employee.update(value);
    this.logger.info(`更新员工: ${employee.name}`);
    return employee;
  }

  /**
   * @description 删除员工
   * @param {number} id - 员工ID
   * @returns {Promise<void>}
   * @throws {NotFoundError} 员工不存在时抛出
   */
  async delete(id) {
    const employee = await this.findById(id);
    await employee.destroy();
    this.logger.info(`删除员工: ${employee.name}`);
  }
}

module.exports = EmployeeService;
