const Joi = require('joi');
const bcrypt = require('bcryptjs');
const { NotFoundError, ValidationError, UnauthorizedError } = require('../utils/errors');

class UserService {
  /**
   * @description 构造函数，通过依赖注入接收 User 模型
   * @param {Object} userModel - Sequelize User 模型
   */
  constructor(userModel) {
    this.userModel = userModel;
  }

  /**
   * @description 获取所有用户列表
   * @returns {Promise<Array>} 用户列表（不含密码）
   */
  async getAllUsers() {
    return await this.userModel.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * @description 用户登录验证
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<Object>} 用户基本信息
   * @throws {ValidationError} 参数验证失败
   * @throws {UnauthorizedError} 用户名或密码错误
   */
  async login(username, password) {
    const schema = Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required()
    });

    const { error } = schema.validate({ username, password });
    if (error) throw new ValidationError('用户名和密码不能为空');

    const user = await this.userModel.findOne({ where: { username } });
    if (!user) throw new UnauthorizedError('用户名或密码错误');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedError('用户名或密码错误');

    return { id: user.id, username: user.username, role: user.role };
  }

  /**
   * @description 更新用户个人信息
   * @param {number} id - 用户 ID
   * @param {string} username - 新用户名
   * @returns {Promise<Object>} 更新后的用户信息
   * @throws {ValidationError} 参数验证失败
   * @throws {NotFoundError} 用户不存在
   */
  async updateProfile(id, username) {
    const schema = Joi.object({
      id: Joi.number().integer().positive().required(),
      username: Joi.string().min(2).max(50).required()
    });

    const { error } = schema.validate({ id, username });
    if (error) throw new ValidationError(error.details.map(d => d.message).join(', '));

    const user = await this.userModel.findByPk(id);
    if (!user) throw new NotFoundError('用户不存在');

    await user.update({ username });
    return { id: user.id, username: user.username, role: user.role };
  }

  /**
   * @description 修改用户密码
   * @param {number} id - 用户 ID
   * @param {string} oldPassword - 原密码
   * @param {string} newPassword - 新密码
   * @returns {Promise<void>}
   * @throws {ValidationError} 参数验证失败
   * @throws {NotFoundError} 用户不存在
   * @throws {UnauthorizedError} 原密码错误
   */
  async changePassword(id, oldPassword, newPassword) {
    const schema = Joi.object({
      id: Joi.number().integer().positive().required(),
      oldPassword: Joi.string().required(),
      newPassword: Joi.string().min(6).required()
    });

    const { error } = schema.validate({ id, oldPassword, newPassword });
    if (error) throw new ValidationError(error.details.map(d => d.message).join(', '));

    const user = await this.userModel.findByPk(id);
    if (!user) throw new NotFoundError('用户不存在');

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new UnauthorizedError('原密码错误');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });
  }
}

module.exports = UserService;
