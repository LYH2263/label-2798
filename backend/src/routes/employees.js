const express = require('express');
const router = express.Router();
const logger = require('../config/logger');
const { Employee } = require('../models');
const EmployeeService = require('../services/employeeService');

const employeeService = new EmployeeService(Employee);

/**
 * @description 获取员工列表（分页、搜索）
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await employeeService.getEmployees(req.query);
    logger.info(`获取员工列表: 共 ${result.total} 条记录`);
    res.json({ status: 200, data: result, message: '获取成功' });
  } catch (err) {
    next(err);
  }
});

/**
 * @description 获取单个员工详情
 */
router.get('/:id', async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    res.json({ status: 200, data: employee, message: '获取成功' });
  } catch (err) {
    next(err);
  }
});

/**
 * @description 创建员工
 */
router.post('/', async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployee(req.body);
    logger.info(`创建员工: ${employee.name}`);
    res.json({ status: 201, data: employee, message: '创建成功' });
  } catch (err) {
    next(err);
  }
});

/**
 * @description 更新员工
 */
router.put('/:id', async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployee(req.params.id, req.body);
    logger.info(`更新员工: ${employee.name}`);
    res.json({ status: 200, data: employee, message: '更新成功' });
  } catch (err) {
    next(err);
  }
});

/**
 * @description 删除员工
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await employeeService.deleteEmployee(req.params.id);
    logger.info(`删除员工 ID: ${req.params.id}`);
    res.json({ status: 200, message: '删除成功' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
