<template>
  <div class="employee-manage">
    <!-- 搜索筛选区 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="关键字">
          <el-input
            v-model="searchForm.keyword"
            placeholder="姓名/工号"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="searchForm.department" placeholder="请选择" clearable style="width: 150px">
            <el-option label="技术部" value="技术部" />
            <el-option label="人事部" value="人事部" />
            <el-option label="财务部" value="财务部" />
            <el-option label="销售部" value="销售部" />
            <el-option label="市场部" value="市场部" />
            <el-option label="运营部" value="运营部" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="在职" value="active" />
            <el-option label="离职" value="resigned" />
            <el-option label="休假" value="on_leave" />
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
            新增员工
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never" v-loading="loading">
      <el-table
        :data="employeeList"
        class="data-table"
        stripe
        border
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', fontWeight: 600 }"
      >
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="employeeNo" label="工号" width="100" align="center" />
        <el-table-column prop="name" label="姓名" width="100" align="center" />
        <el-table-column prop="gender" label="性别" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.gender === 'male' ? 'primary' : 'danger'" size="small">
              {{ row.gender === 'male' ? '男' : '女' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="80" align="center" />
        <el-table-column prop="department" label="部门" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.department }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="position" label="职位" width="120" align="center" />
        <el-table-column prop="phone" label="电话" width="130" align="center" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
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
      width="550px"
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
            <el-form-item label="工号" prop="employeeNo">
              <el-input v-model="form.employeeNo" placeholder="请输入工号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio label="male">男</el-radio>
                <el-radio label="female">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年龄" prop="age">
              <el-input-number v-model="form.age" :min="18" :max="65" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="部门" prop="department">
              <el-select v-model="form.department" placeholder="请选择部门" style="width: 100%">
                <el-option label="技术部" value="技术部" />
                <el-option label="人事部" value="人事部" />
                <el-option label="财务部" value="财务部" />
                <el-option label="销售部" value="销售部" />
                <el-option label="市场部" value="市场部" />
                <el-option label="运营部" value="运营部" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职位" prop="position">
              <el-input v-model="form.position" placeholder="请输入职位" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">在职</el-radio>
            <el-radio label="resigned">离职</el-radio>
            <el-radio label="on_leave">休假</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleFormSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { usePagination } from '../composables/usePagination'
import { useDialog } from '../composables/useDialog'
import { employeeApi } from '../api'

const searchForm = reactive({
  keyword: '',
  department: '',
  status: ''
})

const formRef = ref()

const form = reactive({
  employeeNo: '',
  name: '',
  gender: 'male',
  age: 25,
  department: '',
  position: '',
  phone: '',
  email: '',
  status: 'active'
})

const formRules = {
  employeeNo: [
    { required: true, message: '请输入工号', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  position: [{ required: true, message: '请输入职位', trigger: 'blur' }],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const fetchList = (params = {}) => {
  const queryParams = {
    ...params,
    keyword: searchForm.keyword,
    department: searchForm.department,
    status: searchForm.status
  }
  return employeeApi.getList(queryParams)
}

const {
  page,
  pageSize,
  total,
  list: employeeList,
  loading,
  fetchData: fetchEmployeeList,
  reset: resetPagination,
  handleSizeChange,
  handleCurrentChange
} = usePagination(fetchList)

const validateForm = async () => {
  if (!formRef.value) return false
  await formRef.value.validate()
  return true
}

const {
  dialogVisible,
  dialogTitle,
  submitLoading,
  openAdd,
  openEdit,
  handleDelete: deleteEmployee,
  handleSubmit
} = useDialog({
  form,
  formRef,
  fetchData: fetchEmployeeList,
  defaultForm: {
    employeeNo: '',
    name: '',
    gender: 'male',
    age: 25,
    department: '',
    position: '',
    phone: '',
    email: '',
    status: 'active'
  },
  createFn: (data) => employeeApi.create(data),
  updateFn: (id, data) => employeeApi.update(id, data),
  deleteFn: (id) => employeeApi.delete(id)
})

const getStatusType = (status) => {
  const types = { active: 'success', resigned: 'danger', on_leave: 'warning' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { active: '在职', resigned: '离职', on_leave: '休假' }
  return texts[status] || status
}

const handleSearch = () => {
  resetPagination()
  fetchEmployeeList()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.department = ''
  searchForm.status = ''
  resetPagination()
  fetchEmployeeList()
}

const handleAdd = () => {
  openAdd()
}

const handleEdit = (row) => {
  openEdit(row)
}

const handleDelete = (row) => {
  deleteEmployee(row, `确定要删除员工 "${row.name}" 吗？`)
}

const handleFormSubmit = () => {
  handleSubmit(validateForm)
}

onMounted(() => {
  fetchEmployeeList()
})
</script>

<style scoped>
.employee-manage {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.5s ease-out;
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
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.35);
}

.search-card {
  margin-bottom: 0;
  border-radius: 12px;
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
  border-radius: 12px;
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

.data-table :deep(.el-table__body-wrapper) {
  max-height: calc(100vh - 450px);
  overflow: auto;
  scrollbar-width: none;
}

.data-table :deep(.el-table__body-wrapper::-webkit-scrollbar) {
  width: 0;
  height: 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.dialog-form {
  padding: 10px 0;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #ebeef5;
  padding: 20px;
  margin: 0;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid #ebeef5;
  padding: 20px;
}

@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
  }
  
  .search-form :deep(.el-form-item) {
    margin-right: 0;
    width: 100%;
  }
  
  .search-form :deep(.el-form-item__content) {
    width: 100%;
  }
  
  .search-form :deep(.el-input),
  .search-form :deep(.el-select) {
    width: 100% !important;
  }
}
</style>
