const express = require('express');
const router = express.Router();
const logger = require('../config/logger');
const { Product } = require('../models');
const ProductService = require('../services/productService');
const {
  ProductController,
  createValidator,
  updateValidator,
  updateStockValidator
} = require('../controllers/productController');

const productService = new ProductService(Product, logger);
const controller = new ProductController(productService);

router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findById.bind(controller));
router.post('/', createValidator, controller.create.bind(controller));
router.put('/:id', updateValidator, controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));
router.patch('/:id/stock', updateStockValidator, controller.updateStock.bind(controller));

module.exports = router;
