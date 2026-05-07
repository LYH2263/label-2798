const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeNo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'employee_no'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female'),
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  position: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  email: {
    type: DataTypes.STRING(100)
  },
  hireDate: {
    type: DataTypes.DATE,
    field: 'hire_date'
  },
  status: {
    type: DataTypes.ENUM('active', 'resigned', 'on_leave'),
    defaultValue: 'active'
  }
}, {
  tableName: 'employees',
  timestamps: true
});

module.exports = Employee;