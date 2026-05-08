import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee as deleteEmployeeApi
} from '../api/employeeApi'

export const useEmployee = () => {
  const employeeList = ref([])
  const total = ref(0)
  const loading = ref(false)
  const submitLoading = ref(false)

  const searchForm = reactive({
    keyword: '',
    department: '',
    status: ''
  })

  const pagination = reactive({
    page: 1,
    pageSize: 10
  })

  const fetchList = async () => {
    loading.value = true
    try {
      const res = await getEmployees({
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: searchForm.keyword,
        department: searchForm.department,
        status: searchForm.status
      })
      if (res.status === 200) {
        employeeList.value = res.data.list
        total.value = res.data.total
      }
    } catch (error) {
      ElMessage.error('获取员工列表失败')
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
    searchForm.department = ''
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
      const res = await createEmployee(data)
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
      const res = await updateEmployee(id, data)
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
      await ElMessageBox.confirm(`确定要删除员工 "${row.name}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await deleteEmployeeApi(row.id)
      ElMessage.success('删除成功')
      fetchList()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  const getStatusType = (status) => {
    const types = { active: 'success', resigned: 'danger', on_leave: 'warning' }
    return types[status] || 'info'
  }

  const getStatusText = (status) => {
    const texts = { active: '在职', resigned: '离职', on_leave: '休假' }
    return texts[status] || status
  }

  return {
    employeeList,
    total,
    loading,
    submitLoading,
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
    getStatusType,
    getStatusText
  }
}
