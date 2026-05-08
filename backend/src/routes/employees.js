const express = require('express');
const router = express.Router();
const logger = require('../config/logger');
const { Employee } = require('../models');
const EmployeeService = require('../services/employeeService');
const {
  EmployeeController,
  createValidator,
  updateValidator
} = require('../controllers/employeeController');

const employeeService = new EmployeeService(Employee, logger);
const controller = new EmployeeController(employeeService);

router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findById.bind(controller));
router.post('/', createValidator, controller.create.bind(controller));
router.put('/:id', updateValidator, controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

module.exports = router;
