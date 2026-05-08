const express = require('express');
const router = express.Router();
const logger = require('../config/logger');
const { User } = require('../models');
const UserService = require('../services/userService');
const {
  UserController,
  loginValidator,
  updateProfileValidator,
  updatePasswordValidator
} = require('../controllers/userController');

const userService = new UserService(User, logger);
const controller = new UserController(userService);

router.get('/', controller.findAll.bind(controller));
router.post('/login', loginValidator, controller.login.bind(controller));
router.put('/profile', updateProfileValidator, controller.updateProfile.bind(controller));
router.put('/password', updatePasswordValidator, controller.updatePassword.bind(controller));

module.exports = router;
