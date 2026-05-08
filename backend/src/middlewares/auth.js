const { UnauthorizedError } = require('../utils/errors');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      throw new UnauthorizedError('未登录，请先登录');
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new UnauthorizedError('用户不存在或已被删除');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('账户已被禁用');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

const authOptional = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];

    if (userId) {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });
      if (user && user.status === 'active') {
        req.user = user;
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('未登录，请先登录');
      }

      if (!roles.includes(req.user.role)) {
        throw new UnauthorizedError('权限不足');
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  auth,
  authOptional,
  requireRole
};
