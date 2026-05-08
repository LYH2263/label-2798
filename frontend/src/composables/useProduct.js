import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct as deleteProductApi,
  updateStock as updateStockApi
} from '../api/productApi'

export const useProduct = () => {
  const productList = ref([])
  const total = ref(0)
  const loading = ref(false)
  const submitLoading = ref(false)
  const stockLoading = ref(false)

  const searchForm = reactive({
    keyword: '',
    category: '',
    status: ''
  })

  const pagination = reactive({
    page: 1,
    pageSize: 10
  })

  const fetchList = async () => {
    loading.value = true
    try {
      const res = await getProducts({
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: searchForm.keyword,
        category: searchForm.category,
        status: searchForm.status
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

  const handleSearch = () => {
    pagination.page = 1
    fetchList()
  }

  const handleReset = () => {
    searchForm.keyword = ''
    searchForm.category = ''
    searchForm.status = ''
    pagination.page = 1
    fetchList()
  }

  const handleSizeChange = (val) => {
    pagination.pageSize = val
    fetchList()
  }

  const handleCurrentChange = (val) => {
    pagination.page = val
    fetchList()
  }

  const handleAdd = async (data) => {
    submitLoading.value = true
    try {
      const res = await createProduct(data)
      if (res.status === 201) {
        ElMessage.success('创建成功')
        fetchList()
        return true
      }
    } catch (error) {
      ElMessage.error('创建失败')
    } finally {
      submitLoading.value = false
    }
    return false
  }

  const handleEdit = async (id, data) => {
    submitLoading.value = true
    try {
      const res = await updateProduct(id, data)
      if (res.status === 200) {
        ElMessage.success('更新成功')
        fetchList()
        return true
      }
    } catch (error) {
      ElMessage.error('更新失败')
    } finally {
      submitLoading.value = false
    }
    return false
  }

  const handleDelete = async (row) => {
    try {
      await ElMessageBox.confirm(`确定要删除商品 "${row.name}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await deleteProductApi(row.id)
      ElMessage.success('删除成功')
      fetchList()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  const handleStockUpdate = async (id, data) => {
    stockLoading.value = true
    try {
      const res = await updateStockApi(id, data)
      if (res.status === 200) {
        ElMessage.success('库存更新成功')
        fetchList()
        return true
      }
    } catch (error) {
      ElMessage.error('库存更新失败')
    } finally {
      stockLoading.value = false
    }
    return false
  }

  const getStatusType = (status) => {
    const types = { normal: 'success', low_stock: 'warning', out_of_stock: 'danger', discontinued: 'info' }
    return types[status] || 'info'
  }

  const getStatusText = (status) => {
    const texts = { normal: '正常', low_stock: '库存不足', out_of_stock: '缺货', discontinued: '已停售' }
    return texts[status] || status
  }

  const getStockColor = (stock, minStock) => {
    if (stock === 0) return '#f56c6c'
    if (stock < minStock) return '#e6a23c'
    return '#67c23a'
  }

  return {
    productList,
    total,
    loading,
    submitLoading,
    stockLoading,
    searchForm,
    pagination,
    fetchList,
    handleSearch,
    handleReset,
    handleSizeChange,
    handleCurrentChange,
    handleAdd,
    handleEdit,
    handleDelete,
    handleStockUpdate,
    getStatusType,
    getStatusText,
    getStockColor
  }
}
