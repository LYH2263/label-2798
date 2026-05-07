const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productCode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'product_code'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  brand: {
    type: DataTypes.STRING(50)
  },
  unit: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '个'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2)
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  minStock: {
    type: DataTypes.INTEGER,
    field: 'min_stock',
    defaultValue: 10
  },
  maxStock: {
    type: DataTypes.INTEGER,
    field: 'max_stock',
    defaultValue: 1000
  },
  warehouse: {
    type: DataTypes.STRING(50)
  },
  location: {
    type: DataTypes.STRING(50)
  },
  supplier: {
    type: DataTypes.STRING(100)
  },
  description: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('normal', 'low_stock', 'out_of_stock', 'discontinued'),
    defaultValue: 'normal'
  }
}, {
  tableName: 'products',
  timestamps: true
});

module.exports = Product;