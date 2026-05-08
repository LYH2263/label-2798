const { UnauthorizedError } = require('../utils/errors');

/**
 * @description 身份认证中间件
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express next 函数
 * @returns {void}
 */
const auth = (req, res, next) => {
  const userInfo = req.headers['x-user-info'];

  if (!userInfo) {
    return next(new UnauthorizedError('请先登录'));
  }

  try {
    req.user = JSON.parse(userInfo);
    next();
  } catch (err) {
    next(new UnauthorizedError('无效的用户信息'));
  }
};

module.exports = auth;
