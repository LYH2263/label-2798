const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { NotFoundError, ValidationError, UnauthorizedError } = require('../utils/errors');

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

class UserService {
  constructor(userModel, logger) {
    this.User = userModel;
    this.logger = logger;
  }

  /**
   * @description 获取所有用户列表（排除密码）
   * @returns {Promise<Array>} 用户数组
   */
  async findAll() {
    const users = await this.User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    this.logger.info('获取用户列表请求');
    return users;
  }

  /**
   * @description 根据ID获取用户（排除密码）
   * @param {number} id - 用户ID
   * @returns {Promise<Object>} 用户对象
   * @throws {NotFoundError} 用户不存在时抛出
   */
  async findById(id) {
    const user = await this.User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    return user;
  }

  /**
   * @description 用户登录验证
   * @param {Object} credentials - 登录凭证
   * @param {string} credentials.username - 用户名
   * @param {string} credentials.password - 密码
   * @returns {Promise<Object>} 用户信息（不含密码）
   * @throws {ValidationError} 参数验证失败时抛出
   * @throws {UnauthorizedError} 用户名或密码错误时抛出
   */
  async login(credentials) {
    const { error, value } = loginSchema.validate(credentials);
    if (error) {
      throw new ValidationError(error.details.map(d => d.message).join('; '));
    }

    const { username, password } = value;
    this.logger.info(`用户登录请求: ${username}`);

    const user = await this.User.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedError('用户名或密码错误');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('账户已被禁用');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('用户名或密码错误');
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role
    };
  }

  /**
   * @description 更新用户个人信息
   * @param {Object} data - 更新数据
   * @param {number} data.id - 用户ID
   * @param {string} data.username - 新用户名
   * @returns {Promise<Object>} 更新后的用户信息
   * @throws {ValidationError} 参数验证失败时抛出
   * @throws {NotFoundError} 用户不存在时抛出
   */
  async updateProfile(data) {
    const { error, value } = updateProfileSchema.validate(data);
    if (error) {
      throw new ValidationError(error.details.map(d => d.message).join('; '));
    }

    const { id, username } = value;
    this.logger.info(`更新个人信息请求: ${username}`);

    const user = await this.User.findByPk(id);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    await user.update({ username });

    return {
      id: user.id,
      username: user.username,
      role: user.role
    };
  }

  /**
   * @description 修改用户密码
   * @param {Object} data - 密码数据
   * @param {number} data.id - 用户ID
   * @param {string} data.oldPassword - 原密码
   * @param {string} data.newPassword - 新密码
   * @returns {Promise<void>}
   * @throws {ValidationError} 参数验证失败时抛出
   * @throws {NotFoundError} 用户不存在时抛出
   * @throws {UnauthorizedError} 原密码错误时抛出
   */
  async updatePassword(data) {
    const { error, value } = updatePasswordSchema.validate(data);
    if (error) {
      throw new ValidationError(error.details.map(d => d.message).join('; '));
    }

    const { id, oldPassword, newPassword } = value;
    this.logger.info('修改密码请求');

    const user = await this.User.findByPk(id);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('原密码错误');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });
  }
}

module.exports = UserService;
