<template>
  <div class="product-manage">
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="关键字">
          <el-input v-model="searchForm.keyword" placeholder="商品名称/编码" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="请选择" clearable style="width: 150px">
            <el-option label="电子产品" value="电子产品" /><el-option label="配件" value="配件" />
            <el-option label="存储设备" value="存储设备" /><el-option label="网络设备" value="网络设备" />
            <el-option label="智能设备" value="智能设备" /><el-option label="音频设备" value="音频设备" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="正常" value="normal" /><el-option label="库存不足" value="low_stock" />
            <el-option label="缺货" value="out_of_stock" /><el-option label="已停售" value="discontinued" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </el-form-item>
        <el-form-item class="add-btn-item">
          <el-button type="primary" @click="openAddDialog" class="add-btn"><el-icon><Plus /></el-icon>新增商品</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card product-table" shadow="never" v-loading="loading">
      <el-table :data="productList" class="data-table" stripe border style="width: 100%" :header-cell-style="{ background: '#f5f7fa', fontWeight: 600 }">
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="productCode" label="商品编码" width="110" align="center" />
        <el-table-column prop="name" label="商品名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="100" align="center">
          <template #default="{ row }"><el-tag type="info" size="small">{{ row.category }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="brand" label="品牌" width="100" align="center" />
        <el-table-column prop="unit" label="单位" width="70" align="center" />
        <el-table-column prop="price" label="售价" width="100" align="right">
          <template #default="{ row }"><span style="color: #f56c6c">¥{{ row.price }}</span></template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" align="center">
          <template #default="{ row }"><span :style="{ color: getStockColor(row.stock, row.minStock) }">{{ row.stock }}</span></template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="warehouse" label="仓库" width="100" align="center" />
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openStockDialog(row)"><el-icon><Box /></el-icon>库存</el-button>
            <el-button type="primary" link size="small" @click="openEditDialog(row)"><el-icon><Edit /></el-icon>编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)"><el-icon><Delete /></el-icon>删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize" :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange" background />
      </div>
    </el-card>

    <ProductDialog v-model="dialogVisible" :title="dialogTitle" :edit-data="currentEditData" :loading="submitLoading" @submit="onDialogSubmit" />

    <el-dialog v-model="stockDialogVisible" title="库存管理" width="500px" destroy-on-close :close-on-click-modal="false">
      <div class="stock-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="商品编码">{{ currentProduct.productCode }}</el-descriptions-item>
          <el-descriptions-item label="商品名称">{{ currentProduct.name }}</el-descriptions-item>
          <el-descriptions-item label="当前库存">
            <span :style="{ color: getStockColor(currentProduct.stock, currentProduct.minStock), fontSize: '18px', fontWeight: 'bold' }">{{ currentProduct.stock }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="单位">{{ currentProduct.unit }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <el-form ref="stockFormRef" :model="stockForm" :rules="stockRules" label-width="80px" style="margin-top: 20px">
        <el-form-item label="操作类型">
          <el-radio-group v-model="stockForm.type">
            <el-radio label="in">入库</el-radio><el-radio label="out">出库</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="stockForm.quantity" :min="1" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stockDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="stockLoading" @click="handleStockSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useProduct } from '../composables/useProduct'
import ProductDialog from './ProductDialog.vue'
import '../styles/manage.css'
import '../styles/product.css'

const {
  productList, total, loading, submitLoading, stockLoading, searchForm, pagination,
  fetchList, handleSearch, handleReset, handleSizeChange, handleCurrentChange,
  handleAdd, handleEdit, handleDelete, handleStockUpdate,
  getStatusType, getStatusText, getStockColor
} = useProduct()

const dialogVisible = ref(false)
const dialogTitle = ref('新增商品')
const isEdit = ref(false)
const currentId = ref(null)
const currentEditData = ref(null)

const stockDialogVisible = ref(false)
const stockFormRef = ref()
const currentProduct = ref({ productCode: '', name: '', stock: 0, unit: '', minStock: 10 })
const stockForm = reactive({ type: 'in', quantity: 1 })
const stockRules = { quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }] }

const openAddDialog = () => {
  isEdit.value = false
  dialogTitle.value = '新增商品'
  currentId.value = null
  currentEditData.value = null
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑商品'
  currentId.value = row.id
  currentEditData.value = { ...row }
  dialogVisible.value = true
}

const onDialogSubmit = async (formData) => {
  let success
  if (isEdit.value) success = await handleEdit(currentId.value, formData)
  else success = await handleAdd(formData)
  if (success) dialogVisible.value = false
}

const openStockDialog = (row) => {
  currentProduct.value = { ...row }
  stockForm.type = 'in'
  stockForm.quantity = 1
  stockDialogVisible.value = true
}

const handleStockSubmit = async () => {
  const valid = await stockFormRef.value.validate().catch(() => false)
  if (!valid) return
  const success = await handleStockUpdate(currentProduct.value.id, stockForm)
  if (success) stockDialogVisible.value = false
}

onMounted(() => fetchList())
</script>
