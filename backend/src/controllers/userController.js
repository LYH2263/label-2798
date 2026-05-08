const Joi = require('joi');
const logger = require('../config/logger');
const { validateBody } = require('../middlewares/validator');

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  id: Joi.number().integer().required(),
  username: Joi.string().min(3).max(20).required()
});

const updatePasswordSchema = Joi.object({
  id: Joi.number().integer().required(),
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

class UserController {
  constructor(userService) {
    this.service = userService;
  }

  /**
   * @description 获取所有用户列表
   * @param {Object} req - Express 请求对象
   * @param {Object} res - Express 响应对象
   * @param {Function} next - Express 中间件函数
   * @returns {Promise<void>}
   */
  async findAll(req, res, next) {
    try {
      const users = await this.service.findAll();
      res.json({
        status: 200,
        data: users,
        message: '获取成功'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 用户登录
   * @param {Object} req - Express 请求对象
   * @param {Object} res - Express 响应对象
   * @param {Function} next - Express 中间件函数
   * @returns {Promise<void>}
   */
  async login(req, res, next) {
    try {
      const user = await this.service.login(req.body);
      res.json({
        status: 200,
        data: user,
        message: '登录成功'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 更新个人信息
   * @param {Object} req - Express 请求对象
   * @param {Object} res - Express 响应对象
   * @param {Function} next - Express 中间件函数
   * @returns {Promise<void>}
   */
  async updateProfile(req, res, next) {
    try {
      const user = await this.service.updateProfile(req.body);
      res.json({
        status: 200,
        data: user,
        message: '更新成功'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @description 修改密码
   * @param {Object} req - Express 请求对象
   * @param {Object} res - Express 响应对象
   * @param {Function} next - Express 中间件函数
   * @returns {Promise<void>}
   */
  async updatePassword(req, res, next) {
    try {
      await this.service.updatePassword(req.body);
      res.json({
        status: 200,
        message: '密码修改成功'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = {
  UserController,
  loginValidator: validateBody(loginSchema),
  updateProfileValidator: validateBody(updateProfileSchema),
  updatePasswordValidator: validateBody(updatePasswordSchema)
};
