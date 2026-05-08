const Joi = require('joi');
const { Op } = require('sequelize');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { buildPagination } = require('../utils/helpers');

class EmployeeService {
  /**
   * @description 构造函数，通过依赖注入接收 Employee 模型
   * @param {Object} employeeModel - Sequelize Employee 模型
   */
  constructor(employeeModel) {
    this.employeeModel = employeeModel;
  }

  /**
   * @description 获取员工列表（分页、搜索）
   * @param {Object} params - 查询参数
   * @param {string} params.keyword - 搜索关键字
   * @param {string} params.department - 部门筛选
   * @param {string} params.status - 状态筛选
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页条数
   * @returns {Promise<Object>} 分页员工列表
   * @throws {ValidationError} 参数验证失败
   */
  async getEmployees(params) {
    const schema = Joi.object({
      keyword: Joi.string().allow('', null).default(''),
      department: Joi.string().allow('', null).default(''),
      status: Joi.string().valid('active', 'resigned', 'on_leave', '').allow('', null).default(''),
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
        { employeeNo: { [Op.like]: `%${value.keyword}%` } }
      ];
    }
    if (value.department) where.department = value.department;
    if (value.status) where.status = value.status;

    const { count, rows } = await this.employeeModel.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return { list: rows, total: count, page, pageSize };
  }

  /**
   * @description 根据 ID 获取员工详情
   * @param {number} id - 员工 ID
   * @returns {Promise<Object>} 员工详情
   * @throws {NotFoundError} 员工不存在
   */
  async getEmployeeById(id) {
    const schema = Joi.object({ id: Joi.number().integer().positive().required() });
    const { error } = schema.validate({ id });
    if (error) throw new ValidationError(error.details.map(d => d.message).join(', '));

    const employee = await this.employeeModel.findByPk(id);
    if (!employee) throw new NotFoundError('员工不存在');
    return employee;
  }

  /**
   * @description 创建员工
   * @param {Object} data - 员工数据
   * @returns {Promise<Object>} 创建的员工
   * @throws {ValidationError} 数据验证失败
   */
  async createEmployee(data) {
    const schema = Joi.object({
      employeeNo: Joi.string().min(3).max(20).required(),
      name: Joi.string().min(2).max(20).required(),
      gender: Joi.string().valid('male', 'female').required(),
      age: Joi.number().integer().min(18).max(65).required(),
      department: Joi.string().required(),
      position: Joi.string().required(),
      phone: Joi.string().pattern(/^1[3-9]\d{9}$/).allow('', null),
      email: Joi.string().email().allow('', null),
      status: Joi.string().valid('active', 'resigned', 'on_leave').default('active')
    });

    const { error, value } = schema.validate(data);
    if (error) throw new ValidationError(error.details.map(d => d.message).join(', '));

    return await this.employeeModel.create(value);
  }

  /**
   * @description 更新员工信息
   * @param {number} id - 员工 ID
   * @param {Object} data - 更新数据
   * @returns {Promise<Object>} 更新后的员工
   * @throws {NotFoundError} 员工不存在
   */
  async updateEmployee(id, data) {
    const paramSchema = Joi.object({ id: Joi.number().integer().positive().required() });
    const { error: paramError } = paramSchema.validate({ id });
    if (paramError) throw new ValidationError(paramError.details.map(d => d.message).join(', '));

    const dataSchema = Joi.object({
      employeeNo: Joi.string().min(3).max(20),
      name: Joi.string().min(2).max(20),
      gender: Joi.string().valid('male', 'female'),
      age: Joi.number().integer().min(18).max(65),
      department: Joi.string(),
      position: Joi.string(),
      phone: Joi.string().pattern(/^1[3-9]\d{9}$/).allow('', null),
      email: Joi.string().email().allow('', null),
      status: Joi.string().valid('active', 'resigned', 'on_leave')
    }).min(1);

    const { error: dataError, value } = dataSchema.validate(data);
    if (dataError) throw new ValidationError(dataError.details.map(d => d.message).join(', '));

    const employee = await this.employeeModel.findByPk(id);
    if (!employee) throw new NotFoundError('员工不存在');

    await employee.update(value);
    return employee;
  }

  /**
   * @description 删除员工
   * @param {number} id - 员工 ID
   * @returns {Promise<void>}
   * @throws {NotFoundError} 员工不存在
   */
  async deleteEmployee(id) {
    const schema = Joi.object({ id: Joi.number().integer().positive().required() });
    const { error } = schema.validate({ id });
    if (error) throw new ValidationError(error.details.map(d => d.message).join(', '));

    const employee = await this.employeeModel.findByPk(id);
    if (!employee) throw new NotFoundError('员工不存在');

    await employee.destroy();
  }
}

module.exports = EmployeeService;
