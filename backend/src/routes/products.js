const express = require('express');
const router = express.Router();
const { Product } = require('../models');
const logger = require('../config/logger');
const { Op } = require('sequelize');

// 获取商品列表（分页、搜索）
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '', category = '', status = '' } = req.query;
    
    const where = {};
    
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { productCode: { [Op.like]: `%${keyword}%` } }
      ];
    }
    
    if (category) {
      where.category = category;
    }
    
    if (status) {
      where.status = status;
    }
    
    const pageNum = parseInt(page) || 1;
    const sizeNum = parseInt(pageSize) || 10;
    const offset = (pageNum - 1) * sizeNum;
    
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      limit: sizeNum,
      offset: offset,
      order: [['createdAt', 'DESC']]
    });
    
    logger.info(`获取商品列表: 共 ${count} 条记录, keyword: ${keyword}, category: ${category}, status: ${status}`);
    
    res.json({
      status: 200,
      data: {
        list: products,
        total: count,
        page: pageNum,
        pageSize: sizeNum
      },
      message: '获取成功'
    });
  } catch (error) {
    logger.error('获取商品列表失败:', error.message);
    res.status(500).json({ status: 500, message: '服务器错误' });
  }
});

// 获取单个商品
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ status: 404, message: '商品不存在' });
    }
    res.json({ status: 200, data: product, message: '获取成功' });
  } catch (error) {
    logger.error('获取商品详情失败:', error.message);
    res.status(500).json({ status: 500, message: '服务器错误' });
  }
});

// 创建商品
router.post('/', async (req, res) => {
  try {
    // 根据库存数量设置状态
    const { stock, minStock } = req.body;
    let status = 'normal';
    if (stock === 0) {
      status = 'out_of_stock';
    } else if (stock < (minStock || 10)) {
      status = 'low_stock';
    }
    
    const product = await Product.create({ ...req.body, status });
    logger.info(`创建商品: ${product.name}`);
    res.json({ status: 201, data: product, message: '创建成功' });
  } catch (error) {
    logger.error('创建商品失败:', error.message);
    res.status(500).json({ status: 500, message: error.message });
  }
});

// 更新商品
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ status: 404, message: '商品不存在' });
    }
    
    // 根据库存数量更新状态
    const { stock, minStock } = { ...product.dataValues, ...req.body };
    let status = 'normal';
    if (stock === 0) {
      status = 'out_of_stock';
    } else if (stock < (minStock || 10)) {
      status = 'low_stock';
    }
    
    await product.update({ ...req.body, status });
    logger.info(`更新商品: ${product.name}`);
    res.json({ status: 200, data: product, message: '更新成功' });
  } catch (error) {
    logger.error('更新商品失败:', error.message);
    res.status(500).json({ status: 500, message: error.message });
  }
});

// 删除商品
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ status: 404, message: '商品不存在' });
    }
    
    await product.destroy();
    logger.info(`删除商品: ${product.name}`);
    res.json({ status: 200, message: '删除成功' });
  } catch (error) {
    logger.error('删除商品失败:', error.message);
    res.status(500).json({ status: 500, message: '服务器错误' });
  }
});

// 更新库存
router.patch('/:id/stock', async (req, res) => {
  try {
    const { quantity, type } = req.body; // type: 'in' 入库, 'out' 出库
    
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ status: 404, message: '商品不存在' });
    }
    
    let newStock = parseInt(product.stock);
    if (type === 'in') {
      newStock += parseInt(quantity);
    } else if (type === 'out') {
      if (newStock < parseInt(quantity)) {
        return res.status(400).json({ status: 400, message: '库存不足' });
      }
      newStock -= parseInt(quantity);
    } else {
      return res.status(400).json({ status: 400, message: '无效的操作类型' });
    }
    
    // 更新状态
    let status = 'normal';
    if (newStock === 0) {
      status = 'out_of_stock';
    } else if (newStock < (product.minStock || 10)) {
      status = 'low_stock';
    }
    
    await product.update({ stock: newStock, status });
    logger.info(`更新商品库存: ${product.name}, 数量: ${quantity}, 类型: ${type}`);
    res.json({ status: 200, data: product, message: '库存更新成功' });
  } catch (error) {
    logger.error('更新库存失败:', error.message);
    res.status(500).json({ status: 500, message: '服务器错误' });
  }
});

module.exports = router;