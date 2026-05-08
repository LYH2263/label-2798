const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const logger = require('./config/logger');
const { syncDatabase, User, Employee, Product } = require('./models');
const errorHandler = require('./middlewares/errorHandler');

const userRoutes = require('./routes/users');
const employeeRoutes = require('./routes/employees');
const productRoutes = require('./routes/products');

const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3001;

/**
 * @description 初始化演示数据
 * @returns {Promise<void>}
 */
const seedDemoData = async () => {
  try {
    const userCount = await User.count();
    if (userCount === 0) {
      logger.info('初始化用户演示数据...');
      const hashedPassword = await bcrypt.hash('123456', 10);
      await User.bulkCreate([
        { username: 'admin', password: hashedPassword, role: 'admin', status: 'active' },
        { username: 'manager', password: hashedPassword, role: 'manager', status: 'active' },
        { username: 'staff', password: hashedPassword, role: 'staff', status: 'active' }
      ]);
      logger.info('用户演示数据初始化完成');
    }

    const employeeCount = await Employee.count();
    if (employeeCount === 0) {
      logger.info('初始化员工演示数据...');
      await Employee.bulkCreate([
        { employeeNo: 'EMP001', name: '张三', gender: 'male', age: 28, department: '技术部', position: '工程师', phone: '13800138001', email: 'zhangsan@company.com' },
        { employeeNo: 'EMP002', name: '李四', gender: 'female', age: 25, department: '人事部', position: '专员', phone: '13800138002', email: 'lisi@company.com' },
        { employeeNo: 'EMP003', name: '王五', gender: 'male', age: 32, department: '财务部', position: '主管', phone: '13800138003', email: 'wangwu@company.com' },
        { employeeNo: 'EMP004', name: '赵六', gender: 'female', age: 27, department: '技术部', position: '设计师', phone: '13800138004', email: 'zhaoliu@company.com' },
        { employeeNo: 'EMP005', name: '钱七', gender: 'male', age: 35, department: '销售部', position: '经理', phone: '13800138005', email: 'qianqi@company.com' },
        { employeeNo: 'EMP006', name: '孙八', gender: 'female', age: 29, department: '市场部', position: '专员', phone: '13800138006', email: 'sunba@company.com' },
        { employeeNo: 'EMP007', name: '周九', gender: 'male', age: 26, department: '技术部', position: '前端开发', phone: '13800138007', email: 'zhoujiu@company.com' },
        { employeeNo: 'EMP008', name: '吴十', gender: 'female', age: 31, department: '运营部', position: '主管', phone: '13800138008', email: 'wushi@company.com' }
      ]);
      logger.info('员工演示数据初始化完成');
    }

    const productCount = await Product.count();
    if (productCount === 0) {
      logger.info('初始化商品演示数据...');
      await Product.bulkCreate([
        { productCode: 'P001', name: '笔记本电脑', category: '电子产品', brand: '联想', unit: '台', price: 5999.00, cost: 4500.00, stock: 50, minStock: 10, maxStock: 100, warehouse: '主仓库', location: 'A01', supplier: '联想科技有限公司' },
        { productCode: 'P002', name: '无线鼠标', category: '电子产品', brand: '罗技', unit: '个', price: 129.00, cost: 80.00, stock: 200, minStock: 50, maxStock: 500, warehouse: '主仓库', location: 'B02', supplier: '罗技国际有限公司' },
        { productCode: 'P003', name: '机械键盘', category: '电子产品', brand: '雷柏', unit: '个', price: 299.00, cost: 180.00, stock: 5, minStock: 20, maxStock: 100, warehouse: '主仓库', location: 'B03', supplier: '雷柏科技股份有限公司' },
        { productCode: 'P004', name: '27寸显示器', category: '电子产品', brand: '戴尔', unit: '台', price: 1599.00, cost: 1200.00, stock: 30, minStock: 10, maxStock: 50, warehouse: '主仓库', location: 'A02', supplier: '戴尔(中国)有限公司' },
        { productCode: 'P005', name: 'USB-C数据线', category: '配件', brand: '绿联', unit: '根', price: 29.90, cost: 15.00, stock: 500, minStock: 100, maxStock: 1000, warehouse: '副仓库', location: 'C01', supplier: '绿联科技有限公司' },
        { productCode: 'P006', name: '移动硬盘1TB', category: '存储设备', brand: '西部数据', unit: '个', price: 399.00, cost: 280.00, stock: 0, minStock: 20, maxStock: 100, warehouse: '主仓库', location: 'D01', supplier: '西部数据科技(中国)有限公司' },
        { productCode: 'P007', name: '路由器Wi-Fi6', category: '网络设备', brand: '华为', unit: '台', price: 499.00, cost: 350.00, stock: 45, minStock: 15, maxStock: 80, warehouse: '主仓库', location: 'E01', supplier: '华为终端有限公司' },
        { productCode: 'P008', name: '智能音箱', category: '智能设备', brand: '小度', unit: '个', price: 199.00, cost: 120.00, stock: 120, minStock: 30, maxStock: 200, warehouse: '副仓库', location: 'F01', supplier: '百度在线网络技术有限公司' },
        { productCode: 'P009', name: '蓝牙耳机', category: '音频设备', brand: '索尼', unit: '个', price: 899.00, cost: 650.00, stock: 60, minStock: 20, maxStock: 100, warehouse: '主仓库', location: 'G01', supplier: '索尼(中国)有限公司' },
        { productCode: 'P010', name: '平板电脑', category: '电子产品', brand: '苹果', unit: '台', price: 3299.00, cost: 2800.00, stock: 25, minStock: 10, maxStock: 50, warehouse: '主仓库', location: 'A03', supplier: '苹果电子产品商贸(北京)有限公司' }
      ]);
      logger.info('商品演示数据初始化完成');
    }
  } catch (error) {
    logger.error('初始化数据失败:', error.message);
  }
};

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'x-user-info']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/products', productRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

/**
 * @description 启动服务器
 * @returns {Promise<void>}
 */
const startServer = async () => {
  try {
    let retries = 5;
    while (retries > 0) {
      try {
        await syncDatabase();
        await seedDemoData();
        break;
      } catch (error) {
        retries--;
        logger.warn(`数据库连接失败，剩余重试次数: ${retries}`);
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`服务器启动成功，端口: ${PORT}`);
    });
  } catch (error) {
    logger.error('服务器启动失败:', error.message);
    process.exit(1);
  }
};

startServer();
