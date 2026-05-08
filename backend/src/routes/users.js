const express = require('express');
const router = express.Router();
const logger = require('../config/logger');
const { User } = require('../models');
const UserService = require('../services/userService');

const userService = new UserService(User);

/**
 * @description 获取所有用户列表
 */
router.get('/', async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    logger.info('获取用户列表请求');
    res.json({ status: 200, data: users, message: '获取成功' });
  } catch (err) {
    next(err);
  }
});

/**
 * @description 用户登录
 */
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const userInfo = await userService.login(username, password);
    logger.info(`用户登录成功: ${username}`);
    res.json({ status: 200, data: userInfo, message: '登录成功' });
  } catch (err) {
    next(err);
  }
});

/**
 * @description 更新个人信息
 */
router.put('/profile', async (req, res, next) => {
  try {
    const { id, username } = req.body;
    const userInfo = await userService.updateProfile(id, username);
    logger.info(`更新个人信息: ${username}`);
    res.json({ status: 200, data: userInfo, message: '更新成功' });
  } catch (err) {
    next(err);
  }
});

/**
 * @description 修改密码
 */
router.put('/password', async (req, res, next) => {
  try {
    const { id, oldPassword, newPassword } = req.body;
    await userService.changePassword(id, oldPassword, newPassword);
    logger.info('修改密码成功');
    res.json({ status: 200, message: '密码修改成功' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
