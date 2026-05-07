<template>
  <div class="product-manage">
    <!-- 搜索筛选区 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="关键字">
          <el-input
            v-model="searchForm.keyword"
            placeholder="商品名称/编码"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="请选择" clearable style="width: 150px">
            <el-option label="电子产品" value="电子产品" />
            <el-option label="配件" value="配件" />
            <el-option label="存储设备" value="存储设备" />
            <el-option label="网络设备" value="网络设备" />
            <el-option label="智能设备" value="智能设备" />
            <el-option label="音频设备" value="音频设备" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="正常" value="normal" />
            <el-option label="库存不足" value="low_stock" />
            <el-option label="缺货" value="out_of_stock" />
            <el-option label="已停售" value="discontinued" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
        <el-form-item class="add-btn-item">
          <el-button type="primary" @click="handleAdd" class="add-btn">
            <el-icon><Plus /></el-icon>
            新增商品
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never" v-loading="loading">
      <el-table
        :data="productList"
        class="data-table"
        stripe
        border
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', fontWeight: 600 }"
      >
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="productCode" label="商品编码" width="110" align="center" />
        <el-table-column prop="name" label="商品名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="brand" label="品牌" width="100" align="center" />
        <el-table-column prop="unit" label="单位" width="70" align="center" />
        <el-table-column prop="price" label="售价" width="100" align="right">
          <template #default="{ row }">
            <span style="color: #f56c6c">¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" align="center">
          <template #default="{ row }">
            <span :style="{ color: getStockColor(row.stock, row.minStock) }">{{ row.stock }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="warehouse" label="仓库" width="100" align="center" />
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleStock(row)">
              <el-icon><Box /></el-icon>库存
            </el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="650px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
        class="dialog-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品编码" prop="productCode">
              <el-input v-model="form.productCode" placeholder="请输入商品编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入商品名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
                <el-option label="电子产品" value="电子产品" />
                <el-option label="配件" value="配件" />
                <el-option label="存储设备" value="存储设备" />
                <el-option label="网络设备" value="网络设备" />
                <el-option label="智能设备" value="智能设备" />
                <el-option label="音频设备" value="音频设备" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品牌" prop="brand">
              <el-input v-model="form.brand" placeholder="请输入品牌" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-select v-model="form.unit" placeholder="请选择" style="width: 100%">
                <el-option label="个" value="个" />
                <el-option label="台" value="台" />
                <el-option label="件" value="件" />
                <el-option label="盒" value="盒" />
                <el-option label="箱" value="箱" />
                <el-option label="套" value="套" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="售价" prop="price">
              <el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="成本价" prop="cost">
              <el-input-number v-model="form.cost" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="初始库存" prop="stock">
              <el-input-number v-model="form.stock" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最小库存" prop="minStock">
              <el-input-number v-model="form.minStock" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大库存" prop="maxStock">
              <el-input-number v-model="form.maxStock" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="仓库" prop="warehouse">
              <el-input v-model="form.warehouse" placeholder="请输入仓库" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="货位" prop="location">
              <el-input v-model="form.location" placeholder="请输入货位" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="供应商" prop="supplier">
          <el-input v-model="form.supplier" placeholder="请输入供应商" />
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入商品描述" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 库存管理对话框 -->
    <el-dialog
      v-model="stockDialogVisible"
      title="库存管理"
      width="500px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div class="stock-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="商品编码">{{ currentProduct.productCode }}</el-descriptions-item>
          <el-descriptions-item label="商品名称">{{ currentProduct.name }}</el-descriptions-item>
          <el-descriptions-item label="当前库存">
            <span :style="{ color: getStockColor(currentProduct.stock, currentProduct.minStock), fontSize: '18px', fontWeight: 'bold' }">
              {{ currentProduct.stock }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="单位">{{ currentProduct.unit }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <el-form ref="stockFormRef" :model="stockForm" :rules="stockRules" label-width="80px" style="margin-top: 20px">
        <el-form-item label="操作类型">
          <el-radio-group v-model="stockForm.type">
            <el-radio label="in">入库</el-radio>
            <el-radio label="out">出库</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="stockForm.quantity" :min="1" style="width: 100%" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="stockDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="stockLoading" @click="handleStockSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '../utils/http'

// 搜索表单
const searchForm = reactive({
  keyword: '',
  category: '',
  status: ''
})

// 分页相关
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const productList = ref([])

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增商品')
const formRef = ref()
const submitLoading = ref(false)
const isEdit = ref(false)
const currentId = ref(null)

// 库存对话框相关
const stockDialogVisible = ref(false)
const stockFormRef = ref()
const stockLoading = ref(false)
const currentProduct = ref({ productCode: '', name: '', stock: 0, unit: '', minStock: 10 })
const stockForm = reactive({
  type: 'in',
  quantity: 1
})

// 表单数据
const form = reactive({
  productCode: '',
  name: '',
  category: '',
  brand: '',
  unit: '个',
  price: 0,
  cost: 0,
  stock: 0,
  minStock: 10,
  maxStock: 1000,
  warehouse: '',
  location: '',
  supplier: '',
  description: ''
})

// 表单验证规则
const formRules = {
  productCode: [
    { required: true, message: '请输入商品编码', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  unit: [{ required: true, message: '请选择单位', trigger: 'change' }],
  price: [{ required: true, message: '请输入售价', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
}

const stockRules = {
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }]
}

// 获取商品列表
const fetchProductList = async () => {
  loading.value = true
  try {
    const res = await http.get('/products', {
      params: {
        page: page.value,
        pageSize: pageSize.value,
        keyword: searchForm.keyword,
        category: searchForm.category,
        status: searchForm.status
      }
    })
    if (res.status === 200) {
      productList.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  page.value = 1
  fetchProductList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.category = ''
  searchForm.status = ''
  page.value = 1
  fetchProductList()
}

// 分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchProductList()
}

// 页码变化
const handleCurrentChange = (val) => {
  page.value = val
  fetchProductList()
}

// 状态显示
const getStatusType = (status) => {
  const types = { normal: 'success', low_stock: 'warning', out_of_stock: 'danger', discontinued: 'info' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { normal: '正常', low_stock: '库存不足', out_of_stock: '缺货', discontinued: '已停售' }
  return texts[status] || status
}

// 库存颜色
const getStockColor = (stock, minStock) => {
  if (stock === 0) return '#f56c6c'
  if (stock < minStock) return '#e6a23c'
  return '#67c23a'
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增商品'
  currentId.value = null
  Object.assign(form, {
    productCode: '',
    name: '',
    category: '',
    brand: '',
    unit: '个',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 10,
    maxStock: 1000,
    warehouse: '',
    location: '',
    supplier: '',
    description: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑商品'
  currentId.value = row.id
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除商品 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await http.delete(`/products/${row.id}`)
      ElMessage.success('删除成功')
      fetchProductList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 库存管理
const handleStock = (row) => {
  currentProduct.value = { ...row }
  stockForm.type = 'in'
  stockForm.quantity = 1
  stockDialogVisible.value = true
}

// 提交库存操作
const handleStockSubmit = async () => {
  const valid = await stockFormRef.value.validate().catch(() => false)
  if (!valid) return
  
  stockLoading.value = true
  try {
    const res = await http.patch(`/products/${currentProduct.value.id}/stock`, stockForm)
    if (res.status === 200) {
      ElMessage.success('库存更新成功')
      stockDialogVisible.value = false
      fetchProductList()
    }
  } catch (error) {
    ElMessage.error('库存更新失败')
  } finally {
    stockLoading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  submitLoading.value = true
  try {
    if (isEdit.value) {
      const res = await http.put(`/products/${currentId.value}`, form)
      if (res.status === 200) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        fetchProductList()
      }
    } else {
      const res = await http.post('/products', form)
      if (res.status === 201) {
        ElMessage.success('创建成功')
        dialogVisible.value = false
        fetchProductList()
      }
    }
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  fetchProductList()
})
</script>

<style scoped>
.product-manage {
  padding: 16px;
  animation: fadeIn 0.5s ease-out;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.add-btn {
  height: 44px;
  padding: 0 24px;
  font-weight: 600;
  border-radius: 12px;
}

.search-card {
  margin-bottom: 0;
  border: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.85) !important;
}

.search-card :deep(.el-card__body) {
  padding: 16px 18px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.search-form :deep(.el-form-item) {
  margin-right: 0;
  align-items: center;
}

.search-form :deep(.el-form-item__label) {
  color: var(--text-secondary);
  font-weight: 600;
}

.add-btn-item {
  margin-left: auto;
  margin-right: 0 !important;
}

.table-card {
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.95) !important;
}

.table-card :deep(.el-card__body) {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

:deep(.el-table) {
  --el-table-border-color: #edf2f7;
  --el-table-header-bg-color: #f8fafc;
}

.data-table :deep(.el-table__body-wrapper) {
  max-height: calc(100vh - 450px);
  overflow: auto;
  scrollbar-width: none;
}

.data-table :deep(.el-table__body-wrapper::-webkit-scrollbar) {
  width: 0;
  height: 0;
}

:deep(.el-table__row) {
  transition: background-color 0.2s ease;
}

:deep(.el-table__row:hover > td.el-table__cell) {
  background-color: #f0f4ff !important;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

:deep(.el-tag--small) {
  border-radius: 6px;
  font-weight: 600;
  padding: 0 10px;
}
</style>
