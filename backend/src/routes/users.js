const express = require('express');
const router = express.Router();
const logger = require('../config/logger');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

// 获取所有用户
router.get('/', async (req, res) => {
  try {
    logger.info('获取用户列表请求');
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json({ status: 200, data: users, message: '获取成功' });
  } catch (error) {
    logger.error('获取用户列表失败:', error.message);
    res.status(500).json({ status: 500, message: '服务器错误' });
  }
});

// 用户登录验证
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    logger.info(`用户登录请求: ${username}`);
    
    if (!username || !password) {
      return res.status(400).json({ status: 400, message: '用户名和密码不能为空' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ status: 401, message: '用户名或密码错误' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: 401, message: '用户名或密码错误' });
    }

    res.json({
      status: 200,
      data: {
        id: user.id,
        username: user.username,
        role: user.role
      },
      message: '登录成功'
    });
  } catch (error) {
    logger.error('登录失败:', error.message);
    res.status(500).json({ status: 500, message: '服务器错误' });
  }
});

// 更新个人信息
router.put('/profile', async (req, res) => {
  try {
    const { id, username } = req.body;
    logger.info(`更新个人信息请求: ${username}`);

    if (!id || !username) {
      return res.status(400).json({ status: 400, message: '用户信息不完整' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ status: 404, message: '用户不存在' });
    }

    await user.update({ username });
    res.json({
      status: 200,
      data: {
        id: user.id,
        username: user.username,
        role: user.role
      },
      message: '更新成功'
    });
  } catch (error) {
    logger.error('更新个人信息失败:', error.message);
    res.status(500).json({ status: 500, message: '服务器错误' });
  }
});

// 修改密码
router.put('/password', async (req, res) => {
  try {
    const { id, oldPassword, newPassword } = req.body;
    logger.info('修改密码请求');

    if (!id || !oldPassword || !newPassword) {
      return res.status(400).json({ status: 400, message: '密码信息不完整' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ status: 404, message: '用户不存在' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: 401, message: '原密码错误' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });
    res.json({ status: 200, message: '密码修改成功' });
  } catch (error) {
    logger.error('修改密码失败:', error.message);
    res.status(500).json({ status: 500, message: '服务器错误' });
  }
});

module.exports = router;
