const Joi = require('joi');
const logger = require('../config/logger');
const { validateBody } = require('../middlewares/validator');

const createSchema = Joi.object({
  employeeNo: Joi.string().required(),
  name: Joi.string().required(),
  gender: Joi.string().valid('male', 'female').required(),
  age: Joi.number().integer().min(18).max(65).required(),
  department: Joi.string().required(),
  position: Joi.string().required(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).allow('').optional(),
  email: Joi.string().email().allow('').optional(),
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
  status: Joi.string().valid('active', 'resigned', 'on_leave').optional()
});

class EmployeeController {
  constructor(employeeService) {
    this.service = employeeService;
  }

  /**
   * @description 获取员工列表（分页、搜索）
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
   * @description 获取单个员工详情
   * @param {Object} req - Express 请求对象
   * @param {Object} res - Express 响应对象
   * @param {Function} next - Express 中间件函数
   * @returns {Promise<void>}
   */
  async findById(req, res, next) {
    try {
      const employee = await this.service.findById(req.params.id);
      res.json({
        status: 200,
        data: employee,
        message: '获取成功'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 创建员工
   * @param {Object} req - Express 请求对象
   * @param {Object} res - Express 响应对象
   * @param {Function} next - Express 中间件函数
   * @returns {Promise<void>}
   */
  async create(req, res, next) {
    try {
      const employee = await this.service.create(req.body);
      res.status(201).json({
        status: 201,
        data: employee,
        message: '创建成功'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 更新员工信息
   * @param {Object} req - Express 请求对象
   * @param {Object} res - Express 响应对象
   * @param {Function} next - Express 中间件函数
   * @returns {Promise<void>}
   */
  async update(req, res, next) {
    try {
      const employee = await this.service.update(req.params.id, req.body);
      res.json({
        status: 200,
        data: employee,
        message: '更新成功'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 删除员工
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
}

module.exports = {
  EmployeeController,
  createValidator: validateBody(createSchema),
  updateValidator: validateBody(updateSchema)
};
