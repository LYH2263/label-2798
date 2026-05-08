const express = require('express');
const router = express.Router();
const logger = require('../config/logger');
const { Product } = require('../models');
const ProductService = require('../services/productService');

const productService = new ProductService(Product);

/**
 * @description 获取商品列表（分页、搜索）
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.query);
    logger.info(`获取商品列表: 共 ${result.total} 条记录`);
    res.json({ status: 200, data: result, message: '获取成功' });
  } catch (err) {
    next(err);
  }
});

/**
 * @description 获取单个商品详情
 */
router.get('/:id', async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json({ status: 200, data: product, message: '获取成功' });
  } catch (err) {
    next(err);
  }
});

/**
 * @description 创建商品
 */
router.post('/', async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    logger.info(`创建商品: ${product.name}`);
    res.json({ status: 201, data: product, message: '创建成功' });
  } catch (err) {
    next(err);
  }
});

/**
 * @description 更新商品
 */
router.put('/:id', async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    logger.info(`更新商品: ${product.name}`);
    res.json({ status: 200, data: product, message: '更新成功' });
  } catch (err) {
    next(err);
  }
});

/**
 * @description 删除商品
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    logger.info(`删除商品 ID: ${req.params.id}`);
    res.json({ status: 200, message: '删除成功' });
  } catch (err) {
    next(err);
  }
});

/**
 * @description 更新库存
 */
router.patch('/:id/stock', async (req, res, next) => {
  try {
    const { quantity, type } = req.body;
    const product = await productService.updateStock(req.params.id, type, quantity);
    logger.info(`更新商品库存: ${product.name}, 数量: ${quantity}, 类型: ${type}`);
    res.json({ status: 200, data: product, message: '库存更新成功' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
