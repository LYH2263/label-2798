const express = require('express');
const router = express.Router();
const { Employee } = require('../models');
const logger = require('../config/logger');
const { Op } = require('sequelize');

// 获取员工列表（分页、搜索）
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '', department = '', status = '' } = req.query;
    
    const pageNum = parseInt(page) || 1;
    const sizeNum = parseInt(pageSize) || 10;
    const offset = (pageNum - 1) * sizeNum;
    
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
    
    const { count, rows: employees } = await Employee.findAndCountAll({
      where,
      limit: sizeNum,
      offset: offset,
      order: [['createdAt', 'DESC']]
    });
    
    logger.info(`获取员工列表: 共 ${count} 条记录, keyword: ${keyword}, department: ${department}, status: ${status}`);
    
    res.json({
      status: 200,
      data: {
        list: employees,
        total: count,
        page: pageNum,
        pageSize: sizeNum
      },
      message: '获取成功'
    });
  } catch (error) {
    logger.error('获取员工列表失败:', error.message);
    res.status(500).json({ status: 500, message: '服务器错误' });
  }
});

// 获取单个员工
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ status: 404, message: '员工不存在' });
    }
    res.json({ status: 200, data: employee, message: '获取成功' });
  } catch (error) {
    logger.error('获取员工详情失败:', error.message);
    res.status(500).json({ status: 500, message: '服务器错误' });
  }
});

// 创建员工
router.post('/', async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    logger.info(`创建员工: ${employee.name}`);
    res.json({ status: 201, data: employee, message: '创建成功' });
  } catch (error) {
    logger.error('创建员工失败:', error.message);
    res.status(500).json({ status: 500, message: error.message });
  }
});

// 更新员工
router.put('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ status: 404, message: '员工不存在' });
    }
    
    await employee.update(req.body);
    logger.info(`更新员工: ${employee.name}`);
    res.json({ status: 200, data: employee, message: '更新成功' });
  } catch (error) {
    logger.error('更新员工失败:', error.message);
    res.status(500).json({ status: 500, message: error.message });
  }
});

// 删除员工
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ status: 404, message: '员工不存在' });
    }
    
    await employee.destroy();
    logger.info(`删除员工: ${employee.name}`);
    res.json({ status: 200, message: '删除成功' });
  } catch (error) {
    logger.error('删除员工失败:', error.message);
    res.status(500).json({ status: 500, message: '服务器错误' });
  }
});

module.exports = router;