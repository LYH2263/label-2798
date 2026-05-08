/**
 * @description 根据库存数量计算商品状态
 * @param {number} stock - 当前库存数量
 * @param {number} minStock - 最低库存阈值
 * @returns {string} 库存状态 (normal, low_stock, out_of_stock)
 */
const calculateStockStatus = (stock, minStock) => {
  if (stock === 0) return 'out_of_stock';
  if (stock < (minStock || 10)) return 'low_stock';
  return 'normal';
};

/**
 * @description 构建分页查询参数
 * @param {Object} query - 请求查询参数
 * @returns {Object} 包含 where 条件、limit、offset 的分页对象
 */
const buildPagination = (query) => {
  const page = parseInt(query.page) || 1;
  const pageSize = parseInt(query.pageSize) || 10;
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
};

module.exports = {
  calculateStockStatus,
  buildPagination
};
